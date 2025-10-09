import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Chip } from 'react-native-paper';
import CompetencyDropdown from './CompetencyDropdown';

interface TagInputProps {
    tags: string[];
    setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

function TagInput({ tags, setTags }: TagInputProps) {
    const [text, setText] = useState('');

    const handleAddTag = () => {
        const trimmedText = text.trim();
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
                onSubmitEditing={handleAddTag}
                mode="outlined"
                style={styles.input}
            />

            {text.trim().length > 0 && (
                <CompetencyDropdown
                    query={text}
                    onSelect={tag => {
                        setTags([...tags, tag]);
                        setText('');
                    }}
                    existingTags={tags}
                />
            )}

            <View style={styles.tagContainer}>
            {tags.map((tag, index) => (
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
        gap: 8,
    },
    chip: {},
});

export default TagInput;