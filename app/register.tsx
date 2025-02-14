import React, {useState} from "react";
import {Button, ScrollView, StyleSheet, Text, TextInput} from "react-native";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {auth, db} from "@/firebaseConfig"
import {doc, setDoc} from "@firebase/firestore";
import {Picker} from "@react-native-picker/picker";

const Register = () => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [department, setDepartment] = useState("");
    const [admissionYear, setAdmissionYear] = useState("");
    const [interests, setInterests] = useState("");
    const currentYear = new Date().getFullYear()

    const handleSignUp = () => {
        try {
            if (!validateName(name))
                throw new Error("auth/invalid-name")
            if (department === "")
                throw new Error("auth/invalid-department")

            createUserWithEmailAndPassword(auth, email, password)
                .then(() => {
                    setDoc(doc(db, "users", "" + auth.currentUser?.uid.toString()), {
                        auth_ref: auth.currentUser?.uid,
                        email: email.toString(),
                        name: name.toString(),
                        department: department,
                        admission_year: admissionYear,
                        profile_photo_url: null,
                        interests: interests,
                    });
                })
                .catch((error) => {
                    const errorCode = error.code

                    if(errorCode === "auth/invalid-email")
                        setMessage("Please enter a valid email address!");
                    else if(errorCode === "auth/missing-password")
                        setMessage("Please enter a valid password!");
                    else if(confirmPassword != password)
                        setMessage("Passwords do not match!");
                    else if(errorCode === "auth/weak-password")
                        setMessage("The password length must be above or equal to 8!");
                })
        }
        catch (error) {
            // @ts-ignore
            const errorCode = error.message;
            
            if (errorCode === "auth/invalid-name")
                setMessage("Please enter a valid name!");
            else if(errorCode === "auth/invalid-department")
                setMessage("Please select your department!");
        }
    }

    return (
        <ScrollView>
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Text>Name</Text>
                <TextInput style={styles.input} onChangeText={setName} value={name} />
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
                <Text>Department</Text>
                <Picker
                    style={{ height: 30, width: 250, marginBottom: 20, marginTop: 10 }}
                    onValueChange={(itemValue) => { // @ts-ignore
                        setDepartment(itemValue)}}>
                    <Picker.Item label="Select your department" value="" />
                    <Picker.Item label="Computer science" value="computer_science" />
                    <Picker.Item label="Mathematics and computer science" value="mathematics_computer_science" />
                    <Picker.Item label="Artificial intelligence" value="artificial_intelligence" />
                    <Picker.Item label="Information Engineering" value="information_engineering" />
                </Picker>
                <Text>Admission year</Text>
                <Picker
                    style={{ height: 30, width: 250, marginBottom: 20, marginTop: 10 }}
                    onValueChange={(itemValue) => { // @ts-ignore
                        setAdmissionYear(itemValue)}}>
                        <Picker.Item label="Select your admission year" value="" />
                    {
                        [...Array(currentYear - 1970 + 1)].map((_,i) =>
                                <Picker.Item key={currentYear - i} label={(currentYear - i).toString()} value={(currentYear - i).toString()}/>
                        )
                    }
                </Picker>
                <Text>Interests (separated by comma)</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setInterests}
                    value={interests}
                ></TextInput>
                <Button
                    title="Register"
                    color="#f1243f"
                    onPress={handleSignUp}
                />
                <Text style={styles.statusMessage}>{message}</Text>

            </SafeAreaView>
        </SafeAreaProvider>
</ScrollView>
    );
};

function validateName(name: string): boolean {
    name = name.trim()
    return /^[A-Za-z\s]+$/.test(name);
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
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