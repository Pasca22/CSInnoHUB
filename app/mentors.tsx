import React, { useEffect, useState } from "react";
import { View, StyleSheet, Linking } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Mentor } from "./types";
import { auth, db } from "@/firebaseConfig";
import { collection, getDocs, doc } from "firebase/firestore";
// NEW: Import the useSafeAreaInsets hook
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import components from react-native-paper
import {
    ActivityIndicator as PaperActivityIndicator,
    Avatar,
    Button,
    Card,
    Chip,
    Text,
} from "react-native-paper";

const Mentors = () => {
    const [mentors, setMentors] = useState<Mentor[]>([]);
    const [loading, setLoading] = useState(true);
    // NEW: Get the inset values from the hook
    const insets = useSafeAreaInsets();

    const fetchMentors = async (): Promise<Mentor[]> => {
        const mentorsSnapshot = await getDocs(collection(db, "mentors"));

        return mentorsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                name: data.name,
                pictureURL: data.pictureURL,
                title: data.title,
                company: data.company,
                skills: data.skills || data.interests,
                email: data.email,
            };
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

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <PaperActivityIndicator size="large" />
                <Text style={styles.loadingText}>Loading mentors...</Text>
            </View>
        );
    }

    return (
        // MODIFIED: Replaced SafeAreaView with a standard View
        <View style={styles.fullScreen}>
            <ScrollView
                // MODIFIED: Applied dynamic padding using the insets
                contentContainerStyle={[
                    styles.scrollView,
                    {
                        paddingTop: insets.top + 20,
                        paddingBottom: insets.bottom + 20,
                    }
                ]}
            >
                {mentors.map((mentor, index) => (
                    <Card key={index} style={styles.card}>
                        <Card.Title
                            title={mentor.name}
                            subtitle={mentor.title}
                            titleStyle={styles.cardTitle}
                            subtitleStyle={styles.cardSubtitle}
                            left={(props) => <Avatar.Image {...props} source={{ uri: mentor.pictureURL }} />}
                        />
                        <Card.Content>
                            {mentor.company !== "None" && (
                                <Text variant="bodyLarge" style={styles.companyText}>
                                    Company: {mentor.company}
                                </Text>
                            )}
                            <Text variant="titleMedium" style={styles.skillsTitle}>Skills</Text>
                            <View style={styles.chipContainer}>
                                {mentor.skills.map((skill, skillIndex) => (
                                    <Chip key={skillIndex} style={styles.chip}>{skill}</Chip>
                                ))}
                            </View>
                        </Card.Content>
                        <Card.Actions>
                            <Button
                                mode="contained"
                                onPress={() => handleRequestMentorship(mentor)}
                                style={styles.button}
                            >
                                Request Mentorship
                            </Button>
                        </Card.Actions>
                    </Card>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // MODIFIED: Removed vertical padding, as it's now handled dynamically
    scrollView: {
        paddingHorizontal: 16,
    },
    card: {
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 20,
    },
    cardSubtitle: {
        fontSize: 16,
    },
    companyText: {
        marginBottom: 16,
        fontStyle: 'italic',
    },
    skillsTitle: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        backgroundColor: '#e0e0e0',
    },
    button: {
        flex: 1,
        marginTop: 10,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
});

export default Mentors;