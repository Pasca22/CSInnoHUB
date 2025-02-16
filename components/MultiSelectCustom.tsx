import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';

interface MultiSelectComponentProps {
	data: { label: string; value: string }[];
	placeholder: string;
	selectedItems: string[];
	setSelectedItems: any;
}

function MultiSelectCustom({ data, placeholder, selectedItems, setSelectedItems }: MultiSelectComponentProps) {
	const renderItem = (item: any) => {
		return (
			<View style={styles.item}>
				<Text style={styles.selectedTextStyle}>{item.label}</Text>
			</View>
		);
	};

	const renderSelectedItem = (item: any, unSelect: any) => {
		return (
			<TouchableOpacity onPress={() => unSelect && unSelect(item)}>
				<View style={styles.selectedStyle}>
					<Text style={styles.textSelectedStyle}>{item.label}</Text>
					<AntDesign name="close" size={16} color="black" />
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.container}>
			<MultiSelect
				style={styles.dropdown}
				selectedTextStyle={styles.selectedTextStyle}
				inputSearchStyle={styles.inputSearchStyle}
				iconStyle={styles.iconStyle}
				backgroundColor={'rgba(0,0,0,0.2)'}
				data={data}
				labelField="label"
				valueField="value"
				placeholder={placeholder}
				value={selectedItems}
				search
				searchPlaceholder="Search..."
				onChange={(item) => { setSelectedItems(item); }}
				renderItem={renderItem}
				renderSelectedItem={renderSelectedItem}
			/>
		</View>
	);
};

export default MultiSelectCustom;

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