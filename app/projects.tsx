import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TextInput } from "react-native";
import { db } from "@/firebaseConfig";
import { collection, doc, getDocs } from "firebase/firestore";
import { Project } from "./types";
import { Card, Text, Avatar, ListItem, Icon, Button } from "@rneui/themed";
import { FAB } from "react-native-elements";
import AddProjectModal from "@/components/AddProjectModal";
import RequestJoinModal from "@/components/RequestJoinModal";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DocumentReference } from "firebase/firestore";

const Projects = () => {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [selectedProjectRef, setSelectedProjectRef] = useState<DocumentReference | null>(null);

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


      setProjects(projectData);
      setAllProjects(projectData);
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

    fetchProjects();
    fetchUsers();
  }, []);

  const filterProjects = () => {
    let filtered = allProjects;

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

              <Button
                title="Request to Join"
                buttonStyle={styles.requestButton}
                titleStyle={styles.requestButtonText}
                onPress={() => handleRequestJoin(project.projectRef!.id)}
              />
            </Card>
          );
        })}
      </ScrollView>

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
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
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
