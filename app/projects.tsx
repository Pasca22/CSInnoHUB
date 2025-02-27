import React, { useState } from "react";
import { Text, StyleSheet } from "react-native";
import { FAB } from "react-native-elements";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AddProjectModal from "@/components/AddProjectModal";

const Projects = () => {
	const [modalVisible, setModalVisible] = useState(false);
	const handleAddProject = () => { setModalVisible(true); };

	return (
		<GestureHandlerRootView style={styles.container}>
			<Text style={styles.text}>Projects Page</Text>
			<FAB
				icon={{ name: 'add', color: 'white' }}
				placement="right"
				color="#6200EE"
				onPress={handleAddProject}/>

			<AddProjectModal
				modalVisible={modalVisible}
				setModalVisible={setModalVisible}
			/>
		</GestureHandlerRootView>
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
});

export default Projects;
