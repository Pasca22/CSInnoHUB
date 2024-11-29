import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator, StyleSheet} from "react-native";
import React from "react";

const LoadingAnimation = () => {
    return (
        <SafeAreaProvider>
            <SafeAreaView style={[styles.container, styles.horizontal]}>
                <ActivityIndicator size="large"></ActivityIndicator>
            </SafeAreaView>
        </SafeAreaProvider>)
};

export default LoadingAnimation;

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