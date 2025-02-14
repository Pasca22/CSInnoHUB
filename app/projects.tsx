import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TextInput, Button } from "react-native";
import { FAB } from "react-native-elements";
import DateTimePicker from '@react-native-community/datetimepicker';

const Projects = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [date, setDate] = useState(new Date());

  const handleAddProject = () => {
    setModalVisible(true);
  };

  const handleSaveProject = () => {
    // Save project to database ...
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Projects Page</Text>
      <FAB
        icon={{ name: 'add', color: 'white' }}
        placement="right"
        color="#6200EE"
        onPress={handleAddProject}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Add New Project</Text>
          <TextInput
            style={styles.input}
            placeholder="Project Name"
            value={projectName}
            onChangeText={setProjectName}
          />
          <TextInput
            style={styles.input}
            placeholder="Project Description"
            numberOfLines={4}
          />
          {/* TODO Display date that when clicked opens the picker */}
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || date;
              setDate(currentDate);
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Keywords"
          />
          <TextInput
            style={styles.input}
            placeholder="Members"
          />
          <View style={styles.actionButtonsView}>
            <Button title="Save" onPress={handleSaveProject} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
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
    marginBottom: 15,
    paddingHorizontal: 10,
    width: "100%",
  },
  actionButtonsView: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
});

export default Projects;
