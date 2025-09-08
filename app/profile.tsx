import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updateEmail } from "@firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Import Menu and other components from react-native-paper
import {
    ActivityIndicator,
    Button,
    Card,
    Divider,
    Menu,
    Modal,
    Portal,
    Text,
    TextInput,
    Title,
    useTheme
} from 'react-native-paper';

// Helper object to display department labels
const departmentOptions = [
    { label: "Computer Science", value: "computer_science" },
    { label: "Mathematics & Computer Science", value: "mathematics_computer_science" },
    { label: "Artificial Intelligence", value: "artificial_intelligence" },
    { label: "Information Engineering", value: "information_engineering" }
];

const Profile = () => {
    const [admissionYear, setAdmissionYear] = useState("");
    const [department, setDepartment] = useState("");
    const [email, setEmail] = useState("");
    const [interests, setInterests] = useState("");
    const [name, setName] = useState("");
    const [profilePhotoUrl, setProfilePhotoUrl] = useState("");

    const currentYear = new Date().getFullYear();
    const [message, setMessage] = useState("");
    const [updateStatus, setUpdateStatus] = useState(false);
    const [changeEmailVisible, setChangeEmailVisible] = useState(false);
    const [changeEmailEmail, setChangeEmailEmail] = useState("");
    const [changeEmailPassword, setChangeEmailPassword] = useState("");
    const [changeEmailMessage, setChangeEmailMessage] = useState("");
    const [loading, setLoading] = useState(true);

    // State for Menu visibility
    const [departmentMenuVisible, setDepartmentMenuVisible] = useState(false);
    const [admissionYearMenuVisible, setAdmissionYearMenuVisible] = useState(false);

    const theme = useTheme();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchUserDetails(user.uid);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchUserDetails = async (userId: string) => {
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                setAdmissionYear(data["admission_year"] || "");
                setDepartment(data["department"] || "");
                setEmail(data["email"] || "");
                setInterests(data["interests"] || "");
                setName(data["name"] || "");
                setProfilePhotoUrl(data["profile_photo_url"] || "");
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserDetails = async () => {
        setMessage("");
        if (!auth.currentUser) return;

        try {
            if (!validateName(name)) {
                throw new Error("auth/invalid-name");
            }

            await setDoc(doc(db, "users", auth.currentUser.uid), {
                auth_ref: auth.currentUser.uid,
                name: name,
                email: auth.currentUser.email,
                department: department,
                admission_year: admissionYear,
                profile_photo_url: profilePhotoUrl || null,
                interests: interests,
            });

            setUpdateStatus(true);
            setMessage("Details updated successfully!");
        } catch (error: any) {
            const errorCode = error.message;
            setUpdateStatus(false);
            if (errorCode === "auth/invalid-name") {
                setMessage("Please enter a valid name!");
            }
        }
    };

    const updateUserEmail = async () => {
        if (!auth.currentUser || !auth.currentUser.email) return;

        try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, changeEmailPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updateEmail(auth.currentUser, changeEmailEmail);

            setChangeEmailVisible(false);
            setChangeEmailEmail("");
            setChangeEmailPassword("");
            setChangeEmailMessage("");
            setEmail(auth.currentUser.email ?? "");
            await updateUserDetails();
        } catch (error: any) {
            const errorCode = error.code;
            if (errorCode === "auth/invalid-credential") {
                setChangeEmailMessage("Password is incorrect!");
            } else if (errorCode === "auth/invalid-email") {
                setChangeEmailMessage("Please enter a valid email!");
            } else if (errorCode === "auth/email-already-in-use") {
                setChangeEmailMessage("An account with this email already exists!");
            }
        }
    };

    function validateName(name: string): boolean {
        return /^[A-Za-z\s]+$/.test(name.trim());
    }

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    const getDepartmentLabel = (value: string) => {
        return departmentOptions.find(option => option.value === value)?.label || "Select Department";
    };

    return (
        <SafeAreaView style={styles.container}>
            <Portal>
                {/* ... Modal code remains unchanged ... */}
            </Portal>

            <Title style={styles.title}>My Profile</Title>
            <Card style={styles.card}>
                <Card.Content>
                    <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.inputSpacing} />
                    <TextInput label="Email" value={email} disabled={true} mode="outlined" style={styles.inputSpacing} />
                    <TextInput label="Interests (comma separated)" value={interests} onChangeText={setInterests} mode="outlined" style={styles.inputSpacing} />

                    {/* New Department Menu */}
                    <Menu
                        visible={departmentMenuVisible}
                        onDismiss={() => setDepartmentMenuVisible(false)}
                        anchor={
                            <Button
                                onPress={() => setDepartmentMenuVisible(true)}
                                mode="outlined"
                                icon="chevron-down"
                                contentStyle={styles.menuAnchorButton}
                                style={styles.inputSpacing}
                            >
                                {getDepartmentLabel(department)}
                            </Button>
                        }>
                        {departmentOptions.map(option => (
                            <Menu.Item
                                key={option.value}
                                onPress={() => {
                                    setDepartment(option.value);
                                    setDepartmentMenuVisible(false);
                                }}
                                title={option.label}
                            />
                        ))}
                    </Menu>

                    {/* New Admission Year Menu */}
                    <Menu
                        visible={admissionYearMenuVisible}
                        onDismiss={() => setAdmissionYearMenuVisible(false)}
                        anchor={
                            <Button
                                onPress={() => setAdmissionYearMenuVisible(true)}
                                mode="outlined"
                                icon="chevron-down"
                                contentStyle={styles.menuAnchorButton}
                                style={styles.inputSpacing}
                            >
                                {admissionYear || "Select Admission Year"}
                            </Button>
                        }>
                        <ScrollView style={{ maxHeight: 200 }}>
                            {[...Array(currentYear - 1970 + 1)].map((_, i) => {
                                const year = (currentYear - i).toString();
                                return (
                                    <Menu.Item
                                        key={year}
                                        onPress={() => {
                                            setAdmissionYear(year);
                                            setAdmissionYearMenuVisible(false);
                                        }}
                                        title={year}
                                    />
                                );
                            })}
                        </ScrollView>
                    </Menu>

                    <Button mode="contained-tonal" onPress={() => setChangeEmailVisible(true)} style={styles.button}>
                        Change Email
                    </Button>
                    <Button mode="contained" onPress={updateUserDetails} style={styles.button}>
                        Save Details
                    </Button>
                    <Text style={updateStatus ? styles.successMessage : styles.errorMessage}>
                        {message}
                    </Text>
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                onPress={() => signOut(auth)}
                style={styles.logoutButton}
                buttonColor={theme.colors.error}
            >
                Log Out
            </Button>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 16,
        backgroundColor: '#f5f5f5'
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
    },
    card: {
        width: '100%',
        maxWidth: 400,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    inputSpacing: {
        marginBottom: 16,
    },
    menuAnchorButton: {
        height: 40, // To match TextInput height
        justifyContent: 'center',
    },
    button: {
        marginTop: 8,
    },
    logoutButton: {
        marginTop: 20,
        width: '100%',
        maxWidth: 400,
    },
    errorMessage: {
        textAlign: "center",
        color: "#B00020",
        marginTop: 10,
    },
    successMessage: {
        textAlign: "center",
        color: "green",
        marginTop: 10,
    },
    modalContent: {
        padding: 20,
        margin: 20,
    },
});

export default Profile;