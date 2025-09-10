import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { doc, Timestamp, DocumentReference, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";

// Import components from react-native-paper
import {
  Button,
  Card,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

interface RequestJoinModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: DocumentReference | null;
}

const RequestJoinModal = ({ visible, onClose, projectId }: RequestJoinModalProps) => {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const theme = useTheme();

  // Clear state when the modal is closed or opened
  useEffect(() => {
    if (visible) {
      setRole("");
      setMessage("");
    }
  }, [visible]);

  const handleSendRequest = async () => {
    if (!role.trim()) {
      setMessage("Please specify your desired role.");
      return;
    }
    setMessage("");

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

      const alreadyRequested = existingRequests.some((req: any) => req.ref?.id === userRef.id);
      if (alreadyRequested) {
        setMessage("You have already sent a request to this project.");
        setLoading(false);
        return;
      }

      const updatedRequests = [
        ...existingRequests,
        { ref: userRef, role, date: Timestamp.now() },
      ];

      await updateDoc(projectId, { requests: updatedRequests });

      setMessage("Request sent successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Error sending request:", error);
      setMessage("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <Portal>
        <Modal visible={visible} onDismiss={onClose}>
          <Card style={styles.modalCard}>
            <Card.Title title="Request to Join Project" />
            <Card.Content>
              <TextInput
                  label="Desired Role"
                  value={role}
                  onChangeText={setRole}
                  placeholder="e.g., Designer, Developer"
                  mode="outlined"
              />
              {!!message && (
                  <Text style={[styles.message, {color: message.includes('successfully') ? 'green' : theme.colors.error}]}>
                    {message}
                  </Text>
              )}
            </Card.Content>
            <Card.Actions>
              <Button onPress={onClose} disabled={loading} textColor={theme.colors.error}>
                Cancel
              </Button>
              <Button
                  onPress={handleSendRequest}
                  mode="contained"
                  loading={loading}
                  disabled={loading}
              >
                Send Request
              </Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
  );
};

const styles = StyleSheet.create({
  modalCard: {
    margin: 20,
  },
  message: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
});

export default RequestJoinModal;