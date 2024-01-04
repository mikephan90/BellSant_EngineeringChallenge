import express, {Request, Response} from 'express';
import {getMachineHealth} from './machineHealth';
import fs from 'fs';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
const port = 3001;

/*
* NOTE: I created this backend in a way that I could return a response back to the client with
* a history of requests and its responses. This data could be used to form a history section with
* a graph. Just did not have enough time here for this. Also, there is a bug that is causing the
* server to restart at each request and would definitely dig deeper if given more time. I believe
* it has to do with the file writes that are involved.
* */

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(bodyParser.json());

// For this application, there is no db; will use a simple save file to store the data.
const dataPath: string = path.join(__dirname, 'data', 'userData.json');

// Create a data directory to hold the file
const dataDir = path.dirname(dataPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Read user data from file
let userData: { [username: string]: any[] } = {};
try {
  if (fs.existsSync(dataPath)) {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    userData = JSON.parse(rawData);
  } else {
    fs.writeFileSync(dataPath, '{}', 'utf-8'); // Write empty file
  }
} catch (error) {
  console.error(error)
}

// For app sessions create endpoints to return data back to client for user specific info
// GET machine data for specific user
app.get('/machine-data/:username', (req: Request, res: Response) => {
  const username = req.params.username;
  const userMachineData = userData[username] || [];
  res.json(userMachineData);
});

// Endpoint to get machine health score
// Added parameter for username to retrieve data for the user account
app.post('/machine-health/:username', (req: Request, res: Response) => {
  const username = req.params.username;
  const result = getMachineHealth(req);

  function writeData(data: any) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json(result);
  }

  if (result.error) {
    res.status(400).json(result);
  } else {
    // Check to see if there is existing data for the logged in user
    if (!userData[username]) userData[username] = [];

    // Check to see if there are entries for the machine data for the user that already exists
    const existingIndex = userData[username].findIndex((entry: any) =>
      entry.machines === req.body.machines
    );

    if (existingIndex !== -1) {
      // Update existing item with req.body data
      userData[username][existingIndex] = {
        ...userData[username][existingIndex],
        ...req.body,
        machineHealth: result,
      };

      writeData(userData);
    } else {
      // To make sure that we dont have an infinite amount of entries, we can limit it
      userData[username].length > 10 && userData[username].shift();
      userData[username].push({...req.body, machineHealth: result});

      writeData(userData);
    }
  }
});

app.listen(port, () => {
  console.log(`API is listening at http://localhost:${port}`);
});
