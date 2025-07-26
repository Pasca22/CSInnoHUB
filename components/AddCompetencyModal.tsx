import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Button } from "@rneui/themed";
import { db } from "@/firebaseConfig";
import { collection, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import Autocomplete from "react-native-autocomplete-input";

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

  useEffect(() => {
    const fetchSkills = async () => {
      const snapshot = await getDocs(collection(db, "competencies"));
      const skills = snapshot.docs.map((doc) => doc.data().name as string);
      setAllSkills(skills);
    };
    fetchSkills();
  }, []);

  const filteredSkills = allSkills.filter(
    (skill) =>
      skill.toLowerCase().includes(selectedSkill.toLowerCase()) &&
      !existingCompetencies.includes(skill)
  );

  const handleAdd = async () => {
    if (!selectedSkill || existingCompetencies.includes(selectedSkill)) return;

    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      competencies: arrayUnion(selectedSkill),
    });
    onCompetencyAdded(selectedSkill);

    setSelectedSkill("");
    setShowSuggestions(false);
    //onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Add Competency</Text>

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

          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={onClose} type="outline" />
            <Button title="Add" onPress={handleAdd} disabled={!selectedSkill} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    maxHeight: "90%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#6200EE",
  },
  inputContainer: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: "#ccc",
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
});

export default AddCompetencyModal;
