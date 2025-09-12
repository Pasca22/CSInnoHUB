import React, { useEffect, useState } from "react";
import { StyleSheet, View, FlatList, Alert } from "react-native";
import { Timestamp, updateDoc, arrayRemove, arrayUnion, DocumentReference } from "firebase/firestore";
import { ProjectJoinRequest } from "@/app/types";

import {
  Avatar,
  Button,
  Card,
  List,
  Modal,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";

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
                             projectRef,
                           }: ViewRequestsModalProps) => {
  const [localRequests, setLocalRequests] = useState<ProjectJoinRequest[]>([]);
  const theme = useTheme();

  useEffect(() => {
    setLocalRequests(requests);
  }, [requests, visible]);

  const formatDate = (timestamp: Timestamp): string =>
      timestamp.toDate().toLocaleString();

  const handleAccept = async (requestToAccept: ProjectJoinRequest) => {
    if (!projectRef) return Alert.alert("Error", "Project reference is missing");
    try {
      await updateDoc(projectRef, {
        requests: arrayRemove(requestToAccept),
        members: arrayUnion({ ref: requestToAccept.ref, role: requestToAccept.role }),
      });
      setLocalRequests(prev => prev.filter(req => req.ref.id !== requestToAccept.ref.id));
      Alert.alert("Success", "Request accepted.");
    } catch (error) {
      Alert.alert("Error", "Failed to accept request.");
    }
  };

  const handleDecline = async (requestToDecline: ProjectJoinRequest) => {
    if (!projectRef) return Alert.alert("Error", "Project reference is missing");
    try {
      await updateDoc(projectRef, {
        requests: arrayRemove(requestToDecline),
      });
      setLocalRequests(prev => prev.filter(req => req.ref.id !== requestToDecline.ref.id));
      Alert.alert("Success", "Request declined.");
    } catch (error) {
      Alert.alert("Error", "Failed to decline request.");
    }
  };

  return (
      <Portal>
        <Modal visible={visible} onDismiss={onClose}>
          <Card style={styles.modalCard}>
            <Card.Title title="Join Requests" />
            <Card.Content>
              {localRequests.length === 0 ? (
                  <Text style={styles.emptyText}>No pending requests</Text>
              ) : (
                  <FlatList
                      data={localRequests}
                      keyExtractor={(item) => item.ref.id}
                      renderItem={({ item }) => (
                          <List.Item
                              title={users[item.ref.id] || "Unknown"}
                              description={`Role: ${item.role}\n${formatDate(item.date)}`}
                              descriptionNumberOfLines={2}
                              left={() => <Avatar.Text size={40} label={users[item.ref.id]?.charAt(0) || "?"} />}
                              right={() => (
                                  <View style={styles.buttonRow}>
                                    <Button mode="contained" compact onPress={() => handleAccept(item)}>Accept</Button>
                                    <Button mode="outlined" compact onPress={() => handleDecline(item)} textColor={theme.colors.error} style={{borderColor: theme.colors.error}}>Decline</Button>
                                  </View>
                              )}
                          />
                      )}
                  />
              )}
            </Card.Content>
            <Card.Actions>
              <Button onPress={onClose} mode="contained">Close</Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
  );
};

const styles = StyleSheet.create({
  modalCard: {
    width: '90%',
    maxHeight: '80%',
    alignSelf: 'center',
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    paddingVertical: 20,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default ViewRequestsModal;