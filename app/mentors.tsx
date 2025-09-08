import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Linking } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { Mentor } from "./types";
import { auth, db } from "@/firebaseConfig";
import { collection, getDocs, doc } from "firebase/firestore";
import { Card, Button, Text, Avatar } from "@rneui/themed";


const Mentors = () => {
    // const isAuthenticated = useContext(AuthContext);
    // if (!isAuthenticated) return <Login />;

    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMentors = async (): Promise<Mentor[]> => {
        const mentorsSnapshot = await getDocs(collection(db, "mentors"));
    
        return mentorsSnapshot.docs.map((doc) => {
            const data = doc.data();
            const mentor: Mentor = {
                name: data.name,
                pictureURL: data.pictureURL,
                title: data.title,
                company: data.company,
                skills: data.skills || data.interests,
                email: data.email,
            };
            return mentor;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            const mentorsList = await fetchMentors();
            setMentors(mentorsList);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#6200EE" />
                <Text style={styles.loadingText}>Loading mentors...</Text>
            </View>
        );
    }

    const handleRequestMentorship = async (mentor: Mentor) => {
        if (!auth.currentUser) {
            alert("Please log in to request mentorship.");
            return;
        }
        const userDoc = doc(db, "users", auth.currentUser.uid);
        let emailAddress = "csinnohub@cs.ubbcluj.ro";
        let subject = "In-app mentorship request";
        let body = `Hello!%0D%0AI would like to request mentorship from ${mentor.name}.%0D%0AHere is my contact information: ${auth.currentUser.email}.%0D%0AThank you!`;
        Linking.openURL(`mailto:${emailAddress}?subject=${subject}&body=${body}`);
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {mentors.map((mentor, index) => (
                    <View key={index} style={styles.cardWrapper}>
                        <Card containerStyle={styles.card}>
                            <Card.Title style={styles.cardTitle}>{mentor.name}</Card.Title>
                            <Card.Divider />
                            <Avatar
                                size="xlarge"
                                rounded
                                source={{ uri: mentor.pictureURL }}
                                containerStyle={styles.avatar}
                            />
                            <Text style={styles.titleLabel}>{mentor.title}</Text>
                            <Text style={styles.infoLabel}>Skills</Text>
                            <Text>{mentor.skills.join(", ")}</Text>
                            {mentor.company !== "None" && (
                                <>
                                    <Text style={styles.infoLabel}>Company</Text>
                                    <Text>{mentor.company}</Text>
                                </>
                            )}
                            <Button
                                title="Request Mentorship"
                                buttonStyle={styles.button}
                                onPress={() => handleRequestMentorship(mentor)}
                            />
                        </Card>
                    </View>
                ))}        
            </ScrollView>
        </GestureHandlerRootView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
    },
    card: {
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: 300,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
    infoLabel: {
        fontSize: 16,
        marginTop: 12,
        fontWeight: "bold",
    },
    titleLabel: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
    button: {
        backgroundColor: "#6200EE",
        borderRadius: 10,
        marginTop: 15,
        paddingVertical: 10,
    },
    cardWrapper: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: {
        alignSelf: "center",
        backgroundColor: "#6200EE",
        marginBottom: 10,
    },
    scrollView: {
        paddingTop: 30,
        paddingBottom: 30,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#6200EE",
        alignSelf: "center",
    },
});

export default Mentors;