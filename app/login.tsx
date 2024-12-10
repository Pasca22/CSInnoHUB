import React, { useContext, useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { Card, Button, Text } from "@rneui/themed";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { browserLocalPersistence, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { AuthContext } from "@/app/index";
import Profile from "@/app/profile";
import { Link } from "expo-router";

const Login = () => {
  const isAuthenticated = useContext(AuthContext);
  if (isAuthenticated) return <Profile />;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignIn = () => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        signInWithEmailAndPassword(auth, email, password).catch((error) => {
          const errorCode = error.code;

          if (errorCode === "auth/invalid-email")
            setMessage("Va rugam sa introduceti un email valid!");
          else if (errorCode === "auth/missing-password")
            setMessage("Va rugam sa introduceti o parola!");
          else if (errorCode === "auth/invalid-credential")
            setMessage("Contul nu exista!");
        });
      })
      .catch(() => {});
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Card containerStyle={styles.card}>
          <Card.Title style={styles.cardTitle}>Login</Card.Title>
          <Card.Divider />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Introduceti email-ul"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Introduceti parola"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
          {message ? <Text style={styles.errorMessage}>{message}</Text> : null}
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
    marginBottom: 10,
  },
});

export default Login;
