import React, {createContext, useContext, useReducer, useEffect, ReactNode, useCallback} from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

export enum DataActionTypes {
  LOAD_DATA = "LOAD_DATA",
  UPDATE_DATA = "UPDATE_DATA",
  RESET_DATA = "RESET_DATA",
  SET_SCORES = "SET_SCORES",
}

//Data interface for the state of the machine data
interface DataState {
  machineData: {
    machines?: {
      weldingRobot?: {},
      assemblyLine?: {},
      paintingStation?: {},
      qualityControlStation?: {},
    }
    scores?: {
      factory?: {}
      machineScores?: {},
    }
  };
}

// Define machine data actions
type DataAction =
  | { type: DataActionTypes.LOAD_DATA; payload?: {} }
  | { type: DataActionTypes.RESET_DATA }
  | { type: DataActionTypes.UPDATE_DATA; payload: {} }
  | { type: DataActionTypes.SET_SCORES; payload: {} };


// Actions to be used outside of this context
interface DataContextType extends DataState {
  resetData: () => void;
  updateData: (newData: {}) => void;
  setScores: (newScores: {}) => void;
}

const initialState: DataState = {
  machineData: {}
};

const DataContext = createContext<DataContextType | undefined>(undefined);

const dataReducer = (state: DataState, action: DataAction): DataState => {
  // Update actions for state management
  switch (action.type) {
    case DataActionTypes.LOAD_DATA:
      // Load the data from Async into state
      return {
        ...state,
        machineData: action.payload
      };
    case DataActionTypes.RESET_DATA:
      // Remove machine data in state
      return {...state, machineData: undefined};
    case DataActionTypes.UPDATE_DATA:
      // Update data in state
      return {
        ...state,
        machineData: action.payload
      };
    case DataActionTypes.SET_SCORES:
      // Save scores to state
      return {
        ...state,
        machineData: {
          ...state.machineData,
          scores: action.payload
        }
      }
    default:
      return state;
  }
}

interface DataProviderProps {
  children: ReactNode;
}

// Provider, contains the
const DataProvider: React.FC<DataProviderProps> = ({children}) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  /*
    Should make a request on start up for the application to retrieve the data locally.
    NOTE: Would call the the endpoint to get machine data for a particular user. The response data from
    that endpoint contains both the machine health request and response IE:

    REQUEST CALL: GET http://localhost:3001/machine-data/:user
    EXAMPLE RESPONSE: (This endpoint is built in the backend);
      [
        {
          "machines": {
            "paintingStation": {
              "seamWidth": "1"
            },
            "weldingRobot": {
              "electrodeWear": "1",
              "vibrationLevel": "2"
            }
          },
          "machineHealth": {
            "factory": "40.63",
            "machineScores": {
              "paintingStation": "0.00",
              "weldingRobot": "81.25"
            }
          }
        }
      ]
    */
  // Load the locally stored data upon app load
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('machineData');
        if (savedData !== null) {
          dispatch({type: DataActionTypes.LOAD_DATA, payload: JSON.parse(savedData)});
        }
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      }
    };

    loadData();
  }, []);

  // Resets the machine data from state and AsyncStorage
  const resetData = async () => {
    dispatch({type: DataActionTypes.RESET_DATA});
    try {
      await AsyncStorage.removeItem('machineData');
    } catch (error) {
      console.error('Error removing machineData to AsyncStorage:', error)
    }
  };

  // Updates the machine data to state and AsyncStorage
  const updateData = useCallback(async (newData: any) => {
    dispatch({type: DataActionTypes.UPDATE_DATA, payload: newData});
    try {
      await AsyncStorage.setItem('machineData', JSON.stringify(newData));
    } catch (error) {
      console.error('Error writing machineData to AsyncStorage:', error)
    }
  }, []);

  // Sets score data and updates state and AsyncStorage
  const setScores = useCallback(async (newScores: { scores: any; }) => {
    try {
      dispatch({type: DataActionTypes.SET_SCORES, payload: newScores});
      await AsyncStorage.setItem('machineData', JSON.stringify(state.machineData));
    } catch (error) {
      console.error('Error writing scores to AsyncStorage:', error)
    }
  }, [state.machineData]);


  return (
    <DataContext.Provider value={{
      ...state,
      resetData,
      updateData,
      setScores
    }}>{children}</DataContext.Provider>
  );
};

const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within the DataProvider');
  }
  return context;
};

export {DataProvider, useData};