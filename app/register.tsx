import React, { useEffect, useState } from "react";
import {ScrollView, StyleSheet, View, TouchableOpacity, Linking} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, setDoc, collection, getDocs } from "@firebase/firestore";
import Autocomplete from "react-native-autocomplete-input";
import { Link } from "expo-router"; // NEW: Import Link for navigation
import {
    Button,
    Card,
    Menu,
    Text,
    TextInput,
    Title,
    Chip,
    Checkbox, // NEW: Import Checkbox
    useTheme, // NEW: Import useTheme for link colors
    Modal, // NEW: Import Modal
    Portal, // NEW: Import Portal
    Paragraph // NEW: Import Paragraph for modal content
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
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const theme = useTheme();

    const [termsModalVisible, setTermsModalVisible] = useState(false);
    const [gdprModalVisible, setGdprModalVisible] = useState(false);

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
        if (!agreeToTerms) {
            setMessage("Trebuie să fiți de acord cu termenii și condițiile.");
            return;
        }

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


    const showTermsModal = () => setTermsModalVisible(true);
    const hideTermsModal = () => setTermsModalVisible(false);
    const showGdprModal = () => setGdprModalVisible(true);
    const hideGdprModal = () => setGdprModalVisible(false);
    const handleOpenLink = () => {
        Linking.openURL('https://www.ubbcluj.ro/ro/politici/');
    };
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
                        <View style={styles.checkboxContainer}>
                            <Checkbox
                                status={agreeToTerms ? 'checked' : 'unchecked'}
                                onPress={() => setAgreeToTerms(!agreeToTerms)}
                            />
                            {/* MODIFIED: Use TouchableOpacity/Text onPress instead of Link */}
                            <Text style={styles.checkboxLabel}>
                                Sunt de acord cu{' '}
                                {/*<Text style={{ color: theme.colors.primary }} onPress={showTermsModal}>*/}
                                {/*    Termenii si Conditiile*/}
                                {/*</Text>*/}
                                {/*{' '}si{' '}*/}
                                <Text style={{ color: theme.colors.primary }} onPress={showGdprModal}>
                                    Politicile de GDPR
                                </Text>
                                .
                            </Text>
                        </View>

                        {message ? <Text style={styles.statusMessage}>{message}</Text> : null}

                        <Button mode="contained" onPress={handleSignUp} style={styles.button} disabled={!agreeToTerms}>
                            Register
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>

            <Portal>
                <Modal visible={termsModalVisible} onDismiss={hideTermsModal} contentContainerStyle={styles.modalContent}>
                    <Card>
                        <Card.Title title="Termeni și Condiții" />
                        <Card.Content style={styles.modalScrollView}>
                            <ScrollView>
                                <Paragraph>
                                    Bine ați venit la [Numele Aplicației]! Acești termeni și condiții descriu regulile...
                                </Paragraph>
                                <Paragraph>
                                    Prin accesarea acestei aplicații...
                                </Paragraph>
                                <Title style={styles.subTitle}>Licență</Title>
                                <Paragraph>
                                    Cu excepția cazului în care se specifică altfel...
                                </Paragraph>
                            </ScrollView>
                        </Card.Content>
                        <Card.Actions>
                            <Button onPress={hideTermsModal}>Închide</Button>
                        </Card.Actions>
                    </Card>
                </Modal>

                {/* GDPR Modal */}
                <Modal visible={gdprModalVisible} onDismiss={hideGdprModal} contentContainerStyle={styles.modalContent}>
                    <Card>
                        <Card.Title title="Politica de Confidențialitate (GDPR)" />
                        <Card.Content style={styles.modalScrollView}>
                            <ScrollView>
                                <Paragraph>
                                    Prin prezenta, îmi dau consimțământul pentru utilizarea și prelucrarea datelor cu caracter personal (conform prevederilor Regulamentului privind protecția persoanelor în ceea ce privește prelucrarea datelor cu caracter personal și privind libera circulație a acestor date) de către Universitatea Babeș-Bolyai.
                                    De asemenea, îmi dau consimțământul pentru utilizarea imaginilor evenimentului la care apar - vezi {' '}
                                    <Text
                                        style={{ color: theme.colors.primary, textDecorationLine: 'underline' }}
                                        onPress={handleOpenLink}
                                    >
                                        politicile universității
                                    </Text>
                                </Paragraph>
                            </ScrollView>
                        </Card.Content>
                        <Card.Actions>
                            <Button onPress={hideGdprModal}>Închide</Button>
                        </Card.Actions>
                    </Card>
                </Modal>
            </Portal>
            {/* --- End of Modals --- */}

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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    subTitle: { fontSize: 18, marginTop: 10, marginBottom: 5, fontWeight: 'bold' }, // Style for modal subtitles
    checkboxLabel: {
        flex: 1, // Allows text to wrap
        marginLeft: 8,
    },
    modalContent: {
        padding: 20, // Padding around the Card
    },
    modalScrollView: {
        maxHeight: '70%', // Limit the height of the scrollable area
    },
});

export default Register;