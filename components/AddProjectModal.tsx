import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import DatePicker from "@/components/DatePicker";
import TagInput from "@/components/TagInput";
import MultiSelectCustom from "@/components/MultiSelectCustom";
import { auth, db } from "@/firebaseConfig";
import { collection, getDocs, addDoc, doc, Timestamp, getDoc, DocumentReference } from "firebase/firestore";
import { MembersDropdownDataType, Project } from "@/app/types";
import { Button, Card, Modal, Portal, Text, TextInput, useTheme } from "react-native-paper";

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
	const [tags, setTags] = useState<string[]>([]);
	const [members, setMembers] = useState<MembersDropdownDataType[]>([]);
	const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
	const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>({});
	const [founder, setFounder] = useState<DocumentReference>();
	const [founderName, setFounderName] = useState("");
	const [loading, setLoading] = useState(false);
	const [operationMessage, setOperationMessage] = useState("");
	const theme = useTheme();

	const unsetAllFields = () => {
		setProjectName("");
		setDescription("");
		setDate(new Date());
		setTags([]);
		setSelectedMembers([]);
		setSelectedRoles({});
		setOperationMessage("");
	};

	const fetchUsersForMembersDropdown = async (): Promise<MembersDropdownDataType[]> => {
		const usersSnapshot = await getDocs(collection(db, "users"));
		return usersSnapshot.docs.map((doc) => ({
			label: doc.data().name,
			value: JSON.stringify({
				refToUser: doc.id,
				userName: doc.data().name,
			}),
		}));
	};

	useEffect(() => {
		const fetchFounder = async () => {
			if (!auth.currentUser) return;
			const userRef = doc(db, "users", auth.currentUser.uid);
			setFounder(userRef);
			const userData = await getDoc(userRef);
			if (userData.exists()) {
				setFounderName(userData.data().name);
			}
		};
		const fetchMembers = async () => {
			const membersList = await fetchUsersForMembersDropdown();
			setMembers(membersList);
		};
		fetchFounder();
		fetchMembers();
	}, []);

	const handleSaveProject = async () => {
		setOperationMessage("");
		const membersList = selectedMembers.map((memberValue) => {
			const deserializedMember = JSON.parse(memberValue);
			return {
				ref: doc(db, `users/${deserializedMember.refToUser}`),
				role: selectedRoles[deserializedMember.refToUser] || "",
			};
		});

		if (!membersList.every((member) => member.role)) {
			setOperationMessage("Please assign roles to all members.");
			return;
		}

		membersList.push({ ref: founder as DocumentReference, role: "Founder" });

		const project: Project = {
			name: projectName,
			startingDate: Timestamp.fromDate(date),
			description: description,
			keywords: tags.join(","),
			members: membersList,
			founder: founder as DocumentReference,
		};

		setLoading(true);
		try {
			const docRef = await addDoc(collection(db, "projects"), project);
			setProjects([...projects, { ...project, projectRef: docRef }]);
			handleCancel();
		} catch (error) {
			setOperationMessage("Failed to save project. Please try again.");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleNext = () => {
		setOperationMessage("");
		if (!projectName.trim()) {
			setOperationMessage("Project name is required.");
			return;
		}
		if (projects.some((p) => p.name.toLowerCase() === projectName.trim().toLowerCase())) {
			setOperationMessage("A project with this name already exists.");
			return;
		}
		if (selectedMembers.length < 1) {
			setOperationMessage("Please select at least one member.");
			return;
		}

		setModalVisible(false);
		setRoleModalVisible(true);
	};

	const handleCancel = () => {
		setModalVisible(false);
		setRoleModalVisible(false);
		unsetAllFields();
	};

	return (
		<Portal>
			<Modal visible={modalVisible} onDismiss={handleCancel}>
				<Card style={styles.modalCard}>
					<ScrollView>
						<Card.Title title="Add New Project" />
						<Card.Content>
							<TextInput label="Project Name" value={projectName} onChangeText={setProjectName} mode="outlined" style={styles.input} />
							<TextInput label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={4} mode="outlined" style={styles.input} />
							<DatePicker date={date} setDate={setDate} />
							<TagInput tags={tags} setTags={setTags} />
							<MultiSelectCustom data={members} placeholder="Select Members" selectedItems={selectedMembers} setSelectedItems={setSelectedMembers} />
							{!!operationMessage && <Text style={styles.errorMessage}>{operationMessage}</Text>}
						</Card.Content>
						<Card.Actions>
							<Button onPress={handleCancel} textColor={theme.colors.error}>Cancel</Button>
							<Button onPress={handleNext} mode="contained">Next</Button>
						</Card.Actions>
					</ScrollView>
				</Card>
			</Modal>

			<Modal visible={roleModalVisible} onDismiss={handleCancel}>
				<Card style={styles.modalCard}>
					<ScrollView>
						<Card.Title title="Assign Member Roles" />
						<Card.Content>
							<View style={styles.founderRow}>
								<Text variant="titleMedium">{founderName}</Text>
								<Text variant="bodyMedium" style={{ color: theme.colors.primary }}>Founder</Text>
							</View>
							{selectedMembers.map((memberValue) => {
								const deserializedMember = JSON.parse(memberValue);
								return (
									<View key={deserializedMember.refToUser} style={styles.roleInputRow}>
										<Text variant="titleMedium" style={{flex: 1}}>{deserializedMember.userName}</Text>
										<TextInput
											label="Role"
											style={{flex: 1}}
											dense
											value={selectedRoles[deserializedMember.refToUser] || ""}
											onChangeText={(text) => setSelectedRoles(prev => ({ ...prev, [deserializedMember.refToUser]: text }))}
										/>
									</View>
								);
							})}
							{!!operationMessage && <Text style={styles.errorMessage}>{operationMessage}</Text>}
						</Card.Content>
						<Card.Actions>
							<Button onPress={handleCancel} disabled={loading} textColor={theme.colors.error}>Cancel</Button>
							<Button onPress={handleSaveProject} mode="contained" loading={loading} disabled={loading}>Save Project</Button>
						</Card.Actions>
					</ScrollView>
				</Card>
			</Modal>
		</Portal>
	);
};

const styles = StyleSheet.create({
	modalCard: {
		margin: 20,
		maxHeight: '90%',
	},
	input: {
		marginBottom: 16,
	},
	errorMessage: {
		color: "#B00020",
		textAlign: 'center',
		marginTop: 10,
	},
	founderRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 12,
		backgroundColor: '#f0eaff',
		borderRadius: 8,
		marginBottom: 16,
	},
	roleInputRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
		gap: 10,
	},
});

export default AddProjectModal;