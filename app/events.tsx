import React, {useContext, useEffect, useState} from "react";
import {ActivityIndicator, Linking, ScrollView, StyleSheet, View} from "react-native";
import {auth, db} from "@/firebaseConfig";
import {collection, doc, getDoc, getDocs, Timestamp} from "firebase/firestore";
import {Event} from "./types";
import {Badge, Button, Card, Icon, LinearProgress, Text,} from "@rneui/themed";
import {FAB} from "react-native-elements";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import AddEventModal from "@/components/AddEventModal";
import ReadMoreText from "@/components/ReadMore";

export default function Events() {
  // const isAuthenticated = useContext(AuthContext);
  // if (!isAuthenticated) return <Login />;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      // Check if user is logged in
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user == null) return;

        // Fetch user data from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          if(data["role"] != undefined)
            setIsAdmin(true);
        }
      });

      // Cleanup on unmount
      return () => unsubscribe();
    };

    fetchUserRole(); // Call the async function
  }, []);

  const fetchEvents = async (): Promise<Event[]> => {
    const eventsCollection = collection(db, "events");
    const eventsSnapshot = await getDocs(eventsCollection);

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
      const eventsList = await fetchEvents();
      const sortedEvents = eventsList.sort(
        (a, b) => a.date.toDate().getTime() - b.date.toDate().getTime()
      );
      const now = new Date();
      const upcomingEvents = sortedEvents.filter(
        (event) => event.date.toDate().getTime() > now.getTime()
      );
      const pastEvents = sortedEvents.filter(
        (event) => event.date.toDate().getTime() <= now.getTime()
      );

      if (pastEvents.length > 0) {
        const lastPastEvent = pastEvents[pastEvents.length - 1];
        setEvents([...upcomingEvents, lastPastEvent]);
      } else {
        setEvents(upcomingEvents);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatDate = (date: Timestamp): string => {
    return date.toDate().toLocaleString();
  };

  const isUpcomingEvent = (date: Timestamp): boolean => {
    return date.toDate() > new Date();
  };

  const openRegistrationLink = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
    }
  };

  const handleAddEvent = () => {
    setModalVisible(true);
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading events...</Text>
        <LinearProgress color="#6200EE" style={{ marginTop: 10 }} />
      </View>
    );
  }

  return (
      <GestureHandlerRootView style={{flex: 1}}>
    <ScrollView style={styles.container}>
      {events.length === 0 ? (
        <View style={styles.noEventsContainer}>
          <Icon name="event-busy" size={50} color="#BDBDBD" />
          <Text style={styles.noEventsText}>No Events Available</Text>
        </View>
      ) : (
        events.map((event, index) => (
          <Card key={index} containerStyle={styles.cardContainer}>
            <Card.Title style={styles.cardTitle}>{event.name}</Card.Title>
            <Card.Divider />
            <View style={styles.details}>
              <Badge
                  status={isUpcomingEvent(event.date) ? "success" : "warning"}
                  value={isUpcomingEvent(event.date) ? "Upcoming" : "Past"}
                  containerStyle={styles.badge}
              />
              <View style={styles.detailRow}>
                <Icon name="calendar-today" type="material" size={16} color="#6a11cb" />
                <Text style={styles.detailText}>{formatDate(event.date)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="place" type="material" size={16} color="#6a11cb" />
                <Text style={styles.detailText}>{event.location}</Text>
              </View>
            </View>
            <ReadMoreText style={styles.cardText} text={event.description}></ReadMoreText>
            {event.registrationLink ? (
              <Button
                type="solid"
                disabled={!isUpcomingEvent(event.date)}
                onPress={() => openRegistrationLink(event.registrationLink)}
                title="Register Now"
                titleStyle={styles.registerText}
                buttonStyle={styles.registerButton}
              />
            ) : null}
          </Card>
        ))
      )}
      </ScrollView>
        {isAdmin ? <FAB
            icon={{ name: "add", color: "white" }}
            placement="right"
            color="#6200EE"
            onPress={handleAddEvent}
        /> : null}

        {modalVisible ? (
            <AddEventModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                events={events}
                setEvents={setEvents}
            ></AddEventModal>
        ) : null}
      </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    height: '100%'
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
    color: "#6200EE",
    fontWeight: "500",
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noEventsText: {
    marginTop: 10,
    fontSize: 16,
    color: "#BDBDBD",
    fontWeight: "500",
  },
  cardContainer: {
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    marginBottom: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#6a11cb",
    marginBottom: 10,
  },
  cardSubtitle: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#6a11cb",
    fontWeight: "500",
  },
  badge: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  cardText: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
    textAlign: "justify",
    lineHeight: 20,
  },
  details: {
    marginTop: 15,
    marginBottom: 15,
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
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    borderColor: "#6a11cb",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
  },
  buttonText: {
    color: "#6a11cb",
    fontWeight: "500",
  },
  registerButton: {
    backgroundColor: "#6a11cb",
    borderRadius: 8,
    marginTop: 15,
    paddingVertical: 12,
  },
  registerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});