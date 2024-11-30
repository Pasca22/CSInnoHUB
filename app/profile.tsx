import {SafeAreaView} from "react-native-safe-area-context";
import {Button, StyleSheet, Text} from "react-native";
import React, {useContext} from "react";
import {AuthContext} from "@/app/index";
import Login from "@/app/login";
import {signOut} from "@firebase/auth";
import firebase from "firebase/compat";
import {auth} from "@/firebaseConfig";

const Profile = () => {
    const isAuthenticated = useContext(AuthContext);
    if(!isAuthenticated)
        return <Login/>

    return (
        <SafeAreaView style={styles.container}>
            <Text>My Profile</Text>
            <Button
                title={"Log out"}
                onPress={() => {
                    signOut(auth);
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