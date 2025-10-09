import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updateEmail } from "@firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc, setDoc, addDoc, collection, Timestamp, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import DatePicker from "@/components/DatePicker";
import { Checkbox, Chip } from 'react-native-paper';
import Autocomplete from "react-native-autocomplete-input";

// Import components from react-native-paper
import {
    ActivityIndicator,
    Button,
    Card,
    Menu,
    Modal,
    Portal,
    Text,
    TextInput,
    Title,
    useTheme,
    Icon
} from 'react-native-paper';
import { black } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

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
    const [name, setName] = useState("");
    const [profilePhotoUrl, setProfilePhotoUrl] = useState("");

    const [skills, setSkills] = useState<string[]>([]);
    const [allSkills, setAllSkills] = useState<string[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<string>("");
    const [showSuggestions, setShowSuggestions] = useState(false);

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

    const [experiences, setExperiences] = useState<any[]>([]);
    const [updateExperienceId, setUpdateExperienceId] = useState(null);
    const [addExperienceVisible, setAddExperienceVisible] = useState(false);
    const [addExperienceTitle, setAddExperienceTitle] = useState("");
    const [addExperienceCompany, setAddExperienceCompany] = useState("");
    const [addExperienceMessage, setAddExperienceMessage] = useState("" );
    const [addExperienceStartDate, setAddExperienceStartDate] = useState(null);
    const [addExperienceChecked, setAddExperienceChecked] = useState(false);
    const [addExperienceFinishDate, setAddExperienceFinishDate] = useState(null);

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

    useEffect(() => {
        const fetchSkills = async () => {
            const snapshot = await getDocs(collection(db, "skills"));
            const skillsData = snapshot.docs.map((doc) => doc.data().name as string);                
            setAllSkills(skillsData);
        };
        fetchSkills();
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
                setSkills(data["skills"] || "");
                setName(data["name"] || "");
                setProfilePhotoUrl(data["profile_photo_url"] || "");

                getExperiences();
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
            if (!/^[A-Za-z\s]+$/.test(name.trim())) {
                throw new Error("auth/invalid-name");
            }

            await setDoc(doc(db, "users", auth.currentUser.uid), {
                auth_ref: auth.currentUser.uid,
                name: name,
                email: auth.currentUser.email,
                department: department,
                admission_year: admissionYear,
                profile_photo_url: profilePhotoUrl || null,
                skills: skills, // Changed from interests to skills
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

    const addExperience = async () => {
        if(!auth.currentUser)
            return;

        if(!addExperienceTitle) {
            setAddExperienceMessage("Title field is mandatory");
            return;
        }

        if(!addExperienceCompany) {
            setAddExperienceMessage("Company field is mandatory");
            return;
        }

        if(addExperienceStartDate && addExperienceFinishDate &&
             addExperienceStartDate > addExperienceFinishDate) { 
                setAddExperienceMessage("Finish date must be after start date");
        }

        const colRef = collection(db, "users", auth.currentUser.uid, "experiences");

        const payload: any = {
            title: addExperienceTitle,
            company: addExperienceCompany,
        };

        if (addExperienceStartDate) {
            payload.startDate = Timestamp.fromDate(addExperienceStartDate);
        }

        if (addExperienceFinishDate && addExperienceChecked) {
            payload.finishDate = Timestamp.fromDate(addExperienceFinishDate);
        }

        const docRef = await addDoc(colRef, payload);

        getExperiences();
        setAddExperienceMessage("Experience added successfully");
        setAddExperienceVisible(false);
    }

    async function getExperiences() {
        if (!auth.currentUser) return;

        const colRef = collection(db, "users", auth.currentUser.uid, "experiences");
        const snapshot = await getDocs(colRef);

        let experiences = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
            id: doc.id,
            title: data.title,
            company: data.company,
            startDate: data.startDate ? data.startDate.toDate() : null,
            finishDate: data.finishDate ? data.finishDate.toDate() : null,
            };
        });

        
        experiences.sort((a, b) => {
            if (a.startDate && b.startDate) {
            const diff = b.startDate.getTime() - a.startDate.getTime(); 
            if (diff !== 0) return diff;
            }

            
            if (a.finishDate && b.finishDate) {
            return b.finishDate.getTime() - a.finishDate.getTime();
            }

            
            if (!a.finishDate && b.finishDate) return -1;  
            if (a.finishDate && !b.finishDate) return 1;

            return 0;
        });

        setExperiences(experiences);
        console.log(experiences);
    }

    function formatDate(dateStr: any) {
        if (!dateStr) return null; 
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    async function deleteExperience(expId: string) {
        if(!auth.currentUser)
            return;

        const userId = auth.currentUser.uid;
        const expRef = doc(db, "users", userId, "experiences", expId);
        await deleteDoc(expRef);

        getExperiences();
    }

    async function updateExperience(expId: string) {
        if(!auth.currentUser)
            return;

        if(!addExperienceTitle) {
            setAddExperienceMessage("Title field is mandatory");
            return;
        }

        if(!addExperienceCompany) {
            setAddExperienceMessage("Company field is mandatory");
            return;
        }

        if(addExperienceStartDate && addExperienceFinishDate &&
             addExperienceStartDate > addExperienceFinishDate) { 
                setAddExperienceMessage("Finish date must be after start date");
        }

        const userId = auth.currentUser.uid;
        const expRef = doc(db, "users", userId, "experiences", expId);

        const payload: any = {
            title: addExperienceTitle,
            company: addExperienceCompany,
        };

        if (addExperienceStartDate) {
            payload.startDate = Timestamp.fromDate(addExperienceStartDate);
        }

        if (addExperienceFinishDate && !addExperienceChecked) {
            payload.finishDate = Timestamp.fromDate(addExperienceFinishDate);
        }
        else
            payload.finishDate = null;

        await updateDoc(expRef, payload);
        setAddExperienceVisible(false);
        getExperiences();
    }

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

    return (
        <ScrollView>
        <SafeAreaView style={styles.container}>
            <Portal>
                <Modal visible={changeEmailVisible} onDismiss={() => setChangeEmailVisible(false)}>
                    <Card style={styles.modalCard}>
                        <Card.Title title="Change Email" />
                        <Card.Content>
                            <TextInput
                                label="New Email"
                                value={changeEmailEmail}
                                onChangeText={setChangeEmailEmail}
                                style={styles.inputSpacing}
                                mode="outlined"
                            />
                            <TextInput
                                label="Password"
                                secureTextEntry={true}
                                value={changeEmailPassword}
                                onChangeText={setChangeEmailPassword}
                                style={styles.inputSpacing}
                                mode="outlined"
                            />
                            {changeEmailMessage ? <Text style={styles.errorMessage}>{changeEmailMessage}</Text> : null}
                        </Card.Content>
                        <Card.Actions>
                            <Button onPress={() => setChangeEmailVisible(false)}>Cancel</Button>
                            <Button onPress={updateUserEmail}>Update</Button>
                        </Card.Actions>
                    </Card>
                </Modal>
                <Modal visible={addExperienceVisible} onDismiss={() => setAddExperienceVisible(false)}>
                    <Card style={styles.modalCard}>
                        <Card.Title title="Add experience" />
                        <Card.Content>
                            <TextInput
                                label="Title*"
                                value={addExperienceTitle}
                                onChangeText={setAddExperienceTitle}
                                style={styles.inputSpacing}
                                mode="outlined"
                            />
                            <TextInput
                                label="Company*"
                                value={addExperienceCompany}
                                onChangeText={setAddExperienceCompany}
                                style={styles.inputSpacing}
                                mode="outlined"
                            />
                            <DatePicker date={addExperienceStartDate} setDate={setAddExperienceStartDate} textValue="Starting date"/>
                            <Checkbox.Item style={{paddingLeft: 5, paddingRight: 0}} label="I am currently working in this role" status={addExperienceChecked ? 'checked' : 'unchecked'} onPress={() => {setAddExperienceChecked(!addExperienceChecked)}}></Checkbox.Item>
                            {!addExperienceChecked && <DatePicker date={addExperienceFinishDate} setDate={setAddExperienceFinishDate} textValue="Finish date"/>}
                            {addExperienceMessage ? <Text style={styles.errorMessage}>{addExperienceMessage}</Text> : null}
                        </Card.Content>
                        <Card.Actions>
                            <Button onPress={() => setAddExperienceVisible(false)}>Cancel</Button>
                            <Button onPress={() => {
                                console.log(addExperienceFinishDate);
                                console.log(addExperienceStartDate);

                                if(!updateExperienceId)
                                    addExperience();
                                else
                                    updateExperience(updateExperienceId);
                            }}>{updateExperienceId ? "Update" : "Add"}</Button>
                        </Card.Actions>
                    </Card>
                </Modal>
            </Portal>

            <Title style={styles.title}>My Profile</Title>
            <Card style={styles.card}>
                <Card.Content>
                    <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.inputSpacing} />
                    <TextInput label="Email" value={email} disabled={true} mode="outlined" style={styles.inputSpacing} />
                    {/* <TextInput label="Skills (comma separated)" value={skills} onChangeText={setSkills} mode="outlined" style={styles.inputSpacing} /> */}

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

                    {experiences && <Text>Experience</Text>}
                    {experiences && experiences.map((experience, index) => (
                        <Card key={index} style={styles.cardContainer} mode="elevated">
                            <Card.Title
                                subtitle={experience.title}
                                titleStyle={styles.cardTitle}
                                subtitleStyle={styles.detailText}
                                title={experience.company}
                                // right={() => (
                                    // <Chip
                                    //     icon={isUpcomingEvent(event.date) ? "calendar-check" : "calendar-remove"}
                                    //     selectedColor={isUpcomingEvent(event.date) ? MD3Colors.primary40 : MD3Colors.error40}
                                    //     style={styles.chip}
                                    // >
                                    // {isUpcomingEvent(event.date) ? "Upcoming" : "Past"}
                                    // </Chip>
                                // )}
                                
                            />
                            <Card.Content style={styles.cardContent}>
                                <div style={styles.column}>
                                    {experience.startDate !== null && <View style={styles.detailRow}>
                                        <Icon source="clock-time-four-outline" size={16} color="#6a11cb" />
                                        <Text style={styles.detailText}>Start date: {formatDate(experience.startDate)}</Text>
                                    </View>}
                                    {experience.finishDate !== null && <View style={styles.detailRow}>
                                        <Icon source="clock-time-four-outline" size={16} color="#6a11cb" />
                                        <Text style={styles.detailText}>Finish date: {formatDate(experience.finishDate)}</Text>
                                    </View>}
                                </div>
                                <div style={styles.row}>
                                    <Button
                                            mode="outlined"
                                            style={styles.registerButton}
                                            labelStyle={styles.registerText}
                                            onPress={() => {
                                                setAddExperienceVisible(true);
                                                setUpdateExperienceId(experience.id);
                                                setAddExperienceTitle(experience.title);
                                                setAddExperienceCompany(experience.company);
                                                setAddExperienceStartDate(experience.startDate);
                                                setAddExperienceFinishDate(experience.finishDate);
                                                console.log(experience.finishDate);
                                                setAddExperienceChecked(experience.finishDate === null);
                                                setAddExperienceMessage("");
                                            }}
                                        >
                                            <Icon source="pencil" size={20} color="#000000" />
                                    </Button>
                                    <Button
                                            mode="outlined"
                                            style={styles.registerButton}
                                            labelStyle={styles.registerText}
                                            onPress={() => {deleteExperience(experience.id)}}
                                        >
                                            <Icon source="delete" size={20} color="#000000" />
                                    </Button>
                                </div>
                            </Card.Content>
                        </Card>
                    ))}
                    <Button mode="contained-tonal" buttonColor="#9999A1" onPress={() => {
                        setUpdateExperienceId(null);
                        setAddExperienceVisible(true);
                        setAddExperienceTitle("");
                        setAddExperienceCompany("");
                        setAddExperienceStartDate(null);
                        setAddExperienceFinishDate(null);
                        setAddExperienceChecked(false);
                        setAddExperienceMessage("");
                    }} style={styles.button}>
                        Add experience
                    </Button>
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 16,
        backgroundColor: '#f5f5f5'
    },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    addButton: { marginTop: 10 },
    autocompleteItem: { padding: 10, borderBottomWidth: 1, borderColor: "#eee" },
    autocompleteWrapper: { marginBottom: 10 },
    label: { marginBottom: 8, fontSize: 16, color: 'gray' },
    inputContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8 },
    suggestionContainer: { maxHeight: 150, borderWidth: 1, borderColor: "#ddd", borderRadius: 5, marginTop: 5 },
    chip: {},
    cardContainer: {
        marginTop: 10
    },
    cardContent: {
        display: "flex",
        flexDirection: "row",
    },
    row: {
        display: "flex",
        flexDirection: "row",
        width: "50%",
    },
    column: {
        display: "flex",
        flexDirection: "column",
        width: "100%"
    },
    registerButton: {
        width: 30,
        marginLeft: "auto",      
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
    },
    registerText: {
        color: "white",
        fontSize: 24,
        cursor: "pointer",
        padding: 0,
    },
    detailText: {
        marginLeft: 8,
        fontSize: 14,
        color: "#6a11cb",
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    cardTitle: { fontSize: 24, fontWeight: "bold", color: "#000000" },
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
    modalCard: {
        margin: 20,
    },
    title: {
        fontSize: 24,
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
});

export default Profile;