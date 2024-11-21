import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator, Button, StyleSheet, Text} from "react-native";
import React, {useEffect, useState} from "react";
import {auth} from "@/firebaseConfig";
import {router} from "expo-router";
import {signOut} from "@firebase/auth";

const Profile = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (auth.currentUser == null)
                router.replace("/login")
            setIsLoading(false)
        }

        setTimeout(() => {
            checkAuth();
        }, 250)
    }, [router])

    if (isLoading)
        return (
            <SafeAreaProvider>
                <SafeAreaView style={[styles.container, styles.horizontal]}>
                    <ActivityIndicator size="large"></ActivityIndicator>
                </SafeAreaView>
            </SafeAreaProvider>)
    else return (
        <SafeAreaView style={styles.container}>
            <Text>My Profile</Text>
            <Button
                title={"Log out"}
                onPress={() => {
                    signOut(auth).then(() => {
                        router.push("/");
                    })
                }}
            ></Button>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
});

export default Profile;