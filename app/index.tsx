import { Link } from "expo-router";
import { useState } from "react";
import { TextInput, StyleSheet, Text, Button } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        <Link href="/profile" asChild>
          <Button title="Login" />
        </Link>
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
});

export default Index;
