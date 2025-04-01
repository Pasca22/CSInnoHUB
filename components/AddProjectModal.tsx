import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import DatePicker from "@/components/DatePicker";
import TagInput from "@/components/TagInput";
import MultiSelectCustom from "@/components/MultiSelectCustom";
import { db } from "@/firebaseConfig";
import { collection, getDocs, addDoc, doc, Timestamp } from "firebase/firestore";
import DropdownCustom from "@/components/DropdownCustom";
import { MembersDropdownDataType, Project } from "@/app/types";

interface AddProjectModalProps {
	modalVisible: boolean;
    setModalVisible: (value: boolean) => void;
	projects: Project[];
	setProjects: (projects: Project[]) => void;
}

function AddProjectModal({ modalVisible, setModalVisible, projects, setProjects }: AddProjectModalProps) {
	const [roleModalVisible, setRoleModalVisible] = useState(false);
	const [projectName, setProjectName] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState(new Date());
	const [tags, setTags] = useState<any[]>([]);
	const [members, setMembers] = useState<MembersDropdownDataType[]>([]);
	const [selectedMembers, setSelectedMembers] = useState([]);
	const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>({});
	const [founder, setFounder] = useState("");
	const [loading, setLoading] = useState(false);

	const unsetAllFields = () => {
		setProjectName("");
		setDescription("");
		setDate(new Date());
		setTags([]);
		setSelectedMembers([]);
		setSelectedRoles({});
		setFounder("");
	};

	const fetchUsersForMembersDropdown = async (): Promise<{ 
		label: string; 
		value: {
			refToUser : string;
			userName : string;
			role : string;
		}
	}[]> => {
		const usersSnapshot = await getDocs(collection(db, "users"));
		return usersSnapshot.docs.map((doc) => {
			const data = doc.data();
			const user: { 
				label: string, 
				value: {
					refToUser : string;
					userName : string;
					role : string;
				} 
			} = {
				label: data.name,
				value: {
					refToUser: doc.id,
					userName: data.name,
					role: "",
				}
			};
			return user;
		});
	};

	const handleSaveProject = async () => {
		// Generate the members list
		let membersList = selectedMembers.map((member) => {
			let deserializedMember = JSON.parse(member);
			return {
				ref: doc(db, `users/${deserializedMember.refToUser}`),
				role: selectedRoles[deserializedMember.refToUser],
			};
		});

		// Validation
		if (!founder) {
			Alert.alert("No founder", "Please select the founder");
			return;
		} 
		if (!membersList.every((member) => member.role)) {
			Alert.alert("No roles", "Please assign roles to all members");
			return;
		}
		
		// Save the project to the database
		let project : Project = {
			name: projectName,
			startingDate: Timestamp.fromDate(date),
			description: description,
			keywords: tags.join(","),
			members: membersList,
			founder: doc(db, `users/${JSON.parse(founder).refToUser}`),
		};

		setLoading(true);
		await addDoc(collection(db, "projects"), project);
		setLoading(false);
			
		setProjects([...projects, project]);

		setModalVisible(false);
		setRoleModalVisible(false);

		unsetAllFields();		
	};

	const handleNext = () => {
		// Validation
		if (!projectName) {
			Alert.alert("No project name", "Please fill the project name")
			return;
		} 
		if (projects.some((existingProject) => existingProject.name === projectName)) {
			Alert.alert("Project already exists", "Please choose a different name");
			return;
		} 
		if (date < new Date()) {
			Alert.alert("Invalid date", "Please select a future date")
			return;
		}
		if (selectedMembers.length < 1) {
			Alert.alert("No members", "Please select at least one member")
			return;
		}

		// Proceed to the next step
		setModalVisible(false);
		setRoleModalVisible(true);
	};

	const handleCancel = () => {
		// Close the modal and unset all fields
		setModalVisible(false);
		setRoleModalVisible(false);

		unsetAllFields();
	};

	
	useEffect(() => {
		const fetchMembers = async () => {
			const membersList = await fetchUsersForMembersDropdown();
			setMembers(membersList);
		};
		fetchMembers();
	}, []);

	if (loading) {
		return (
			<View style={styles.modalContainer}>
				<ActivityIndicator size="large" color="#6200EE" />
				<Text style={styles.loadingText}>Saving Project...</Text>
			</View>
		);
	}

	return (
		<View style={[
			styles.modalContainer, 
			{ display: modalVisible || roleModalVisible ? "flex" : "none" }
		]}>
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
							data={members}
							placeholder="Select Members"
							selectedItems={selectedMembers}
							setSelectedItems={setSelectedMembers}
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

						<DropdownCustom
							data={selectedMembers.map((member) => {
								let deserializedMember = JSON.parse(member);
								return {
									label: deserializedMember.userName,
									value: deserializedMember,
								};
							})}
							placeholder="Select Founder"
							selectedItem={founder}
							setSelectedItem={setFounder}
						/>

						<View>
							{selectedMembers.map((member) => {
								let deserializedMember = JSON.parse(member);
								return (
									<View key={deserializedMember.refToUser}>
										<Text>{deserializedMember.userName}</Text>
										<TextInput
											placeholder="Role"
											style={styles.input}
											value={selectedRoles[deserializedMember.refToUser]}
											onChangeText={(text) => {	
												setSelectedRoles((prevRoles) => ({
													...prevRoles,
													[deserializedMember.refToUser]: text,
												}));
											}}
										/>
									</View>
								)
							})}
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
		</View>
	);
};

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
});

export default AddProjectModal;
