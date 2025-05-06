import React, { useState } from "react";
import { Modal, StyleSheet, TextInput, View } from "react-native";
import { Button, Text } from "@rneui/themed";
import {
  doc,
  Timestamp,
  DocumentReference, getDoc, updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";

interface RequestJoinModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: DocumentReference | null;
}

const RequestJoinModal = ({
  visible,
  onClose,
  projectId,
}: RequestJoinModalProps) => {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
  if (!role) return;

  try {
    setLoading(true);

    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    if (!projectId) throw new Error("Project not selected");

    const projectSnap = await getDoc(projectId);
    const projectData = projectSnap.data();

    if (!projectData) throw new Error("Project data not found");

    const existingRequests = projectData.requests || [];

    const userRef = doc(db, "users", user.uid);

    const alreadyRequested = existingRequests.some(
      (req: any) => req.ref?.id === userRef.id
    );

    if (alreadyRequested) {
      alert("You already sent a request to join this project.");
      return;
    }

    const updatedRequests = [
      ...existingRequests,
      {
        ref: userRef,
        role,
        date:Timestamp.now(),
      },
    ];

    await updateDoc(projectId, {
      requests: updatedRequests,
    });

    alert("Request sent successfully!");
    setRole("");
    onClose();
  } catch (error) {
    console.error("Error sending request:", error);
    alert("Failed to send request."+(error as Error).message);
  } finally {
    setLoading(false);
  }
};


  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text h4 style={styles.title}>Request to Join</Text>
          <Text style={styles.label}>Desired Role</Text>
          <TextInput
            style={styles.input}
            value={role}
            onChangeText={setRole}
            placeholder="e.g., Designer, Developer"
          />
          <Button
            title="Send Request"
            loading={loading}
            onPress={handleSendRequest}
            containerStyle={{ marginTop: 20 }}
          />
          <Button
            title="Cancel"
            type="clear"
            onPress={onClose}
            titleStyle={{ color: "red" }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    width: "85%",
    borderRadius: 10,
  },
  title: {
    marginBottom: 10,
    textAlign: "center",
    color: "#6200EE",
  },
  label: {
    fontWeight: "500",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
  },
});

export default RequestJoinModal;
