import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

interface DropdownCustomComponentProps {
	data: { label: string; value: any }[];
	placeholder: string;
	selectedItem: string;
	setSelectedItem: any;
}

function DropdownCustom({ data, placeholder, selectedItem, setSelectedItem }: DropdownCustomComponentProps) {
	const renderItem = (item: any) => {
		return (
			<View style={styles.item}>
				<Text style={styles.selectedTextStyle}>{item.label}</Text>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<Dropdown
				style={styles.dropdown}
				selectedTextStyle={styles.selectedTextStyle}
				inputSearchStyle={styles.inputSearchStyle}
				iconStyle={styles.iconStyle}
				backgroundColor={'rgba(0,0,0,0.2)'}
				data={data.map((item) => {
					return {
						label: item.label,
						value: JSON.stringify(item.value),
					};
				})}
				labelField="label"
				valueField="value"
				placeholder={placeholder}
				value={selectedItem}
				search
				searchPlaceholder="Search..."
				onChange={(item) => { setSelectedItem(item.value) }}
				renderItem={renderItem}
			/>
		</View>
	);
};

export default DropdownCustom;

const styles = StyleSheet.create({
	container: { marginBottom: 20 },
	dropdown: {
		width: "100%",
		height: 40,
		backgroundColor: 'white',
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 5,
		paddingHorizontal: 10,
	},
	icon: {
		marginRight: 5,
	},
	selectedTextStyle: {
		fontSize: 14,
	},
	iconStyle: {
		width: 20,
		height: 20,
	},
	inputSearchStyle: {
		height: 40,
		fontSize: 16,
	},
	item: {
		padding: 17,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	selectedStyle: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 14,
		backgroundColor: 'white',
		shadowColor: '#000',
		marginTop: 8,
		marginLeft: 5,
		marginRight: 5,
		paddingHorizontal: 12,
		paddingVertical: 8,
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.2,
		shadowRadius: 1.41,
		elevation: 2,
	},
	textSelectedStyle: {
		marginRight: 5,
	},
});