import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { db } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Project } from "./types";
import { Card, Text, Avatar, ListItem, Icon } from "@rneui/themed";

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Record<string, string>>({});

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
        userData[doc.id] = doc.data().nume;
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
    <ScrollView style={styles.container}>
      {projects.map((project, index) => (
        <Card key={index} containerStyle={styles.cardContainer}>
          <Card.Title style={styles.cardTitle}>{project.name}</Card.Title>
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
          <Text style={styles.sectionTitle}>Members</Text>
          {project.members.length > 0 ? (
            project.members.map((member, idx) => (
              <ListItem key={idx} bottomDivider>
                <Avatar
                  rounded
                  title={users[member.ref.id]?.charAt(0) || "?"}
                  containerStyle={styles.avatar}
                />
                <ListItem.Content>
                  <ListItem.Title>
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
        </Card>
      ))}
    </ScrollView>
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
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#6a11cb",
  },
  founderContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
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
  noMembersText: {
    textAlign: "center",
    fontSize: 14,
    color: "#999",
  },
});

export default Projects;