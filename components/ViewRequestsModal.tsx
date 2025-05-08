import React, {useEffect, useState} from "react";
import { Modal, StyleSheet, View, FlatList } from "react-native";
import { Button, ListItem, Text, Avatar } from "@rneui/themed";
import {
  Timestamp,
  updateDoc,
  arrayRemove,
  arrayUnion,
  DocumentReference,
} from "firebase/firestore";
import { ProjectJoinRequest } from "@/app/types";

interface ViewRequestsModalProps {
  visible: boolean;
  onClose: () => void;
  requests: ProjectJoinRequest[];
  users: Record<string, string>;
  projectRef: DocumentReference | null;
}

const ViewRequestsModal = ({
  visible,
  onClose,
  requests,
  users,
  projectRef
}: ViewRequestsModalProps) => {
   const [localRequests, setLocalRequests] = useState<ProjectJoinRequest[]>([]);

  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);
  const formatDate = (timestamp: Timestamp): string =>
    timestamp.toDate().toLocaleString();

  const handleAccept = async (userId: string) => {
    try {
      if (!projectRef) {
        alert("Project reference is missing");
        return;
    }
      const requestToAccept = requests.find(req => req.ref.id === userId);
      if (!requestToAccept) return;

      await updateDoc(projectRef, {
        requests: arrayRemove(requestToAccept),
        members: arrayUnion({
          ref: requestToAccept.ref,
          role: requestToAccept.role,
        }),
      });
      setLocalRequests(prev => prev.filter(req => req.ref.id !== userId));
      alert("Request accepted.");
    } catch (error) {
      alert("Failed to accept request.");
    }
  };

  const handleDecline = async (userId: string) => {
    if (!projectRef) {
    alert("Project reference is missing");
    return;
    }
    try {
      const requestToDecline = requests.find(req => req.ref.id === userId);
      if (!requestToDecline) return;

      await updateDoc(projectRef, {
        requests: arrayRemove(requestToDecline),
      });
      setLocalRequests(prev => prev.filter(req => req.ref.id !== userId));
      alert("Request declined.");
    } catch (error) {
      alert("Failed to decline request.");
    }
  };

    return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text h4 style={styles.title}>Join Requests</Text>
          {localRequests.length === 0 ? (
            <Text style={styles.emptyText}>No pending requests</Text>
          ) : (
            <FlatList
              data={localRequests}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <ListItem bottomDivider>
                  <Avatar
                    rounded
                    title={users[item.ref.id]?.charAt(0) || "?"}
                    containerStyle={styles.avatar}
                  />
                  <ListItem.Content>
                    <ListItem.Title>
                      {users[item.ref.id] || "Unknown"}
                    </ListItem.Title>
                    <ListItem.Subtitle>{item.role}</ListItem.Subtitle>
                    <ListItem.Subtitle style={styles.dateText}>
                      {formatDate(item.date)}
                    </ListItem.Subtitle>
                    <View style={styles.buttonRow}>
                      <Button
                        title="Accept"
                        type="solid"
                        buttonStyle={styles.acceptButton}
                        onPress={() => handleAccept(item.ref.id)}
                      />
                      <Button
                        title="Decline"
                        type="outline"
                        buttonStyle={styles.declineButton}
                        titleStyle={{ color: "red" }}
                        onPress={() => handleDecline(item.ref.id)}
                      />
                    </View>
                  </ListItem.Content>
                </ListItem>
              )}
            />
          )}
          <Button title="Close" onPress={onClose} containerStyle={{ marginTop: 20 }} />
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
    width: "90%",
    borderRadius: 10,
    maxHeight: "80%",
  },
  title: {
    marginBottom: 15,
    textAlign: "center",
    color: "#6200EE",
  },
  avatar: {
    backgroundColor: "#6a11cb",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 20,
  },
  dateText: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    marginRight: 10,
  },
  declineButton: {
    borderColor: "red",
    paddingHorizontal: 10,
  },
});

export default ViewRequestsModal;
