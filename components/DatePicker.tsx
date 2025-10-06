import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { DatePickerModal, enGB, registerTranslation } from 'react-native-paper-dates';
import { SafeAreaProvider } from "react-native-safe-area-context";

registerTranslation("en", enGB);

function DatePicker ({ date, setDate, textValue }: { date: any, setDate: (date: any) => void, textValue: string}) {
  const [open, setOpen] = React.useState(false);

  const onDismissSingle = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = React.useCallback(
    (params: any) => {
      setOpen(false);
      setDate(params.date);
    },
    [setOpen, setDate]
  );

  return (
    <SafeAreaProvider>
        <TouchableOpacity onPress={() => setOpen(true)} style={styles.container}>
            <Text style={{color: "#49454e", fontSize: 16}}>
                {textValue}: {date && date.toDateString()}
            </Text>
            <AntDesign name="calendar" size={24} color="#6200EE" />
        </TouchableOpacity>
        <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
            <DatePickerModal
                locale="en"
                mode="single"
                visible={open}
                onDismiss={onDismissSingle}
                date={date}
                onConfirm={onConfirmSingle}
                saveLabel="Save"
                label="Select date"
                presentationStyle="overFullScreen"
            />
        </View>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#79747e",
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white'
    },
});


export default DatePicker;
