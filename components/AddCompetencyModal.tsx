import React, { useEffect, useState } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { db } from "@/firebaseConfig";
import { collection, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import Autocomplete from "react-native-autocomplete-input";

// Import components from react-native-paper
import { Button, Card, Modal, Portal, useTheme } from "react-native-paper";

interface Props {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  existingCompetencies: string[];
  onCompetencyAdded: (newSkill: string) => void;
}

const AddCompetencyModal: React.FC<Props> = ({
                                               visible,
                                               onClose,
                                               projectId,
                                               existingCompetencies,
                                               onCompetencyAdded,
                                             }) => {
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (visible) {
      const fetchSkills = async () => {
        const snapshot = await getDocs(collection(db, "competencies"));
        const skills = snapshot.docs.map((doc) => doc.data().name as string);
        setAllSkills(skills);
      };
      fetchSkills();
    } else {
      // Reset state on close
      setSelectedSkill("");
      setShowSuggestions(false);
    }
  }, [visible]);

  const filteredSkills = selectedSkill
      ? allSkills.filter(
          (skill) =>
              skill.toLowerCase().includes(selectedSkill.toLowerCase()) &&
              !existingCompetencies.includes(skill)
      )
      : [];

  const handleAdd = async () => {
    if (!selectedSkill || existingCompetencies.includes(selectedSkill)) return;

    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      competencies: arrayUnion(selectedSkill),
    });
    onCompetencyAdded(selectedSkill);
    onClose();
  };

  return (
      <Portal>
        <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalContent}>
          <Card>
            <Card.Title title="Add Competency" />
            <Card.Content>
              {/* The Autocomplete component is preserved for its unique functionality */}
              <Autocomplete
                  data={showSuggestions ? filteredSkills : []}
                  value={selectedSkill}
                  onChangeText={(text) => {
                    setSelectedSkill(text);
                    setShowSuggestions(true);
                  }}
                  flatListProps={{
                    keyExtractor: (_, idx) => idx.toString(),
                    renderItem: ({ item }) => (
                        <TouchableOpacity
                            style={styles.autocompleteItem}
                            onPress={() => {
                              setSelectedSkill(item);
                              setShowSuggestions(false);
                            }}
                        >
                          <Text style={styles.autocompleteText}>{item}</Text>
                        </TouchableOpacity>
                    ),
                  }}
                  inputContainerStyle={styles.inputContainer}
                  listContainerStyle={styles.suggestionContainer}
                  placeholder="Search for a skill..."
              />
            </Card.Content>
            <Card.Actions>
              <Button onPress={onClose} textColor={theme.colors.error}>Cancel</Button>
              <Button onPress={handleAdd} mode="contained" disabled={!selectedSkill}>Add</Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: 20,
    justifyContent: 'center',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  suggestionContainer: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginTop: 5,
  },
  autocompleteItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  autocompleteText: {
    fontSize: 16,
    color: "#333",
  },
});

export default AddCompetencyModal;