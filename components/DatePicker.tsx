import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AntDesign } from '@expo/vector-icons';

function DatePicker ({ date, setDate }: { date: any, setDate: (date: any) => void }) {
    const [show, setShow] = useState(false);

    const onDateChange = (_: any, selectedDate: any) => {
        const currentDate = selectedDate;
        setShow(false);
        setDate(currentDate);
    };

    return (
        <>
            <TouchableOpacity onPress={() => setShow(true)} style={styles.container}>
                <Text style={{ color: '#666' }}>
                    Starting date: {date.toDateString()}
                </Text>
                <AntDesign name="calendar" size={24} color="#6200EE" />
            </TouchableOpacity>

            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode={'date'}
                    is24Hour={true}
                    onChange={onDateChange}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

export default DatePicker;
