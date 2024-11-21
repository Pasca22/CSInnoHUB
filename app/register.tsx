import {router} from "expo-router";
import React, {useEffect, useState} from "react";
import {ActivityIndicator, Button, StyleSheet, Text, TextInput} from "react-native";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "../firebaseConfig"


const Register = () => {

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (auth.currentUser != null)
                router.replace("/profile")
            setIsLoading(false)
        }

        setTimeout(() => {
            checkAuth();
        }, 250)
    }, [router])

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSignUp = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                router.push("/")
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

                if(errorCode == "auth/invalid-email")
                    setMessage("Va rugam introduceti un email valid!");
                else if(errorCode == "auth/missing-password")
                    setMessage("Va rugam introduceti o parola!");
                else if(confirmPassword != password)
                    setMessage("Parolele nu se potrivesc!");
                else if(errorCode == "auth/weak-password")
                    setMessage("Parola trebuie sa aiba minim 8 caractere!");
            });

    }

    if (isLoading)
        return (
            <SafeAreaProvider>
                <SafeAreaView style={[styles.container, styles.horizontal]}>
                    <ActivityIndicator size="large"></ActivityIndicator>
                </SafeAreaView>
            </SafeAreaProvider>)
    else return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Text>Email</Text>
                <TextInput style={styles.input} onChangeText={setEmail} value={email} />
                <Text>Password</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={true}
                />
                <Text>Confirm password</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry={true}
                ></TextInput>
                <Button
                    title="Register"
                    color="#f1243f"
                    onPress={handleSignUp}
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
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
});

export default Register;