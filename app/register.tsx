import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, setDoc, collection, getDocs } from "@firebase/firestore";
import Autocomplete from "react-native-autocomplete-input";

// Import components from react-native-paper
import {
    Button,
    Card,
    Menu,
    Text,
    TextInput,
    Title,
    Chip
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

    // --- Merged State for Skills ---
    const [skills, setSkills] = useState<string[]>([]);
    const [allSkills, setAllSkills] = useState<string[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<string>("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    // State for Menu and Password visibility
    const [departmentMenuVisible, setDepartmentMenuVisible] = useState(false);
    const [admissionYearMenuVisible, setAdmissionYearMenuVisible] = useState(false);
    const [isPasswordSecure, setIsPasswordSecure] = useState(true);
    const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);

    const currentYear = new Date().getFullYear();

    // --- Merged Logic for Skills Autocomplete ---
    useEffect(() => {
        const fetchSkills = async () => {
            const snapshot = await getDocs(collection(db, "skills"));
            const skillsData = snapshot.docs.map((doc) => doc.data().name as string);
            setAllSkills(skillsData);
        };
        fetchSkills();
    }, []);

    const filteredSkills = selectedSkill === '' ? [] : allSkills.filter(
        (skill) =>
            skill.toLowerCase().includes(selectedSkill.toLowerCase()) &&
            !skills.includes(skill)
    );

    const handleAddSkill = () => {
        if (selectedSkill && !skills.includes(selectedSkill)) {
            setSkills([...skills, selectedSkill]);
            setSelectedSkill("");
            setShowSuggestions(false);
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handleSignUp = () => {
        setMessage("");

        if (!/^[A-Za-z\s]+$/.test(name.trim())) return setMessage("Please enter a valid name!");
        if (password !== confirmPassword) return setMessage("Passwords do not match!");
        if (department === "") return setMessage("Please select your department!");
        if (admissionYear === "") return setMessage("Please select your admission year!");

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                setDoc(doc(db, "users", user.uid), {
                    auth_ref: user.uid,
                    email,
                    name,
                    department,
                    admission_year: admissionYear,
                    profile_photo_url: null,
                    // MERGED CHANGE: Join the skills array into a string for saving
                    skills: skills.join(", "),
                });
            })
            .catch((error) => {
                const errorCode = error.code;
                if (errorCode === "auth/invalid-email") setMessage("Please enter a valid email address!");
                else if (errorCode === "auth/email-already-in-use") setMessage("An account with this email already exists!");
                else if (errorCode === "auth/weak-password") setMessage("Password must be at least 6 characters long.");
                else setMessage("An error occurred. Please try again.");
            });
    };

    const getDepartmentLabel = (value: string) => departmentOptions.find(option => option.value === value)?.label || "Select Department";

    return (
        <SafeAreaProvider>
            <ScrollView contentContainerStyle={styles.container}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.title}>Create Account</Title>
                        <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.inputSpacing} />
                        <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" mode="outlined" style={styles.inputSpacing} />
                        <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry={isPasswordSecure} mode="outlined" style={styles.inputSpacing} right={<TextInput.Icon icon={isPasswordSecure ? "eye-off" : "eye"} onPress={() => setIsPasswordSecure(!isPasswordSecure)} />} />
                        <TextInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={isConfirmPasswordSecure} mode="outlined" style={styles.inputSpacing} right={<TextInput.Icon icon={isConfirmPasswordSecure ? "eye-off" : "eye"} onPress={() => setIsConfirmPasswordSecure(!isConfirmPasswordSecure)} />} />

                        <Menu visible={departmentMenuVisible} onDismiss={() => setDepartmentMenuVisible(false)} anchor={<Button onPress={() => setDepartmentMenuVisible(true)} mode="outlined" icon="chevron-down" contentStyle={styles.menuAnchorButton} style={styles.inputSpacing}>{getDepartmentLabel(department)}</Button>}>
                            {departmentOptions.map(option => (<Menu.Item key={option.value} onPress={() => { setDepartment(option.value); setDepartmentMenuVisible(false); }} title={option.label} />))}
                        </Menu>

                        <Menu visible={admissionYearMenuVisible} onDismiss={() => setAdmissionYearMenuVisible(false)} anchor={<Button onPress={() => setAdmissionYearMenuVisible(true)} mode="outlined" icon="chevron-down" contentStyle={styles.menuAnchorButton} style={styles.inputSpacing}>{admissionYear || "Select Admission Year"}</Button>}>
                            <ScrollView style={{ maxHeight: 200 }}>
                                {[...Array(currentYear - 1970 + 1)].map((_, i) => { const year = (currentYear - i).toString(); return <Menu.Item key={year} onPress={() => { setAdmissionYear(year); setAdmissionYearMenuVisible(false); }} title={year} />; })}
                            </ScrollView>
                        </Menu>

                        {/* --- Merged UI for Skills --- */}
                        <View style={styles.autocompleteWrapper}>
                            <Text style={styles.label}>Skills</Text>
                            <Autocomplete
                                data={showSuggestions ? filteredSkills : []}
                                value={selectedSkill}
                                onChangeText={(text) => {
                                    setSelectedSkill(text);
                                    setShowSuggestions(true);
                                }}
                                flatListProps={{
                                    keyExtractor: (_, idx) => idx.toString(),
                                    renderItem: ({ item }) => (
                                        <TouchableOpacity
                                            style={styles.autocompleteItem}
                                            onPress={() => {
                                                setSelectedSkill(item);
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            <Text>{item}</Text>
                                        </TouchableOpacity>
                                    ),
                                }}
                                inputContainerStyle={styles.inputContainer}
                                listContainerStyle={styles.suggestionContainer}
                                placeholder="Search and add a skill..."
                            />
                            <Button onPress={handleAddSkill} disabled={!selectedSkill} mode="contained" style={styles.addButton}>Add</Button>
                        </View>
                        <View style={styles.chipContainer}>
                            {skills.map((skill, index) => (
                                <Chip key={`${skill}-${index}`} onClose={() => handleRemoveSkill(skill)} style={styles.chip}>{skill}</Chip>
                            ))}
                        </View>

                        {message ? <Text style={styles.statusMessage}>{message}</Text> : null}
                        <Button mode="contained" onPress={handleSignUp} style={styles.button}>Register</Button>
                    </Card.Content>
                </Card>
            </ScrollView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16, justifyContent: "center", backgroundColor: '#f5f5f5' },
    card: { width: '100%' },
    title: { textAlign: 'center', marginBottom: 20 },
    inputSpacing: { marginBottom: 16 },
    menuAnchorButton: { height: 40, justifyContent: 'center' },
    button: { marginTop: 16, paddingVertical: 4 },
    statusMessage: { textAlign: 'center', color: "#B00020", marginBottom: 16 },
    label: { marginBottom: 8, fontSize: 16, color: 'gray' },
    autocompleteWrapper: { marginBottom: 10 },
    inputContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8 },
    suggestionContainer: { maxHeight: 150, borderWidth: 1, borderColor: "#ddd", borderRadius: 5, marginTop: 5 },
    autocompleteItem: { padding: 10, borderBottomWidth: 1, borderColor: "#eee" },
    addButton: { marginTop: 10 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: {},
});

export default Register;