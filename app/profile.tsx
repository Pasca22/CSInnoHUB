import {SafeAreaView} from "react-native-safe-area-context";
import {StyleSheet, Text} from "react-native";

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