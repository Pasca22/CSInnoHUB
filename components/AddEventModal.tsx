import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import DatePicker from "@/components/DatePicker";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { ActivityIndicator, Button, Card, Modal, Portal, Text, TextInput, useTheme } from "react-native-paper";

interface AddEventModalProps {
    modalVisible: boolean;
    setModalVisible: (value: boolean) => void;
}

function AddEventModal({ modalVisible, setModalVisible }: AddEventModalProps) {
    const [eventName, setEventName] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date());
    const [location, setLocation] = useState("");
    const [registrationLink, setRegistrationLink] = useState("");
    const [operationMessage, setOperationMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const handleCancel = () => {
        if (!loading) {
            unsetAllFields();
            setModalVisible(false);
        }
    };

    const unsetAllFields = () => {
        setEventName("");
        setDescription("");
        setDate(new Date());
        setLocation("");
        setRegistrationLink("");
        setOperationMessage("");
    };

    const handleAdd = async () => {
        setOperationMessage("");
        if (!eventName.trim()) return setOperationMessage("Event name cannot be empty.");
        if (!location.trim()) return setOperationMessage("Event location cannot be empty.");
        const now = new Date();
        now.setMinutes(now.getMinutes() - 1);
        if (date < now) return setOperationMessage("Event date cannot be in the past.");

        const eventData = {
            name: eventName,
            date: Timestamp.fromDate(date),
            description: description,
            location: location,
            registrationLink: registrationLink,
        };

        setLoading(true);
        try {
            await addDoc(collection(db, "events"), eventData);
            handleCancel();
        } catch (error) {
            console.error("Error adding document: ", error);
            setOperationMessage("Failed to add event. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Portal>
            <Modal visible={modalVisible} onDismiss={handleCancel}>
                <Card style={styles.modalCard}>
                    <ScrollView>
                        <Card.Title title="Add New Event" />
                        <Card.Content>
                            <TextInput label="Event Name" value={eventName} onChangeText={setEventName} mode="outlined" style={styles.input} />
                            <TextInput label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={4} mode="outlined" style={styles.input} />
                            <Text>Start date</Text>
                            <DatePicker date={date} setDate={setDate} textValue="Starting date"/>
                            <TextInput label="Location" value={location} onChangeText={setLocation} mode="outlined" style={styles.input} />
                            <TextInput label="Registration Link (Optional)" value={registrationLink} onChangeText={setRegistrationLink} mode="outlined" style={styles.input} />
                            {loading ? (
                                <ActivityIndicator animating={true} style={styles.loader} />
                            ) : (
                                <Text style={styles.operationMessage}>{operationMessage}</Text>
                            )}
                        </Card.Content>
                        <Card.Actions style={styles.actions}>
                            <Button onPress={handleCancel} disabled={loading} textColor={theme.colors.error}>Cancel</Button>
                            <Button onPress={handleAdd} mode="contained" loading={loading} disabled={loading}>Add Event</Button>
                        </Card.Actions>
                    </ScrollView>
                </Card>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalCard: {
        margin: 20,
        // maxHeight: '90%',
        // justifyContent: 'center',
        // alignItems: 'center',
        // padding: 10

    },
    input: {
        marginBottom: 16,
    },
    actions: {
        justifyContent: 'flex-end',
        padding: 16,
    },
    loader: {
        marginVertical: 10,
    },
    operationMessage: {
        textAlign: "center",
        fontSize: 14,
        color: "#B00020",
        marginTop: 8,
        minHeight: 20,
    },
});

export default AddEventModal;