import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import DatePicker from "@/components/DatePicker";
import TagInput from "@/components/TagInput";
import MultiSelectCustom from "@/components/MultiSelectCustom";
import { auth, db } from "@/firebaseConfig";
import { collection, getDocs, addDoc, doc, Timestamp, getDoc, DocumentReference } from "firebase/firestore";
import { Project } from "@/app/types";
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
	const [members, setMembers] = useState<{ label: string; value: string; }[]>([]);
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

	const fetchUsersForMembersDropdown = async (): Promise<{ label: string; value: string; }[]> => {
		const usersSnapshot = await getDocs(collection(db, "users"));
		return usersSnapshot.docs
			.filter(doc => doc.id !== auth.currentUser?.uid)
			.map((doc) => ({
				label: doc.data().name,
				value: JSON.stringify({
					refToUser: doc.id,
					userName: doc.data().name,
				}),
			}));
	};

	useEffect(() => {
		if (modalVisible) {
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
		}
	}, [modalVisible]);

	const handleSaveProject = async () => {
		setOperationMessage("");
		const membersList = selectedMembers.map((memberValue) => {
			const deserializedMember = JSON.parse(memberValue);
			return {
				ref: doc(db, `users/${deserializedMember.refToUser}`),
				role: selectedRoles[deserializedMember.refToUser] || "",
			};
		});

		if (!membersList.every((member) => member.role && member.role.trim() !== '')) {
			setOperationMessage("Please assign roles to all members.");
			return;
		}

		membersList.push({ ref: founder as DocumentReference, role: "Founder" });

		const projectData: Omit<Project, 'projectRef'> = {
			name: projectName,
			startingDate: Timestamp.fromDate(date),
			description: description,
			keywords: tags.join(","),
			members: membersList,
			founder: founder as DocumentReference,
		};

		setLoading(true);
		try {
			const docRef = await addDoc(collection(db, "projects"), projectData);
			setProjects(prevProjects => [...prevProjects, { ...projectData, projectRef: docRef }]);
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
		if (!projectName.trim()) return setOperationMessage("Project name is required.");
		if (projects.some((p) => p.name.toLowerCase() === projectName.trim().toLowerCase())) return setOperationMessage("A project with this name already exists.");
		if (selectedMembers.length < 1) return setOperationMessage("Please select at least one member.");

		setModalVisible(false);
		setRoleModalVisible(true);
	};

	const handleCancel = () => {
		setModalVisible(false);
		setRoleModalVisible(false);
		unsetAllFields();
	};

	const handleRoleChange = (userId: string, role: string) => {
		setSelectedRoles(prev => ({ ...prev, [userId]: role }));
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
								const userId = deserializedMember.refToUser;
								return (
									<View key={userId} style={styles.roleInputRow}>
										<Text variant="titleMedium" style={styles.memberNameText}>{deserializedMember.userName}</Text>
										<TextInput
											label="Role"
											style={styles.roleInput}
											value={selectedRoles[userId] || ""}
											onChangeText={(text) => handleRoleChange(userId, text)}
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
		marginBottom: 16,
		gap: 10,
	},
	memberNameText: {
		flex: 0.6, // Give 60% of the space to the name
	},
	roleInput: {
		flex: 0.4, // Give 40% of the space to the input
	},
});

export default AddProjectModal;