import {SafeAreaView} from "react-native-safe-area-context";
import {StyleSheet, Text} from "react-native";
import {useEffect} from "react";
import {auth} from "../firebaseConfig"
import {router} from "expo-router";

const Profile = () => {

    return (
        <SafeAreaView style={styles.container}>
            <Text>My Profile</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default Profile;