import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import { Mentor } from "./types";
import { auth, db } from "@/firebaseConfig";
import { collection, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
import { Card, Button, Text, Avatar } from "@rneui/themed";
import { AuthContext } from "@/app/index";
import Login from "@/app/login";


const Mentors = () => {
    const isAuthenticated = useContext(AuthContext);
    if (!isAuthenticated) return <Login />;

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
                interests: data.interests,
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
        const requesterDoc = await getDoc(doc(db, "users", "" + auth.currentUser?.uid));
        const requesterName = requesterDoc.data()?.nume;
        setDoc(doc(db, "mentorship_requests", "" + new Date().getTime()), {
            requester_uid: auth.currentUser?.uid,
            requester_name: requesterName,
            mentor_name: mentor.name,
            timestamp: new Date(),
            status: "pending",
        });
        alert("Request sent to " + mentor.name);
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
                            <Text style={styles.infoLabel}>Interests</Text>
                            <Text>{mentor.interests.join(", ")}</Text>
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