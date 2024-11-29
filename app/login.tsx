import {Link, router} from "expo-router";
import React, {useContext, useState} from "react";
import {Button, StyleSheet, Text, TextInput} from "react-native";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {browserLocalPersistence, setPersistence, signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "../firebaseConfig"
import {AuthContext} from "@/app/index";
import Profile from "@/app/profile";


const Login = () => {
    const isAuthenticated = useContext(AuthContext);
    if(isAuthenticated)
        return <Profile/>

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSignIn = () => {
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                signInWithEmailAndPassword(auth, email, password)
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
            })
            .catch((error) => {});
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
                    secureTextEntry={true}
                />
                <Link
                    href={"/register"}
                    style={{marginBottom: 10}}
                >
                    <Text>Don't have an account? Create one</Text>
                </Link>
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
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
});

export default Login;