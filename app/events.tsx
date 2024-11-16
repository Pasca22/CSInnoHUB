import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { db } from "../firebaseConfig"; 
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { Event } from "./types";

export default function Events() {
  
  const [events, setEvents] = useState<Event[]>([]);
  
  async function fetchEvents() {
    const eventsCollection = collection(db, "events"); 
    const eventsSnapshot = await getDocs(eventsCollection);
    return eventsSnapshot.docs.map((doc) => doc.data());
  }

  useEffect(() => {
    const fetchData = async () => {
      const eventsList = await fetchEvents();
      setEvents(eventsList);
    };
    fetchData();
  }, []);

  function formatDate(date) {
    return date instanceof Timestamp
      ? date.toDate().toLocaleString()
      : date;
  }

  return (
    <View>
      {events.length === 0 ? (
        <Text>No Events Available</Text> 
      ) : (
        events.map((event, index) => (
          <View key={index} style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{event.title}</Text>
            <Text>{event.description}</Text>
            <Text>Date: {formatDate(event.date)}</Text> {}
            <Text>Location: {event.location}</Text>
          </View>
        ))
      )}
    </View>
  );
}


