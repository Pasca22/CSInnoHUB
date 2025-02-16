import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from "react-native";
import { FAB } from "react-native-elements";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import DatePicker from "@/components/DatePicker";
import TagInput from "@/components/TagInput";
import MultiSelectCustom from "@/components/MultiSelectCustom";

const Projects = () => {
	const [modalVisible, setModalVisible] = useState(false);
	const [roleModalVisible, setRoleModalVisible] = useState(false);

	const [projectName, setProjectName] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState(new Date());
	const [tags, setTags] = useState<any[]>([]);
	const [members, setMembers] = useState([]);

	const dataForMembersDropdown = [
		{ label: 'Item 1', value: '1' },
		{ label: 'Item 2', value: '2' },
		{ label: 'Item 3', value: '3' },
		{ label: 'Item 4', value: '4' },
		{ label: 'Item 5', value: '5' },
		{ label: 'Item 6', value: '6' },
		{ label: 'Item 7', value: '7' },
		{ label: 'Item 8', value: '8' },
	];

	const handleAddProject = () => {
		setModalVisible(true);
	};

	const handleSaveProject = () => {
		setModalVisible(false);
		setRoleModalVisible(false);

		// TODO: Save project to database
	};

	const handleNext = () => {
		setModalVisible(false);
		setRoleModalVisible(true);
	};

	const handleCancel = () => {
		setModalVisible(false);
		setRoleModalVisible(false);
	};

	return (
		<GestureHandlerRootView style={styles.container}>
			<Text style={styles.text}>Projects Page</Text>
			<FAB
				icon={{ name: 'add', color: 'white' }}
				placement="right"
				color="#6200EE"
				onPress={handleAddProject}/>
			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modalView}>
					<ScrollView>
						<Text style={styles.modalText}>Add New Project</Text>

						<TextInput
							style={styles.input}
							placeholder="Project Name"
							value={projectName}
							onChangeText={setProjectName}
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

						<TagInput 
							tags={tags}
							setTags={setTags}
						/>

						<MultiSelectCustom
							data={dataForMembersDropdown}
							placeholder="Select Members"
							selectedItems={members}
							setSelectedItems={setMembers}
						/>

						<View style={styles.actionButtonsView}>
							<TouchableOpacity 
								onPress={handleNext} 
								style={styles.actionButtons}
							>
								<Text style={styles.buttonText}>Next</Text>
							</TouchableOpacity>
							
							<TouchableOpacity 
								onPress={handleCancel}
								style={styles.actionButtons}
							>
								<Text style={styles.buttonText}>Cancel</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</View>
			</Modal>
			<Modal
				animationType="slide"
				transparent={true}
				visible={roleModalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modalView}>
					<ScrollView>
						<Text style={styles.modalText}>Establish roles of the members</Text>

						<View>
							{members.map((member) => (
								<View key={member}>
									<Text>{member}</Text>
									<TextInput
										placeholder="Role"
										style={styles.input}
									/>
								</View>
							))}
						</View>
						
						<View style={styles.actionButtonsView}>
							<TouchableOpacity 
								onPress={handleSaveProject} 
								style={styles.actionButtons}
							>
								<Text style={styles.buttonText}>Save</Text>
							</TouchableOpacity>
							
							<TouchableOpacity 
								onPress={handleCancel}
								style={styles.actionButtons}
							>
								<Text style={styles.buttonText}>Cancel</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</View>
			</Modal>
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
	modalView: {
		margin: 20,
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
});

export default Projects;
