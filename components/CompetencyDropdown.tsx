import { db } from '@/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CompetencyDropdownProps {
    query: string;
    onSelect: (tag: string) => void;
    existingTags: string[];
    style?: object;
}

function CompetencyDropdown({ query, onSelect, existingTags }: CompetencyDropdownProps) {
    const [competencies, setCompetencies] = React.useState<string[]>([]);
    
    useEffect(() => {
        const fetchCompetencies = async () => {
            const snapshot = await getDocs(collection(db, "competencies"));
            const skills = snapshot.docs.map((doc) => doc.data().name as string);
            setCompetencies(skills);
        };
        fetchCompetencies();
    }, []);
    
    const filtered = competencies.filter(
        c =>
            c.toLowerCase().includes(query.toLowerCase()) &&
            !existingTags.includes(c)
    );

    if (filtered.length === 0) return null;

    return (
        <View style={styles.dropdown}>
            {filtered.map(comp => (
                <TouchableOpacity
                    key={comp}
                    onPress={() => onSelect(comp)}
                    style={styles.item}
                >
                    <Text>{comp}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 4,
        elevation: 2,
        marginBottom: 8,
        padding: 8,
    },
    item: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
});

export default CompetencyDropdown;