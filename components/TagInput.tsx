import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Chip } from 'react-native-paper';

interface TagInputProps {
    tags: string[];
    setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

function TagInput({ tags, setTags }: TagInputProps) {
    const [text, setText] = useState('');

    const handleAddTag = () => {
        const trimmedText = text.trim();
        // Add tag only if it's not empty and not already in the list
        if (trimmedText && !tags.includes(trimmedText)) {
            setTags([...tags, trimmedText]);
            setText('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <View style={styles.container}>
            <TextInput
                label="Keywords / Tags"
                placeholder="Type a tag and press enter"
                value={text}
                onChangeText={setText}
                onSubmitEditing={handleAddTag} // This allows adding the tag by pressing the 'enter' or 'return' key
                mode="outlined"
                style={styles.input}
                right={
                    <TextInput.Icon
                        icon="plus-circle"
                        onPress={handleAddTag}
                        disabled={!text.trim()}
                    />
                }
            />
            <View style={styles.tagContainer}>
                {tags.map((tag, index) => (
                    // This key is more robust and guarantees uniqueness among siblings.
                    <Chip
                        key={`${tag}-${index}`}
                        onClose={() => handleRemoveTag(tag)}
                        style={styles.chip}
                    >
                        {tag}
                    </Chip>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    input: {
        marginBottom: 8,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8, // Adds space between chips
    },
    chip: {
        // You can add specific styling for your chips here if needed
    },
});

export default TagInput;