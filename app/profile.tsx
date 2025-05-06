import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator, Button, Modal, StyleSheet, Text, TextInput, View} from "react-native";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {AuthContext} from "@/app/index";
import Login from "@/app/login";
import {EmailAuthProvider, reauthenticateWithCredential, signOut, updateEmail} from "@firebase/auth";
import {auth, db} from "@/firebaseConfig";
import {doc, getDoc} from "firebase/firestore";
import {Picker} from "@react-native-picker/picker";
import {setDoc} from "@firebase/firestore";
import {useFocusEffect} from "expo-router";

const Profile = () => {
    const isAuthenticated = useContext(AuthContext);
    if(!isAuthenticated)
        return <Login/>

    const [admissionYear, setAdmissionYear] = useState("");
    const [department, setDepartment] = useState("");
    const [email, setEmail] = useState("");
    const [interests, setInterests] = useState("");
    const [name, setName] = useState("");
    const [profilePhotoUrl, setProfilePhotoUrl] = useState("");

    const currentYear = new Date().getFullYear()
    const [message, setMessage] = useState("");
    const [updateStatus, setUpdateStatus] = useState(false);
    const [changeEmailVisible, setChangeEmailVisible] = useState(false);
    const [changeEmailEmail, setChangeEmailEmail] = useState("");
    const [changeEmailPassword, setChangeEmailPassword] = useState("");
    const [changeEmailMessage, setChangeEmailMessage] = useState("");
    const [loading, setLoading] = useState(true);

    // auth.onAuthStateChanged(() => {
    //     fetchUserDetails();
    //     if(auth.currentUser != null)
    //         setLoading(false);
    // })
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(() => {
            fetchUserDetails();
            if (auth.currentUser != null)
                setLoading(false);
        });

        // Cleanup on unmount
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        fetchUserDetails();
        setLoading(false);
    }, []);

    const fetchUserDetails = async () => {
        try {
            if (!auth.currentUser)
                return;

            const userRef = doc(db, "users", auth.currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                setAdmissionYear(data["admission_year"] || "");
                setDepartment(data["department"] || "");
                setEmail(data["email"] || "");
                setInterests(data["interests"] || "");
                setName(data["name"] || "");
                setProfilePhotoUrl(data["profile_photo_url"] || "");
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    const updateUserDetails = async () => {
        setMessage("");

        try{
            if(!validateName(name))
                throw new Error("auth/invalid-name")

            setDoc(doc(db, "users", "" + auth.currentUser?.uid.toString()), {
                auth_ref: auth.currentUser?.uid,
                name: name.toString(),
                email: auth.currentUser?.email || "error",
                department: department,
                admission_year: admissionYear,
                profile_photo_url: null,
                interests: interests,
            });

            setUpdateStatus(true);
            setMessage("Details updated successfully!");
        }catch (error){
            // @ts-ignore
            const errorCode = error.message;

            setUpdateStatus(false);
            if (errorCode === "auth/invalid-name")
                setMessage("Please enter a valid name!");
        }
    }

    const updateUserEmail = async () => {
        if(auth.currentUser == null || auth.currentUser.email == null)
            return;

        try{
            const credential = EmailAuthProvider.credential(auth.currentUser?.email, changeEmailPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);

            await updateEmail(auth.currentUser, changeEmailEmail);

            setChangeEmailVisible(false);
            setChangeEmailEmail("");
            setChangeEmailPassword("");
            setChangeEmailMessage("");
            setEmail(auth.currentUser.email);
            updateUserDetails();
        }catch (error : any){
            const errorCode = error.code;
            console.log(errorCode);

            if(errorCode === "auth/invalid-credential")
                setChangeEmailMessage("Password is incorrect!");
            else if(errorCode == "auth/invalid-email")
                setChangeEmailMessage("Please enter a valid email!");
            else if(errorCode == "auth/email-already-in-use")
                setChangeEmailMessage("An account with this email already exists!")
        }
    }

    function validateName(name: string): boolean {
        name = name.trim()
        return /^[A-Za-z\s]+$/.test(name);
    }

    if(loading)
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6200EE" />
                <Text>Loading profile...</Text>
            </View>
        );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>My Profile</Text>
            <View style={styles.detailsContainer}>
                <Text>Name:</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={(name) => {setName(name)}}>
                </TextInput>
                <Text>Email:</Text>
                <TextInput
                    style={[styles.input, styles.disableField]}
                    value={email}
                    pointerEvents={"none"}
                    onChangeText={(email) => {setEmail(email)}}>
                </TextInput>
                <Text>Interests (separated by comma):</Text>
                <TextInput
                    style={styles.input}
                    value={interests}
                    onChangeText={(interests) => {setInterests(interests)}}>
                </TextInput>
                <Text>Department</Text>
                <Picker
                    style={{ height: 30, width: 250, marginBottom: 10, marginTop: 5, borderColor: "#ccc" }}
                    selectedValue={department}
                    onValueChange={(itemValue) => { // @ts-ignore
                        setDepartment(itemValue)}}>
                    <Picker.Item label="Computer science" value="computer_science" />
                    <Picker.Item label="Mathematics and computer science" value="mathematics_computer_science" />
                    <Picker.Item label="Artificial intelligence" value="artificial_intelligence" />
                    <Picker.Item label="Information Engineering" value="information_engineering" />
                </Picker>
                <Text>Admission year</Text>
                <Picker
                    style={{ height: 30, width: 250, marginBottom: 20, marginTop: 5, borderColor: "#ccc" }}
                    selectedValue={admissionYear}
                    onValueChange={(itemValue) => { // @ts-ignore
                        setAdmissionYear(itemValue)}}>
                    {
                        [...Array(currentYear - 1970 + 1)].map((_,i) =>
                            <Picker.Item key={currentYear - i} label={(currentYear - i).toString()} value={(currentYear - i).toString()}/>
                        )
                    }
                </Picker>
                <View style={styles.saveButton}>
                    <Button
                        title={"Change email"}
                        onPress={() => {setChangeEmailVisible(true)}}
                    ></Button>
                </View>
                <View style={styles.saveButton}>
                    <Button
                        title={"Save"}
                        onPress={updateUserDetails}
                    ></Button>
                </View>
                <Text style={updateStatus ? styles.successMessage : styles.errorMessage}>
                    {message !== "" ? message : null}
                </Text>
            </View>
            <View>
                <Button
                    color={"#EE0000FF"}
                    title={"Log out"}
                    onPress={() => {
                        signOut(auth);
                    }}
                ></Button>
            </View>
            <Modal visible={changeEmailVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>Change email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your new email address here"
                            value={changeEmailEmail}
                            onChangeText={(email) => {
                                setChangeEmailEmail(email);
                            }}
                        />
                        <TextInput
                            style={styles.inputNoMarginTop}
                            placeholder="Enter your password here"
                            secureTextEntry={true}
                            value={changeEmailPassword}
                            onChangeText={(password) => {
                                setChangeEmailPassword(password);
                            }}
                        />
                        <Button title="Change email" onPress={() => {
                            if(changeEmailEmail === "") {
                                setChangeEmailMessage("Email field cannot be empty!");
                                return;
                            }
                            if(changeEmailPassword === "") {
                                setChangeEmailMessage("Password field cannot be empty!");
                                return;
                            }

                            updateUserEmail();
                        }} />
                        <Button title="Cancel" onPress={() => {
                            setChangeEmailEmail("");
                            setChangeEmailPassword("");
                            setChangeEmailMessage("");
                            setChangeEmailVisible(false)
                        }} color="red" />
                        <Text style={{textAlign: "center", marginTop: 5, marginBottom: -5}}>{changeEmailMessage}</Text>
                    </View>
                </View>
            </Modal>
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
    saveButton: {
        marginBottom: 10,
    },
    detailsContainer: {
        margin: 20,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 20,
        width: 300,
    },
    input: {
        height: 30,
        marginTop: 2,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: "white"
    },
    inputNoMarginTop: {
        height: 30,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: "white"
    },
    inputNoMarginBottom: {
        height: 30,
        marginTop: 2,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: "white"
    },
    disableField: {
        backgroundColor: "lightgray"
    },
    errorMessage: {
        textAlign: "center",
        color: "#f60000",
    },
    successMessage: {
        textAlign: "center",
        color: "green",
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default Profile;