import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Adauga Firestore

const firebaseConfig = {
  apiKey: "AIzaSyDEtwss431ze-h50U2w_oLkMSwNsr179s4",
  authDomain: "csinnohub.firebaseapp.com",
  projectId: "csinnohub",
  storageBucket: "csinnohub.appspot.com",
  messagingSenderId: "111878987963",
  appId: "1:111878987963:web:219519b353814912a4099e",
  measurementId: "G-MJFFR5GB9N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initializeaza Firestore

export { db };
