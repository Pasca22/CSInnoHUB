import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, ScrollView, ActivityIndicator, View } from "react-native";
import { db } from "@/firebaseConfig";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { Event } from "./types";
import { AuthContext } from "@/app/index";
import Login from "@/app/login";
import {
  Text,
  Icon,
  Button,
  Avatar,
  Badge,
  Divider,
  Card,
  LinearProgress,
} from "@rneui/themed";

export default function Events() {
  const isAuthenticated = useContext(AuthContext);
  if (!isAuthenticated) return <Login />;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async (): Promise<Event[]> => {
    const eventsCollection = collection(db, "events");
    const eventsSnapshot = await getDocs(eventsCollection);

    return eventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const event: Event = {
        title: data.title,
        description: data.description,
        date: data.date instanceof Timestamp ? data.date : new Timestamp(0, 0),
        location: data.location,
      };
      return event;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const eventsList = await fetchEvents();
      setEvents(eventsList);
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
    <ScrollView style={styles.container}>
      {events.length === 0 ? (
        <View style={styles.noEventsContainer}>
          <Icon name="event-busy" size={50} color="#BDBDBD" />
          <Text style={styles.noEventsText}>No Events Available</Text>
        </View>
      ) : (
        events.map((event, index) => (
          <Card key={index} containerStyle={styles.cardContainer}>
            <Card.Title style={styles.cardTitle}>{event.title}</Card.Title>
            <Card.Divider />
            <View style={styles.header}>
              <Avatar
                size="medium"
                rounded
                icon={{ name: "event", type: "material", color: "#fff" }}
                containerStyle={{ backgroundColor: "#6a11cb" }}
              />
              <Text style={styles.cardSubtitle}>
                {isUpcomingEvent(event.date) ? "Upcoming Event" : "Past Event"}
              </Text>
              <Badge
                status={isUpcomingEvent(event.date) ? "success" : "warning"}
                value={isUpcomingEvent(event.date) ? "Upcoming" : "Past"}
                containerStyle={styles.badge}
              />
            </View>
            <Text style={styles.cardText}>{event.description}</Text>
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Icon name="calendar-today" type="material" size={16} color="#6a11cb" />
                <Text style={styles.detailText}>{formatDate(event.date)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="place" type="material" size={16} color="#6a11cb" />
                <Text style={styles.detailText}>{event.location}</Text>
              </View>
            </View>
            <Button
              title="Learn More"
              type="outline"
              buttonStyle={styles.button}
              titleStyle={styles.buttonText}
            />
          </Card>
        ))
      )}
    </ScrollView>
  );
}

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
    marginTop: 10,
    fontSize: 16,
    color: "#6200EE",
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEventsText: {
    marginTop: 10,
    fontSize: 16,
    color: "#BDBDBD",
  },
  cardContainer: {
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#6a11cb",
  },
  cardSubtitle: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#6a11cb",
  },
  badge: {
    position: "absolute",
    right: 0,
  },
  cardText: {
    marginTop: 10,
    fontSize: 14,
    color: "#333",
    textAlign: "justify",
  },
  details: {
    marginTop: 15,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#6a11cb",
  },
   header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  button: {
    borderColor: "#6a11cb",
    borderWidth: 1,
    borderRadius: 10,
  },
  buttonText: {
    color: "#6a11cb",
  },
});
