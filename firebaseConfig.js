import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";

// --- START: Platform-specific auth imports ---
import { Platform } from 'react-native';
import { initializeAuth, getReactNativePersistence, getAuth, browserLocalPersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// --- END: Platform-specific auth imports ---

const firebaseConfig = {
    apiKey: "AIzaSyDEtwss431ze-h50U2w_oLkMSwNsr179s4",
    authDomain: "csinnohub.firebaseapp.com",
    projectId: "csinnohub",
    storageBucket: "csinnohub.firebasestorage.app",
    messagingSenderId: "111878987963",
    appId: "1:111878987963:web:219519b353814912a4099e",
    measurementId: "G-MJFFR5GB9N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- START: Conditional auth initialization ---
let auth;

if (Platform.OS === 'web') {
    // Web-specific persistence
    auth = initializeAuth(app, {
        persistence: browserLocalPersistence,
    });
} else {
    // Native-specific persistence
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
}
// --- END: Conditional auth initialization ---


export { db };
export { auth };