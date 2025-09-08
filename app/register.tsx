import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, setDoc } from "@firebase/firestore";

// Import components from react-native-paper
import {
    Button,
    Card,
    Menu,
    Text,
    TextInput,
    Title
} from 'react-native-paper';

// Helper for Department selection
const departmentOptions = [
    { label: "Computer Science", value: "computer_science" },
    { label: "Mathematics & Computer Science", value: "mathematics_computer_science" },
    { label: "Artificial Intelligence", value: "artificial_intelligence" },
    { label: "Information Engineering", value: "information_engineering" }
];

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [department, setDepartment] = useState("");
    const [admissionYear, setAdmissionYear] = useState("");
    const [interests, setInterests] = useState("");

    // State for Menu and Password visibility
    const [departmentMenuVisible, setDepartmentMenuVisible] = useState(false);
    const [admissionYearMenuVisible, setAdmissionYearMenuVisible] = useState(false);
    const [isPasswordSecure, setIsPasswordSecure] = useState(true);
    const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);

    const currentYear = new Date().getFullYear();

    const handleSignUp = () => {
        setMessage("");

        // --- Improved Client-Side Validation ---
        if (!validateName(name)) {
            setMessage("Please enter a valid name!");
            return;
        }
        if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }
        if (department === "") {
            setMessage("Please select your department!");
            return;
        }
        if (admissionYear === "") {
            setMessage("Please select your admission year!");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                // Use the user's UID from the successful creation response
                setDoc(doc(db, "users", user.uid), {
                    auth_ref: user.uid,
                    email: email,
                    name: name,
                    department: department,
                    admission_year: admissionYear,
                    profile_photo_url: null,
                    interests: interests,
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === "auth/invalid-email") {
                    setMessage("Please enter a valid email address!");
                } else if (errorCode === "auth/email-already-in-use") {
                    setMessage("An account with this email already exists!");
                } else if (errorCode === "auth/weak-password") {
                    setMessage("Password must be at least 6 characters long.");
                } else {
                    setMessage("An error occurred. Please try again.");
                }
            });
    };

    const getDepartmentLabel = (value: string) => {
        return departmentOptions.find(option => option.value === value)?.label || "Select Department";
    };

    return (
        <SafeAreaProvider>
            <ScrollView contentContainerStyle={styles.container}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.title}>Create Account</Title>
                        <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.inputSpacing} />
                        <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" mode="outlined" style={styles.inputSpacing} />
                        <TextInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={isPasswordSecure}
                            mode="outlined"
                            style={styles.inputSpacing}
                            right={<TextInput.Icon icon={isPasswordSecure ? "eye-off" : "eye"} onPress={() => setIsPasswordSecure(!isPasswordSecure)} />}
                        />
                        <TextInput
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={isConfirmPasswordSecure}
                            mode="outlined"
                            style={styles.inputSpacing}
                            right={<TextInput.Icon icon={isConfirmPasswordSecure ? "eye-off" : "eye"} onPress={() => setIsConfirmPasswordSecure(!isConfirmPasswordSecure)} />}
                        />

                        {/* Department Menu */}
                        <Menu
                            visible={departmentMenuVisible}
                            onDismiss={() => setDepartmentMenuVisible(false)}
                            anchor={
                                <Button onPress={() => setDepartmentMenuVisible(true)} mode="outlined" icon="chevron-down" contentStyle={styles.menuAnchorButton} style={styles.inputSpacing}>
                                    {getDepartmentLabel(department)}
                                </Button>
                            }>
                            {departmentOptions.map(option => (
                                <Menu.Item key={option.value} onPress={() => { setDepartment(option.value); setDepartmentMenuVisible(false); }} title={option.label} />
                            ))}
                        </Menu>

                        {/* Admission Year Menu */}
                        <Menu
                            visible={admissionYearMenuVisible}
                            onDismiss={() => setAdmissionYearMenuVisible(false)}
                            anchor={
                                <Button onPress={() => setAdmissionYearMenuVisible(true)} mode="outlined" icon="chevron-down" contentStyle={styles.menuAnchorButton} style={styles.inputSpacing}>
                                    {admissionYear || "Select Admission Year"}
                                </Button>
                            }>
                            <ScrollView style={{ maxHeight: 200 }}>
                                {[...Array(currentYear - 1970 + 1)].map((_, i) => {
                                    const year = (currentYear - i).toString();
                                    return <Menu.Item key={year} onPress={() => { setAdmissionYear(year); setAdmissionYearMenuVisible(false); }} title={year} />;
                                })}
                            </ScrollView>
                        </Menu>

                        <TextInput label="Interests (comma separated)" value={interests} onChangeText={setInterests} mode="outlined" style={styles.inputSpacing} />

                        {message ? <Text style={styles.statusMessage}>{message}</Text> : null}

                        <Button mode="contained" onPress={handleSignUp} style={styles.button}>
                            Register
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>
        </SafeAreaProvider>
    );
};

function validateName(name: string): boolean {
    return /^[A-Za-z\s]+$/.test(name.trim());
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        justifyContent: "center",
        backgroundColor: '#f5f5f5',
    },
    card: {
        width: '100%',
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
    },
    inputSpacing: {
        marginBottom: 16,
    },
    menuAnchorButton: {
        height: 40,
        justifyContent: 'center',
    },
    button: {
        marginTop: 8,
        paddingVertical: 4,
    },
    statusMessage: {
        textAlign: 'center',
        color: "#B00020", // Paper's error color
        marginBottom: 16,
    },
});

export default Register;