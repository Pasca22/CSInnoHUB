import { auth } from "@/firebaseConfig";
import {ActivityIndicator, StyleSheet} from "react-native";
import {router} from "expo-router";
import React, {useEffect} from "react";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";

const Index = () => {
    useEffect(() => {
        const checkAuth = async () => {
            if (auth.currentUser == null)
                router.replace("/login")
            else
                router.replace("/profile")
        }

        setTimeout(() => {
            checkAuth();
        }, 500)
    }, [router])

    return (
        <SafeAreaProvider>
            <SafeAreaView style={[styles.container, styles.horizontal]}>
                <ActivityIndicator size="large"></ActivityIndicator>
            </SafeAreaView>
        </SafeAreaProvider>)
};

export default Index;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
})