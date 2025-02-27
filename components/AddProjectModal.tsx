import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import DatePicker from "@/components/DatePicker";
import TagInput from "@/components/TagInput";
import MultiSelectCustom from "@/components/MultiSelectCustom";
import { db } from "@/firebaseConfig";
import { collection, getDocs, addDoc, doc } from "firebase/firestore";
import DropdownCustom from "@/components/DropdownCustom";

interface AddProjectModalProps {
	modalVisible: boolean;
    setModalVisible: (value: boolean) => void;
}

function AddProjectModal({ modalVisible, setModalVisible }: AddProjectModalProps) {
	const [roleModalVisible, setRoleModalVisible] = useState(false);
	const [projectName, setProjectName] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState(new Date());
	const [tags, setTags] = useState<any[]>([]);
	const [members, setMembers] = useState<MembersDropdownDataType[]>([]);
	const [selectedMembers, setSelectedMembers] = useState([]);
	const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>({});
	const [founder, setFounder] = useState("");

	const unsetAllFields = () => {
		setProjectName("");
		setDescription("");
		setDate(new Date());
		setTags([]);
		setSelectedMembers([]);
		setSelectedRoles({});
		setFounder("");
	};

	type MembersDropdownDataType = {
		label: string,
		value: {
			refToUser : string;
			userName : string;
			role : string;
		}
	}

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
		let membersList = selectedMembers.map((member) => {
			let deserializedMember = JSON.parse(member);
			return {
				ref: doc(db, `users/${deserializedMember.refToUser}`),
				role: selectedRoles[deserializedMember.refToUser],
			};
		});

		let deserializedRefToFounder = doc(db, `users/${JSON.parse(founder).refToUser}`);

		let project = {
			name: projectName,
			startingDate: date,
			description: description,
			keywords: tags.join(","),
			members: membersList,
			founder: deserializedRefToFounder,
		};

		// TODO validation
			// founder: mandatory
			// all roles: mandatory

		await addDoc(collection(db, "projects"), project);

		// TODO animation while saving and waiting for the modal to close

		setModalVisible(false);
		setRoleModalVisible(false);

		unsetAllFields();
	};

	const handleNext = () => {
		// TODO validation
			// name: mandatory
			// startingDate: in the future
			// members: at least 1

		setModalVisible(false);
		setRoleModalVisible(true);
	};

	const handleCancel = () => {
		setModalVisible(false);
		setRoleModalVisible(false);

		unsetAllFields();
	};

	useEffect(() => {
		const fetchData = async () => {
			const membersList = await fetchUsersForMembersDropdown();
			setMembers(membersList);
		};
		fetchData();
	}, []);

	return (
        <>
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
        </>
	);
};

const styles = StyleSheet.create({
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

export default AddProjectModal;
