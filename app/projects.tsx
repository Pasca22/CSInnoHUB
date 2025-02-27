import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { db } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Project } from "./types";
import { Card, Text, Avatar, ListItem, Icon, Button } from "@rneui/themed";
import { FAB } from "react-native-elements";
import AddProjectModal from "@/components/AddProjectModal";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [modalVisible, setModalVisible] = useState(false);
	const handleAddProject = () => { setModalVisible(true); };

  useEffect(() => {
    const fetchProjects = async () => {
      const projectsCollection = collection(db, "projects");
      const projectsSnapshot = await getDocs(projectsCollection);

      const projectData: Project[] = projectsSnapshot.docs.map((doc) => ({
        ...doc.data(),
      })) as Project[];

      setProjects(projectData);
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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loadingText}>Loading Projects...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
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
                      <ListItem.Subtitle>
                        {member.role}
                      </ListItem.Subtitle>
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
              />
            </Card>
          );
        })}
      </ScrollView>
      <FAB
				icon={{ name: 'add', color: 'white' }}
				placement="right"
				color="#6200EE"
				onPress={handleAddProject}/>

			<AddProjectModal
				modalVisible={modalVisible}
				setModalVisible={setModalVisible}
			/>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
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