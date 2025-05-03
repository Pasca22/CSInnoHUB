import {Modal, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import DatePicker from "@/components/DatePicker";
import React, {useState} from "react";
import {Event} from "@/app/types";
import {addDoc, collection, Timestamp} from "firebase/firestore";
import {db} from "@/firebaseConfig";

interface AddEventModalProps {
    modalVisible: boolean;
    setModalVisible: (value: boolean) => void;
    events: Event[];
    setEvents: (projects: Event[]) => void;
}

function AddEventModal({modalVisible, setModalVisible, events, setEvents}: AddEventModalProps) {
    const [eventName, setEventName] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date());
    const [location, setLocation] = useState("");
    const [registrationLink, setRegistrationLink] = useState("");
    const [operationMessage, setOperationMessage] = useState("");

    const [loading, setLoading] = useState(false);

    const handleCancel = () => {
        setModalVisible(false);
    }

    const unsetAllFields = () => {
        setEventName("");
        setDescription("");
        setDate(new Date());
        setLocation("");
        setRegistrationLink("");
    }

    const handleAdd = async () => {
        // Validation
        if (!eventName) {
            setOperationMessage("No event name")
            return;
        }

        if (events.some((existingProject) => existingProject.name === eventName)) {
            setOperationMessage("Project already exists");
            return;
        }

        if(!location){
            setOperationMessage("No event location");
            return;
        }

        if (date < new Date()) {
            setOperationMessage("Invalid date");
            return;
        }

        // Save the event to the database
        let event : Event = {
            name: eventName,
            date: Timestamp.fromDate(date),
            description: description,
            location: location,
            registrationLink: registrationLink
        };

        setLoading(true);
        await addDoc(collection(db, "events"), event);
        setLoading(false);

        setEvents([...events, event]);

        setModalVisible(false);

        unsetAllFields();
    }

    return (
        <View style={styles.modalContainer}>
            <Modal
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalView}>
                    <ScrollView>
                        <Text style={styles.modalText}>Add New Event</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Event name"
                            value={eventName}
                            onChangeText={setEventName}
                        />

                        <TextInput
                            style={styles.inputMultiline}
                            placeholder="Description"
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <DatePicker
                            date={date}
                            setDate={setDate}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Location"
                            value={location}
                            onChangeText={setLocation}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Registration link"
                            value={registrationLink}
                            onChangeText={setRegistrationLink}
                        />

                        <View style={styles.actionButtonsView}>
                            <TouchableOpacity
                                onPress={handleAdd}
                                style={styles.actionButtons}
                            >
                                <Text style={styles.buttonText}>Add</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCancel}
                                style={styles.actionButtons}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.operationMessage}>{operationMessage}</Text>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    modalView: {
        margin: "auto",
        minWidth: 340,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
    },
    input: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        width: "100%",
    },
    inputMultiline: {
        height: 80,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
        paddingVertical: 10,
        textAlignVertical: "top",
        width: "100%",
    },
    actionButtonsView: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
    },
    actionButtons: {
        backgroundColor: '#6200EE',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
        width: "30%",
        alignItems: "center",
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#6200EE",
        alignSelf: "center",
    },
    operationMessage: {
        marginTop: 15,
        marginBottom: 0,
        paddingBottom: 0,
        textAlign: "center",
        fontSize: 16,
        color: "#FF0000",
    },
});

export default AddEventModal;