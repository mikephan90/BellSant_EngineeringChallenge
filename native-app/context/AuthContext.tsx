import React, {createContext, useContext, useReducer, useEffect, ReactNode} from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRootNavigation} from "expo-router";
import {StackActions} from "@react-navigation/native";

export enum AuthActionTypes {
    LOG_IN = "SIGN_IN",
    LOG_OUT = "SIGN_OUT",
    SET_USERNAME = "SET_USERNAME",
}

// Interface for the structure of this authentication using a token
interface AuthState {
    username?: string | null;
    isAuthenticated?: boolean;
    token?: string | null;
}

// Define authentication actions
type AuthAction = {
    type: AuthActionTypes.LOG_IN | AuthActionTypes.LOG_OUT | AuthActionTypes.SET_USERNAME
    payload?: string;
}

// Actions to be used outside of this context
interface AuthContextType extends AuthState {
    login: (username: string, password: string) => void;
    logOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case AuthActionTypes.SET_USERNAME:
            return {
                ...state,
                username: action.payload,
            }
        case AuthActionTypes.LOG_IN:
            // Save the user credentials to local
            return {
                ...state,
                isAuthenticated: true,
                token: action.payload || null,
            };
        case AuthActionTypes.LOG_OUT:
            // Empty out credentials to force login
            console.log("Logged out")
            return {
                ...state,
                isAuthenticated: false,
                token: null,
            };
        default:
            return state;
    }
};

interface AuthProviderProps {
    children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(
      authReducer,
      { username: null, isAuthenticated: false, token: null }
    );
    const navigation = useRootNavigation();

    const authenticateUser = async (username: string, password: string) => {
        // Hardcoded user data; Would further enhance this with a backend service given more time
        if (username === "test" && password === 'test' || username === "user" && password === 'user') {
            const hardCodedToken = 'hardCodedTokenForThisChallenge';
            return { success: true, token: hardCodedToken }
        } else {
            return { success: false, error: ('Login failure. Invalid credentials') };
        }
    }

    const login = async (username: string, password: string) => {
        // Get authentication status
        const authResult = await authenticateUser(username, password);
        if (authResult.success) {
            // Add token to state and set username (used for API calls)
            dispatch({ type: AuthActionTypes.LOG_IN, payload:  authResult.token });
            dispatch({ type: AuthActionTypes.SET_USERNAME, payload : username})
            try {
                await AsyncStorage.setItem('token', authResult.token);
            } catch (error) {
                console.error('Error saving token to AsyncStorage:', error)
            }
            // @ts-ignore
            navigation.navigate('(tabs)');
        } else {
            console.error('Login failure. Invalid credentials');
        }
    };

    const logOut = async () => {
        dispatch({ type: AuthActionTypes.LOG_OUT });
        try {
            await AsyncStorage.removeItem('token');
            // This is currently bugged and machine data is removed, but need to implement a refresh
            await AsyncStorage.removeItem('machineData');
            // Navigate back to the login screen
            navigation.dispatch(StackActions.pop(1));
        } catch (error) {
            console.error('Error removing token to AsyncStorage:', error)
        }
    };

    useEffect(() => {
        // Upon app open and load, check to see if the user has an existing token. If so skip login
        const checkToken = async () => {
            try {
                const storedToken: string = await AsyncStorage.getItem('token');
                console.log("Stored token: " + storedToken);
                if (storedToken) {
                    // @ts-ignore
                    navigation.navigate('(tabs)')
                }
            } catch (error) {
                console.error('Error reading token from AsyncStorage:', error);
            }
        }
        checkToken();
    }, [state.isAuthenticated]);

    return <AuthContext.Provider value={{ ...state, login, logOut }}>{children}</AuthContext.Provider>
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error ('useAuth must be used within the AuthProvider');
    }
    return context;
}

export { AuthProvider, useAuth };