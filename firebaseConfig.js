import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {useState} from "react";
// import { getAnalytics } from "firebase/analytics";

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
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { db };
export {auth};
