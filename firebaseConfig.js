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

// --- New Singleton Pattern for App Initialization (avoids getApps) ---
let app;
try {
    app = getApp(); // Try to get the existing default app
} catch (error) {
    // If it fails, initialize the app for the first time
    app = initializeApp(firebaseConfig);
}

// This function already uses a try/catch, so it's safe. No changes needed here.
const getFirebaseAuth = () => {
    try {
        return getAuth(app);
    } catch (error) {
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