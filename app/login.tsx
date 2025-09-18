import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword
} from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { Link } from "expo-router";
import { Button, Card, Text, TextInput, Modal, Portal } from 'react-native-paper';

const Login = () => {
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
        signInWithEmailAndPassword(auth, email, password).catch((error) => {
          const errorCode = error.code;

          if (errorCode === "auth/invalid-credential")
            setMessage("An account with this credentials doesn't exists!");
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

  const showModal = () => setForgotPasswordVisible(true);
  const hideModal = () => setForgotPasswordVisible(false);

  return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Portal>
            <Modal visible={forgotPasswordVisible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
              <Card>
                <Card.Title title="Reset Password" titleStyle={styles.title} />
                <Card.Content>
                  <TextInput
                      label="Enter your email"
                      value={forgotPasswordEmail}
                      onChangeText={setForgotPasswordEmail}
                      style={styles.inputModal}
                      mode="outlined"
                  />
                  <Text style={styles.forgotPasswordMessage}>{forgotPasswordMessage}</Text>
                </Card.Content>
                <Card.Actions>
                  <Button onPress={hideModal} textColor="red">Cancel</Button>
                  <Button onPress={handleForgotPassword}>Reset</Button>
                </Card.Actions>
              </Card>
            </Modal>
          </Portal>

          <Card style={styles.card}>
            <Card.Title title="Login" titleStyle={styles.cardTitle} />
            <Card.Content>
              <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  style={styles.input}
                  mode="outlined"
              />
              <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  style={styles.input}
                  mode="outlined"
              />
              <Text style={styles.errorMessage}>{message}</Text>
              <Button
                  mode="contained"
                  onPress={handleSignIn}
                  style={styles.button}
              >
                Login
              </Button>
            </Card.Content>
            <View style={styles.footer}>
              <Text>Don't have an account? </Text>
              <Link href={"/register"}>
                <Text style={styles.linkText}>Create one</Text>
              </Link>
            </View>
            <View style={styles.forgotPasswordContainer}>
              <Button mode="text" onPress={showModal}>
                Forgot your password?
              </Button>
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
    padding: 16,
  },
  card: {
    borderRadius: 15,
    padding: 10,
  },
  cardTitle: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 12,
  },
  inputModal: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    paddingVertical: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  linkText: {
    fontWeight: "bold",
    color: "#6200EE", // Default theme primary color from Paper
  },
  errorMessage: {
    color: "#B00020", // Default theme error color from Paper
    textAlign: "center",
    minHeight: 20,
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginTop: 5,
  },
  modalContainer: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
  },
  forgotPasswordMessage: {
    textAlign: "center",
    marginTop: 10,
    minHeight: 60,
  },
});

export default Login;