import React, {useEffect, useState} from "react";
import {ActivityIndicator, ScrollView, StyleSheet, TextInput, View} from "react-native";
import {auth, db} from "@/firebaseConfig";
import {collection, doc, DocumentReference, getDocs} from "firebase/firestore";
import {Project, ProjectJoinRequest} from "./types";
import {Avatar, Button, Card, Icon, ListItem, Text} from "@rneui/themed";
import {FAB} from "react-native-elements";
import AddProjectModal from "@/components/AddProjectModal";
import RequestJoinModal from "@/components/RequestJoinModal";
import ViewRequestsModal from "@/components/ViewRequestsModal";
import AddCompetencyModal from "@/components/AddCompetencyModal";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {onAuthStateChanged, User} from "firebase/auth";

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
  const [, setCompetencyMap] = useState<Record<string, string>>({});
  const [addCompetencyVisible, setAddCompetencyVisible] = useState(false);
  const [currentProjectIdForCompetency, setCurrentProjectIdForCompetency] = useState<string | null>(null);
  const [currentProjectCompetencies, setCurrentProjectCompetencies] = useState<string[]>([]);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
  }, []);

  const handleAddProject = () => { setModalVisible(true); };

  const [filterTitle, setFilterTitle] = useState("");
  const [filterKeywords, setFilterKeywords] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      const projectsCollection = collection(db, "projects");
      const projectsSnapshot = await getDocs(projectsCollection);

      const projectData: Project[] = projectsSnapshot.docs.map((doc) => ({
        ...(doc.data() as Project),
        projectRef: doc.ref,
      }));

      setAllProjects(projectData);
      updateProjectsView(projectData, viewMode);
    };

    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);

      const userData: Record<string, string> = {};
      usersSnapshot.forEach((doc) => {
        userData[doc.id] = doc.data().name;
      });

      setUsers(userData);
      setLoading(false);
    };

    const fetchCompetencies = async () => {
      const snapshot = await getDocs(collection(db, "competencies"));
      const map: Record<string, string> = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        map[doc.id] = data.name;
      });
      setCompetencyMap(map);
    };

    fetchProjects();
    fetchUsers();
    fetchCompetencies();
  }, []);

  const updateProjectsView = (projectsList: Project[], mode: 'all' | 'my') => {
    if (mode === 'my' && currentUser) {
      const myProjects = projectsList.filter(project =>
        project.founder.id === currentUser.uid ||
        project.members.some(member => member.ref.id === currentUser.uid)
      );
      setProjects(myProjects);
    } else {
      setProjects(projectsList);
    }
  };

  const handleViewModeChange = (mode: 'all' | 'my') => {
    setViewMode(mode);
    updateProjectsView(allProjects, mode);
  };

  const filterProjects = () => {
    let filtered = viewMode === 'my'
      ? allProjects.filter(project =>
          project.founder.id === currentUser?.uid ||
          project.members.some(member => member.ref.id === currentUser?.uid)
        )
      : allProjects;

    if (filterTitle !== "") {
      filtered = filtered.filter((project) =>
        project.name.toLowerCase().includes(filterTitle.toLowerCase())
      );
    }

    if (filterKeywords !== "") {
      filtered = filtered.filter((project) =>
        project.keywords.toLowerCase().includes(filterKeywords.toLowerCase())
      );
    }

    setProjects(filtered);
  };

  const handleRequestJoin = (projectId: string) => {
    const projectRef = doc(db, "projects", projectId);
    setSelectedProjectRef(projectRef);
    setJoinModalVisible(true);
  };

  const handleShowRequests = (requests: ProjectJoinRequest[], projectId:string) => {
    const projectRef = doc(db, "projects", projectId);
    setSelectedProjectRef(projectRef);
    setSelectedProjectRequests(requests);
    setViewRequestsVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading Projects...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.toggleContainer}>
          <Button
            title="All Projects"
            onPress={() => handleViewModeChange('all')}
            buttonStyle={[
              styles.toggleButton,
              viewMode === 'all' ? styles.activeToggle : styles.inactiveToggle
            ]}
            titleStyle={styles.toggleText}
          />
          <Button
            title="My Projects"
            onPress={() => handleViewModeChange('my')}
            buttonStyle={[
              styles.toggleButton,
              viewMode === 'my' ? styles.activeToggle : styles.inactiveToggle
            ]}
            titleStyle={styles.toggleText}
          />
        </View>

        <View style={styles.filterContainer}>
          <TextInput
            style={styles.input}
            placeholder={"Enter title filter:"}
            placeholderTextColor="#888"
            onChangeText={setFilterTitle}
            value={filterTitle}
          />
          <TextInput
            style={styles.input}
            placeholder={"Enter keywords filter:"}
            placeholderTextColor="#888"
            onChangeText={setFilterKeywords}
            value={filterKeywords}
          />
          <Button onPress={filterProjects}>Filter</Button>
        </View>

        {projects.map((project, index) => {
          const displayedMembers = project.members.slice(0, 3);
          const hasMoreMembers = project.members.length > 3;
          const startingDate = project.startingDate
            ? project.startingDate.toDate().toLocaleDateString()
            : "No start date";
          const isMyTab = viewMode === 'my';
          const hasPendingRequest = project.requests?.some(
            (req) => req.ref.id === currentUser?.uid
          );

          return (
            <Card key={index} containerStyle={styles.cardContainer}>
              <Card.Title style={styles.cardTitle}>{project.name}</Card.Title>
              <View style={styles.detailsContainer}>
                <Text style={styles.startingDateText}>
                  Starting Date: {startingDate}
                </Text>
                {project.description && (
                  <Text style={styles.descriptionText}>
                    {project.description}
                  </Text>
                )}
              </View>

              <Card.Divider />

              <View style={styles.founderContainer}>
                <View style={styles.founderIcon}>
                  <Icon
                    name="crown"
                    type="material-community"
                    color="#FFD700"
                    size={30}
                  />
                </View>
                <Text style={styles.founderText}>
                  Founder: {users[project.founder.id] || "Unknown"}
                </Text>
              </View>

              <Card.Divider />

              <Text style={styles.sectionTitle}>Required Competencies</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {(project.competencies ?? []).length > 0 ? (
                    (project.competencies ?? []).map((skill, idx) => (
                    <Text
                      key={idx}
                      style={{
                        backgroundColor: "#E0E0E0",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 10,
                        margin: 4,
                        fontSize: 14,
                        color: "#333",
                        fontWeight: "500",
                      }}
                    >
                      {skill}
                    </Text>
                  ))
                ) : (
                  <Text style={{ fontStyle: "italic", color: "#888" }}>No competencies listed</Text>
                )}
              </View>

              {currentUser?.uid === project.founder.id && isMyTab && (
                <Button
                  title="+ Add Competency"
                  type="outline"
                  buttonStyle={{ marginTop: 10, borderColor: "#6200EE" }}
                  titleStyle={{ color: "#6200EE" }}
                  onPress={() => {
                    setCurrentProjectIdForCompetency(project.projectRef?.id || null);
                    setCurrentProjectCompetencies(project.competencies ?? []);
                    setAddCompetencyVisible(true);
                  }}
                />
              )}
              <Card.Divider />

              <Text style={styles.sectionTitle}>
                Members ({project.members.length})
              </Text>

              {displayedMembers.length > 0 ? (
                displayedMembers.map((member, idx) => (
                  <ListItem key={idx} bottomDivider>
                    <Avatar
                      rounded
                      title={users[member.ref.id]?.charAt(0) || "?"}
                      containerStyle={styles.avatar}
                    />
                    <ListItem.Content>
                      <ListItem.Title style={styles.memberName}>
                        {users[member.ref.id] || "Unknown"}
                      </ListItem.Title>
                      <ListItem.Subtitle>{member.role}</ListItem.Subtitle>
                    </ListItem.Content>
                  </ListItem>
                ))
              ) : (
                <Text style={styles.noMembersText}>No members in this project</Text>
              )}

              {hasMoreMembers && (
                <Text style={styles.moreMembersText}>
                  {project.members.length - 3} more members...
                </Text>
              )}

              {isMyTab ? (
                <>
                  {hasPendingRequest ? (
                    <Text style={{ color: "orange", fontWeight: "bold", marginTop: 10 }}>
                      Pending Requests
                    </Text>
                  ) : (
                    <Text style={{ color: "orange", fontWeight: "bold", marginTop: 10 }}>
                      No Pending Requests
                    </Text>
                  )}
                  <Button
                    title="Show Requests"
                    buttonStyle={styles.requestButton}
                    titleStyle={styles.requestButtonText}
                    onPress={() => handleShowRequests(project.requests || [], project.projectRef!.id)}
                  />
                </>
              ) : (
                <Button
                  title="Request to Join"
                  buttonStyle={styles.requestButton}
                  titleStyle={styles.requestButtonText}
                  onPress={() => handleRequestJoin(project.projectRef!.id)}
                />
              )}
            </Card>
          );
        })}
      </ScrollView>

      {currentProjectIdForCompetency && (
        <AddCompetencyModal
            visible={addCompetencyVisible}
            onClose={() => setAddCompetencyVisible(false)}
            projectId={currentProjectIdForCompetency}
            existingCompetencies={currentProjectCompetencies}
            onCompetencyAdded={(newSkill) => {
            setProjects((prevProjects) =>
                  prevProjects.map((p) => p.projectRef?.id === currentProjectIdForCompetency
                      ? { ...p, competencies: [...(p.competencies || []), newSkill] }
                      : p
                  )
                );
              }}
        />
      )}

      <FAB
        icon={{ name: "add", color: "white" }}
        placement="right"
        color="#6200EE"
        onPress={handleAddProject}
      />

      <AddProjectModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        projects={projects}
        setProjects={setProjects}
      />

      <RequestJoinModal
        visible={joinModalVisible}
        onClose={() => setJoinModalVisible(false)}
        projectId={selectedProjectRef}
      />
      <ViewRequestsModal
        visible={viewRequestsVisible}
        onClose={() => setViewRequestsVisible(false)}
        requests={selectedProjectRequests}
        users={users}
        projectRef={selectedProjectRef}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 10,
  },
  toggleButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  activeToggle: {
    backgroundColor: '#6200EE',
  },
  inactiveToggle: {
    backgroundColor: '#cccccc',
  },
  toggleText: {
    color: 'white',
    fontWeight: '500',
  },
  filterContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  input: {
    flex: 1,
    height: 40,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6200EE",
    fontWeight: "500",
  },
  cardContainer: {
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#6a11cb",
    marginBottom: 15,
  },
  detailsContainer: {
    marginBottom: 15,
  },
  startingDateText: {
    fontSize: 16,
    color: "#6a11cb",
    fontWeight: "500",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
    fontStyle: "italic",
  },
  founderContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  founderIcon: {
    backgroundColor: "#6a11cb",
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  founderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6a11cb",
  },
  avatar: {
    backgroundColor: "#6a11cb",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6a11cb",
    marginBottom: 5,
  },
  memberName: {
    color: "#333",
    fontWeight: "500",
  },
  noMembersText: {
    textAlign: "center",
    fontSize: 14,
    color: "#999",
  },
  moreMembersText: {
    textAlign: "center",
    fontSize: 14,
    color: "#6a11cb",
    fontStyle: "italic",
    marginTop: 5,
  },
  requestButton: {
    backgroundColor: "#6200EE",
    borderRadius: 8,
    marginTop: 15,
    paddingVertical: 12,
  },
  requestButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default Projects;