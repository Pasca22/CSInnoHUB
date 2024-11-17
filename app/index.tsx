import {Link, router} from "expo-router";
import {useState} from "react";
import {Button, StyleSheet, Text, TextInput} from "react-native";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEtwss431ze-h50U2w_oLkMSwNsr179s4",
  authDomain: "csinnohub.firebaseapp.com",
  projectId: "csinnohub",
  storageBucket: "csinnohub.firebasestorage.app",
  messagingSenderId: "111878987963",
  appId: "1:111878987963:web:219519b353814912a4099e",
  measurementId: "G-MJFFR5GB9N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();

const Index = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          router.push("/profile")
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;

          if(errorCode == "auth/invalid-email")
            setMessage("Va rugam introduceti un email valid!");
          else if(errorCode == "auth/missing-password")
            setMessage("Va rugam introduceti o parola!");
          else if(errorCode == "auth/invalid-credential")
            setMessage("Contul nu exista!");
        });

  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text>Email</Text>
        <TextInput style={styles.input} onChangeText={setEmail} value={email} />
        <Text>Password</Text>
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          value={password}
        />
          <Button
              title="Login"
              color="#f194ff"
              onPress={handleSignIn}
          />
        <Text style={styles.statusMessage}>{message}</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 40,
    width: 300,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  statusMessage: {
    marginTop: 10,
    color: "#f60000",
  }
});

export default Index;
