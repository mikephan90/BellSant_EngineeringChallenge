import React, {useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {Pressable, StyleSheet, Text, TextInput, View} from "react-native";

const LoginScreen: React.FC = () => {
  // Use custom hook
  const {login} = useAuth();

  // React state to handle credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Handle login action for user, will navigate to main upon successful login
  const handleLogin = async () => {
    login(username, password);
    setUsername('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome!</Text>
      <TextInput
        autoCapitalize="none"
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        autoCapitalize="none"
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </Pressable>

    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  },
  header: {
    textAlign: "center",
    fontSize: 24,
    paddingBottom: 40,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "grey",
    borderRadius: 10,
    margin: 12,
    padding: 4
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
    margin: 28,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  }
});
