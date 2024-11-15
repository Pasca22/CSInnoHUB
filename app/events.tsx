import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { db } from "../firebaseConfig"; 
import { collection, getDocs, Timestamp } from "firebase/firestore";

export default function Events() {
  // Stare pentru a stoca lista de evenimente
  const [events, setEvents] = useState([]);

  // Functia pentru a aduce datele din Firestore
  async function fetchEvents() {
    const eventsCollection = collection(db, "events"); 
    const eventsSnapshot = await getDocs(eventsCollection);
    return eventsSnapshot.docs.map((doc) => doc.data());
  }

  // Folosim useEffect pentru a aduce datele la incarcarea componentei
  useEffect(() => {
    const fetchData = async () => {
      const eventsList = await fetchEvents();
      setEvents(eventsList);
    };
    fetchData();
  }, []);

  // convert timestamp to string
  function formatDate(date) {
    return date instanceof Timestamp
      ? date.toDate().toLocaleString()
      : date;
  }

  // return event list
  return (
    <View>
      {events.length === 0 ? (
        <Text>No Events Available</Text> // daca nu sunt
      ) : (
        events.map((event, index) => (
          <View key={index} style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{event.title}</Text>
            <Text>{event.description}</Text>
            <Text>Date: {formatDate(event.date)}</Text> {/* Formateaza data inainte de afisare */}
            <Text>Location: {event.location}</Text>
          </View>
        ))
      )}
    </View>
  );
}


