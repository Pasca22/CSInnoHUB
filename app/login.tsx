import React, { useContext, useState } from "react";
import {View, StyleSheet, TextInput, Modal, TouchableOpacity } from "react-native";
import { Card, Button, Text } from "@rneui/themed";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  browserLocalPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword
} from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { AuthContext } from "@/app/index";
import Profile from "@/app/profile";
import { Link } from "expo-router";

const Login = () => {
  const isAuthenticated = useContext(AuthContext);
  if (isAuthenticated) return <Profile />;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");

  const handleSignIn = () => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(email) === true) {
      if(password != "") {
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
              signInWithEmailAndPassword(auth, email, password).catch((error) => {
                const errorCode = error.code;

                if (errorCode === "auth/invalid-credential")
                  setMessage("An account with this credentials doesn't exists!");
              });
            })
            .catch(() => {
            });
      }
      else
          setMessage("Password field cannot be empty!")
    }
    else
      if(email === "")
        setMessage("Email field cannot be empty!")
      else setMessage("Please enter a valid email address!")
  };

  const handleForgotPassword = () => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(forgotPasswordEmail) === true){
      sendPasswordResetEmail(auth, forgotPasswordEmail)
          .then(() => {
            setForgotPasswordMessage("If an account with that email exists, you will receive " +
                "a password reset link shortly. Please check your inbox and spam folder.")
          })
          .catch((error) => {});
    }
    else{
      if(forgotPasswordEmail === "")
        setForgotPasswordMessage("Email field cannot be empty!")
      else setForgotPasswordMessage("Please enter a valid email address!");
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Card containerStyle={styles.card}>
          <Card.Title style={styles.cardTitle}>Login</Card.Title>
          <Card.Divider />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email here"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password here"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
          <Text style={styles.errorMessage}>{message}</Text>
          <Button
            title="Login"
            buttonStyle={styles.button}
            onPress={handleSignIn}
          />
          <View style={styles.footer}>
            <Text>Don't have an account? </Text>
            <Link href={"/register"}>
              <Text style={styles.linkText}>Create one</Text>
            </Link>
          </View>
          <Modal visible={forgotPasswordVisible} animationType="slide" transparent>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.title}>Reset Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email address here"
                    value={forgotPasswordEmail}
                    onChangeText={setForgotPasswordEmail}
                />
                <Button title="Reset Password" onPress={() => {handleForgotPassword()}} />
                <Button title="Cancel" onPress={() => {setForgotPasswordVisible(!forgotPasswordVisible)}} color="red" />
                <Text style={{textAlign: "center", marginTop: 5, marginBottom: -5}}>{forgotPasswordMessage}</Text>
              </View>
            </View>
          </Modal>
          <View style={{alignItems: "flex-end"}}>
            {/*<button style={{background: "none", border: "none"}}*/}
            {/*  onClick={() => {*/}
            {/*    setForgotPasswordVisible(!forgotPasswordVisible);*/}
            {/*  }}>*/}
            {/*  <Text style={{color: "Black"}}>Forgot your password?</Text>*/}
            {/*</button>*/}
            <TouchableOpacity
                onPress={() => {
                  setForgotPasswordVisible(!forgotPasswordVisible);
                }}>
              <Text style={{color: "Black"}}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  card: {
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    height: 40,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#6200EE",
    borderRadius: 10,
    marginTop: 15,
    paddingVertical: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  linkText: {
    color: "#6200EE",
    fontWeight: "bold",
  },
  errorMessage: {
    color: "#FF0000",
    textAlign: "center",
    marginBottom: -5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 430,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputModal: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default Login;
