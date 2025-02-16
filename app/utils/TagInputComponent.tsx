import AntDesign from '@expo/vector-icons/AntDesign';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, 
    StyleSheet } from 'react-native';

const TagInputComponent = () => {
    const [tags, setTags] = useState<string[]>([]);
    const [text, setText] = useState('');

    const addTag = () => {
        if (text.trim() !== '') {
            setTags([...tags, text.trim()]);
            setText('');
        }
    };

    const removeTag = (index: any) => {
        const newTags = [...tags];
        newTags.splice(index, 1);
        setTags(newTags);
    };

    return (
        <>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a tag"
                    value={text}
                    onChangeText={setText}
                    onSubmitEditing={addTag}
                />
                <TouchableOpacity onPress={addTag} 
                    style={styles.addButton}
                >
                    <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.tagContainer}>
                {tags.map((tag, index) => (
                    <View key={index} style={styles.tagWrapper}>
                        <TouchableOpacity onPress={() => removeTag(index)} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                            <AntDesign name="close" size={16} color="black" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 5,
        padding: 5,
    },
    tagWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        marginRight: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 1,
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: '#CCCCCC',
        borderWidth: 1,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginRight: 10,
        backgroundColor: '#FFFFFF',
    },
    addButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#6200EE',
    },
    buttonText: {
        color: '#6200EE',
        fontSize: 16,
        fontWeight: 'bold',
    },
    tag: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        backgroundColor: 'white',
        shadowColor: '#000',
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
    tagText: {
        marginRight: 5,
    },
});

export default TagInputComponent;
