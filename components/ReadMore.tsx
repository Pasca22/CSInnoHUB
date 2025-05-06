import React, { useState, useEffect } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';

type ReadMoreTextProps = {
    text: string;
    style?: object;
    lineEstimate?: number;
};

const ReadMoreText: React.FC<ReadMoreTextProps> = ({
                                                       text,
                                                       style,
                                                       lineEstimate = 2,
                                                   }) => {
    const { width } = useWindowDimensions();
    const [expanded, setExpanded] = useState(false);
    const [maxChars, setMaxChars] = useState(300); // default fallback

    useEffect(() => {
        const avgCharWidth = 6;
        const estimatedCharsPerLine = Math.floor(width / avgCharWidth);
        setMaxChars(estimatedCharsPerLine * lineEstimate);
    }, [width, lineEstimate]);

    const isLong = text.length > maxChars;
    const displayText = expanded || !isLong ? text : text.slice(0, maxChars) + '...';

    return (
        <View style={{ marginBottom: 8 }}>
            <Text style={[styles.cardText, style]}>{displayText}</Text>
            {isLong && (
                <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                    <Text style={styles.readMoreText}>
                        {expanded ? 'Read Less' : 'Read More'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    cardText: {
        fontSize: 16,
        color: '#333',
    },
    readMoreText: {
        color: '#1e90ff',
        marginTop: 4,
        fontWeight: '500',
    },
});

export default ReadMoreText;
