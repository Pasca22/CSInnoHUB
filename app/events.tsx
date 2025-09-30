import React, { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, Linking, ScrollView, StyleSheet, View } from "react-native";
import { auth, db } from "@/firebaseConfig";
import { collection, doc, getDoc, getDocs, Timestamp } from "firebase/firestore";
import { Event } from "./types";
import AddEventModal from "@/components/AddEventModal";
import ReadMoreText from "@/components/ReadMore";
// NEW: Import the useSafeAreaInsets hook
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Button,
  Card,
  Chip,
  FAB,
  Icon,
  Text,
  ProgressBar,
  MD3Colors,
} from "react-native-paper";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  // NEW: Get the inset values from the hook
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchUserRole = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!user) return;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data()?.role) {
          setIsAdmin(true);
        }
      });
      return () => unsubscribe();
    };
    fetchUserRole();
  }, []);

  const fetchEvents = async (): Promise<Event[]> => {
    const eventsSnapshot = await getDocs(collection(db, "events"));
    return eventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        name: data.name,
        description: data.description,
        date: data.date instanceof Timestamp ? data.date : new Timestamp(0, 0),
        location: data.location,
        registrationLink: data.registrationLink || "",
      };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const eventsList = await fetchEvents();
      const sortedEvents = eventsList.sort((a, b) => a.date.toMillis() - b.date.toMillis());
      const now = new Date();
      const upcomingEvents = sortedEvents.filter(event => event.date.toMillis() > now.getTime());
      const pastEvents = sortedEvents.filter(event => event.date.toMillis() <= now.getTime());

      setEvents([...upcomingEvents, ...pastEvents.slice(-1)]);
      setLoading(false);
    };
    fetchData();
  }, [modalVisible]);

  const formatDate = (date: Timestamp): string => {
    return date.toDate().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const isUpcomingEvent = (date: Timestamp): boolean => {
    return date.toMillis() > new Date().getTime();
  };

  const openRegistrationLink = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
    }
  };

  if (loading) {
    return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6a11cb" />
          <Text style={styles.loadingText}>Loading events...</Text>
          <ProgressBar indeterminate color="#6a11cb" style={{ marginTop: 10, width: 200 }} />
        </View>
    );
  }

  return (
      // MODIFIED: Replaced GestureHandlerRootView with a standard View
      <View style={styles.fullScreen}>
        <ScrollView
            // MODIFIED: Apply dynamic padding using the insets
            contentContainerStyle={[
              styles.container,
              {
                paddingTop: insets.top + 20,
                paddingBottom: insets.bottom + 80 // Extra padding for FAB
              }
            ]}
        >
          {events.length === 0 ? (
              <View style={styles.noEventsContainer}>
                <Icon source="calendar-remove-outline" size={50} color="#BDBDBD" />
                <Text style={styles.noEventsText}>No Events Available</Text>
              </View>
          ) : (
              events.map((event, index) => (
                  <Card key={index} style={styles.cardContainer} mode="elevated">
                    <Card.Title
                        title={event.name}
                        titleStyle={styles.cardTitle}
                        subtitleStyle={styles.detailText}
                        right={() => (
                            <Chip
                                icon={isUpcomingEvent(event.date) ? "calendar-check" : "calendar-remove"}
                                selectedColor={isUpcomingEvent(event.date) ? MD3Colors.primary40 : MD3Colors.error40}
                                style={styles.chip}
                            >
                              {isUpcomingEvent(event.date) ? "Upcoming" : "Past"}
                            </Chip>
                        )}
                    />
                    <Card.Content>
                      <View style={styles.detailRow}>
                        <Icon source="clock-time-four-outline" size={16} color="#6a11cb" />
                        <Text style={styles.detailText}>{formatDate(event.date)}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Icon source="map-marker-outline" size={16} color="#6a11cb" />
                        <Text style={styles.detailText}>{event.location}</Text>
                      </View>
                      <ReadMoreText style={styles.cardText} text={event.description} />
                    </Card.Content>
                    {event.registrationLink && (
                        <Card.Actions>
                          <Button
                              mode="contained"
                              disabled={!isUpcomingEvent(event.date)}
                              onPress={() => openRegistrationLink(event.registrationLink)}
                              style={styles.registerButton}
                              labelStyle={styles.registerText}
                              icon="pencil-plus-outline"
                          >
                            Register Now
                          </Button>
                        </Card.Actions>
                    )}
                  </Card>
              ))
          )}
        </ScrollView>
        {isAdmin && (
            <FAB
                icon="plus"
                color="white"
                onPress={() => setModalVisible(true)}
                // MODIFIED: FAB style now uses the insets for perfect positioning
                style={[
                  styles.fab,
                  {
                    right: insets.right + 16,
                    bottom: insets.bottom + 16,
                  }
                ]}
            />
        )}
        {modalVisible && (
            <AddEventModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
            />
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // MODIFIED: Removed flexGrow, backgroundColor, and vertical padding
  container: {
    paddingHorizontal: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6a11cb",
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: '50%',
  },
  noEventsText: {
    marginTop: 10,
    fontSize: 18,
    color: "#BDBDBD",
  },
  cardContainer: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6a11cb",
  },
  chip: {
    marginRight: 16,
    backgroundColor: 'transparent'
  },
  cardText: {
    marginTop: 15,
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6a11cb",
  },
  registerButton: {
    flex: 1,
    backgroundColor: "#6a11cb",
    marginTop: 10,
  },
  registerText: {
    color: "white",
    fontSize: 16,
  },
  // MODIFIED: Removed margin, right, and bottom for dynamic positioning
  fab: {
    position: 'absolute',
    backgroundColor: '#6a11cb',
  },
});