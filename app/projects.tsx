import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { auth, db } from "@/firebaseConfig";
import { collection, doc, DocumentReference, getDocs, updateDoc, arrayRemove } from "firebase/firestore";
import { Project, ProjectJoinRequest } from "./types";
import AddProjectModal from "@/components/AddProjectModal";
import RequestJoinModal from "@/components/RequestJoinModal";
import ViewRequestsModal from "@/components/ViewRequestsModal";
import AddCompetencyModal from "@/components/AddCompetencyModal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { onAuthStateChanged, User } from "firebase/auth";

// Import components from react-native-paper
import {
    ActivityIndicator,
    Avatar,
    Button,
    Card,
    Chip,
    Divider,
    FAB,
    Icon,
    List,
    SegmentedButtons,
    Text,
    TextInput,
} from "react-native-paper";

const Projects = () => {
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<Record<string, string>>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [selectedProjectRef, setSelectedProjectRef] = useState<DocumentReference | null>(null);
    const [viewMode, setViewMode] = useState<'all' | 'my'>('all');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [viewRequestsVisible, setViewRequestsVisible] = useState(false);
    const [selectedProjectRequests, setSelectedProjectRequests] = useState<ProjectJoinRequest[]>([]);
    const [addCompetencyVisible, setAddCompetencyVisible] = useState(false);
    const [currentProjectIdForCompetency, setCurrentProjectIdForCompetency] = useState<string | null>(null);
    const [currentProjectCompetencies, setCurrentProjectCompetencies] = useState<string[]>([]);
    const [filterTitle, setFilterTitle] = useState("");
    const [filterKeywords, setFilterKeywords] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const projectsCollection = collection(db, "projects");
            const projectsSnapshot = await getDocs(projectsCollection);
            const projectData: Project[] = projectsSnapshot.docs.map((doc) => ({
                ...(doc.data() as Project),
                projectRef: doc.ref,
            }));
            setAllProjects(projectData);

            const usersCollection = collection(db, "users");
            const usersSnapshot = await getDocs(usersCollection);
            const userData: Record<string, string> = {};
            usersSnapshot.forEach((doc) => {
                userData[doc.id] = doc.data().name;
            });
            setUsers(userData);

            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        updateProjectsView(allProjects, viewMode);
    }, [allProjects, viewMode, currentUser, filterTitle, filterKeywords]);


    const updateProjectsView = (projectsList: Project[], mode: 'all' | 'my') => {
        let listToFilter = projectsList;

        if (mode === 'my' && currentUser) {
            listToFilter = projectsList.filter(project =>
                project.founder.id === currentUser.uid ||
                project.members.some(member => member.ref.id === currentUser.uid)
            );
        }

        let filtered = listToFilter;
        if (filterTitle) {
            filtered = filtered.filter((project) =>
                project.name.toLowerCase().includes(filterTitle.toLowerCase())
            );
        }
        if (filterKeywords) {
            filtered = filtered.filter((project) =>
                (project.keywords || "").toLowerCase().includes(filterKeywords.toLowerCase())
            );
        }
        setProjects(filtered);
    };

    const handleDeleteCompetency = async (projectId: string, skill: string) => {
        const projectRef = doc(db, "projects", projectId);
        await updateDoc(projectRef, { competencies: arrayRemove(skill) });
        setAllProjects(prev =>
            prev.map(p =>
                p.projectRef?.id === projectId
                    ? { ...p, competencies: (p.competencies || []).filter(c => c !== skill) }
                    : p
            )
        );
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Loading Projects...</Text>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <SegmentedButtons
                    value={viewMode}
                    onValueChange={(value) => setViewMode(value as 'all' | 'my')}
                    buttons={[
                        { value: 'all', label: 'All Projects' },
                        { value: 'my', label: 'My Projects' },
                    ]}
                    style={styles.toggleContainer}
                />

                <View style={styles.filterContainer}>
                    <TextInput label="Filter by title" value={filterTitle} onChangeText={setFilterTitle} mode="outlined" dense />
                    <TextInput label="Filter by keywords" value={filterKeywords} onChangeText={setFilterKeywords} mode="outlined" dense style={{marginTop: 10}} />
                </View>

                {projects.map((project) => {
                    const isMyTab = viewMode === 'my';
                    const isFounder = currentUser?.uid === project.founder.id;
                    const hasPendingRequest = project.requests?.some((req) => req.ref.id === currentUser?.uid);

                    // Merged change: Logic for displaying limited members
                    const displayedMembers = project.members.slice(0, 3);
                    const hasMoreMembers = project.members.length > 3;

                    return (
                        <Card key={project.projectRef?.id} style={styles.cardContainer} mode="elevated">
                            <Card.Title title={project.name} titleStyle={styles.cardTitle} />
                            <Card.Content>
                                <Text style={styles.startingDateText}>
                                    Start Date: {project.startingDate ? project.startingDate.toDate().toLocaleDateString() : "N/A"}
                                </Text>
                                <Text style={styles.descriptionText}>{project.description}</Text>

                                <Divider style={styles.divider} />

                                <View style={styles.founderContainer}>
                                    <Icon source="crown" color="#FFD700" size={30} />
                                    <Text style={styles.founderText}>Founder: {users[project.founder.id] || "Unknown"}</Text>
                                </View>

                                <Divider style={styles.divider} />

                                <Text style={styles.sectionTitle}>Required Competencies</Text>
                                <View style={styles.chipContainer}>
                                    {(project.competencies ?? []).length > 0 ? (
                                        project.competencies?.map((skill, idx) => (
                                            <Chip
                                                key={`${skill}-${idx}`}
                                                onClose={isFounder && isMyTab ? () => handleDeleteCompetency(project.projectRef!.id, skill) : undefined}
                                            >
                                                {skill}
                                            </Chip>
                                        ))
                                    ) : (
                                        <Text style={styles.italicText}>No competencies listed</Text>
                                    )}
                                </View>
                                {isFounder && isMyTab && (
                                    <Button
                                        mode="outlined"
                                        onPress={() => {
                                            setCurrentProjectIdForCompetency(project.projectRef!.id);
                                            setCurrentProjectCompetencies(project.competencies ?? []);
                                            setAddCompetencyVisible(true);
                                        }}
                                        style={{ marginTop: 10 }}
                                    >+ Add Competency</Button>
                                )}

                                <List.Section>
                                    <List.Subheader style={styles.sectionTitle}>Members ({project.members.length})</List.Subheader>
                                    {displayedMembers.length > 0 ? (
                                        displayedMembers.map((member, idx) => (
                                            <List.Item
                                                key={idx}
                                                title={users[member.ref.id] || "Unknown"}
                                                description={member.role}
                                                left={() => <Avatar.Text size={40} label={users[member.ref.id]?.charAt(0) || "?"} />}
                                            />
                                        ))
                                    ) : (
                                        <Text style={styles.italicText}>No members yet</Text>
                                    )}
                                    {hasMoreMembers && (
                                        <Text style={styles.moreMembersText}>
                                            {project.members.length - 3} more members...
                                        </Text>
                                    )}
                                </List.Section>
                            </Card.Content>
                            <Card.Actions>
                                {isMyTab ? (
                                    <>
                                        <Text style={{ color: "orange", fontWeight: "bold", marginRight: 10 }}>
                                            { (project.requests?.length || 0) > 0 ? "Pending Requests" : "No Pending Requests" }
                                        </Text>
                                        <Button
                                            mode="contained"
                                            onPress={() => {
                                                setSelectedProjectRef(doc(db, "projects", project.projectRef!.id));
                                                setSelectedProjectRequests(project.requests || []);
                                                setViewRequestsVisible(true);
                                            }}
                                        >Show Requests ({project.requests?.length || 0})</Button>
                                    </>
                                ) : (
                                    !isFounder && (
                                        <Button
                                            mode="contained"
                                            disabled={hasPendingRequest}
                                            onPress={() => {
                                                setSelectedProjectRef(doc(db, "projects", project.projectRef!.id));
                                                setJoinModalVisible(true);
                                            }}
                                        >{hasPendingRequest ? 'Request Sent' : 'Request to Join'}</Button>
                                    )
                                )}
                            </Card.Actions>
                        </Card>
                    );
                })}
            </ScrollView>

            <FAB icon="plus" style={styles.fab} onPress={() => setModalVisible(true)} />

            <AddProjectModal modalVisible={modalVisible} setModalVisible={setModalVisible} projects={allProjects} setProjects={setAllProjects} />
            <RequestJoinModal visible={joinModalVisible} onClose={() => setJoinModalVisible(false)} projectId={selectedProjectRef} />
            <ViewRequestsModal visible={viewRequestsVisible} onClose={() => setViewRequestsVisible(false)} requests={selectedProjectRequests} users={users} projectRef={selectedProjectRef} />
            {currentProjectIdForCompetency && <AddCompetencyModal visible={addCompetencyVisible} onClose={() => setAddCompetencyVisible(false)} projectId={currentProjectIdForCompetency} existingCompetencies={currentProjectCompetencies} onCompetencyAdded={(newSkill) => setAllProjects(prev => prev.map(p => p.projectRef?.id === currentProjectIdForCompetency ? { ...p, competencies: [...(p.competencies || []), newSkill] } : p))} />}
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { fontSize: 16, fontWeight: "500" },
    toggleContainer: { marginVertical: 10, paddingHorizontal: 20 },
    filterContainer: { padding: 15, backgroundColor: 'white', borderRadius: 8, margin: 5, elevation: 2 },
    cardContainer: { borderRadius: 12, marginBottom: 15 },
    cardTitle: { fontSize: 24, fontWeight: "bold", color: "#6a11cb" },
    startingDateText: { fontSize: 14, color: "#6a11cb", fontWeight: "500", marginBottom: 10 },
    descriptionText: { fontSize: 16, color: "#555", fontStyle: "italic" },
    divider: { marginVertical: 15 },
    founderContainer: { flexDirection: "row", alignItems: "center" },
    founderText: { fontSize: 16, fontWeight: "500", color: "#6a11cb", marginLeft: 10 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#6a11cb" },
    chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
    italicText: { fontStyle: "italic", color: "#888", marginVertical: 10 },
    moreMembersText: { fontStyle: "italic", color: "#6a11cb", marginTop: 5, textAlign: 'center' },
    fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});

export default Projects;