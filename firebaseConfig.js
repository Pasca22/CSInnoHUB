import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";

import { Platform } from 'react-native';
import { initializeAuth, getReactNativePersistence, getAuth, browserLocalPersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDEtwss431ze-h50U2w_oLkMSwNsr179s4",
    authDomain: "csinnohub.firebaseapp.com",
    projectId: "csinnohub",
    storageBucket: "csinnohub.firebasestorage.app",
    messagingSenderId: "111878987963",
    appId: "1:111878987963:web:219519b353814912a4099e",
    measurementId: "G-MJFFR5GB9N"
};

// --- Singleton Pattern for Firebase App Initialization ---
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// --- Singleton Pattern for Firebase Auth Initialization ---
// We create a function that either gets the existing Auth instance
// or initializes it with our custom persistence settings.
const getFirebaseAuth = () => {
    try {
        // This will return the existing instance if it exists
        return getAuth(app);
    } catch (error) {
        // This will only run on the first load when auth is not initialized
        if (Platform.OS === 'web') {
            return initializeAuth(app, {
                persistence: browserLocalPersistence,
            });
        } else {
            return initializeAuth(app, {
                persistence: getReactNativePersistence(ReactNativeAsyncStorage),
            });
        }
    }
};

const auth = getFirebaseAuth();
const db = getFirestore(app);

export { db, auth };