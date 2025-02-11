import React, {useState} from "react";
import {Button, StyleSheet, Text, TextInput} from "react-native";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {auth, db} from "../firebaseConfig"
import {doc, setDoc} from "@firebase/firestore";
import {Picker} from "@react-native-picker/picker";
import DatePicker from "react-native-date-picker";


const Register = () => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [specializare, setSpecializare] = useState("");
    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [interests, setInterests] = useState("");

    const handleSignUp = () => {
        try {
            if (validateName(name) == false)
                throw new Error("auth/invalid-name")
            if (specializare == "")
                throw new Error("auth/invalid-major")

            const interestsArray = interests.split(/,\s*/);

            createUserWithEmailAndPassword(auth, email, password)
                .then(() => {
                    setDoc(doc(db, "users", "" + auth.currentUser?.uid.toString()), {
                        auth_ref: auth.currentUser?.uid,
                        nume: name.toString(),
                        specializare: specializare,
                        an_admitere: date,
                        poza_url: null,
                        interese: interestsArray,
                    });
                })
                .catch((error) => {
                    const errorCode = error.code

                    if(errorCode == "auth/invalid-email")
                        setMessage("Va rugam introduceti un email valid!");
                    else if(errorCode == "auth/missing-password")
                        setMessage("Va rugam introduceti o parola!");
                    else if(confirmPassword != password)
                        setMessage("Parolele nu se potrivesc!");
                    else if(errorCode == "auth/weak-password")
                        setMessage("Parola trebuie sa aiba minim 8 caractere!");
                })
        }
        catch (error) {
            // @ts-ignore
            const errorCode = error.message;

            // console.log(errorCode)

            if (errorCode === "auth/invalid-name")
                setMessage("Va rugam sa introduceti un nume valid!");
            else if(errorCode == "auth/invalid-major")
                setMessage("Va rugam sa selectati o specializare!");
        }
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Text>Nume</Text>
                <TextInput style={styles.input} onChangeText={setName} value={name} />
                <Text>Email</Text>
                <TextInput style={styles.input} onChangeText={setEmail} value={email} />
                <Text>Parola</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={true}
                />
                <Text>Confirmare parola</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry={true}
                ></TextInput>
                <Text>Specializare</Text>
                <Picker
                    style={{ height: 50, width: 250, marginBottom: 20, marginTop: 10 }}
                    onValueChange={(itemValue, itemIndex) => { // @ts-ignore
                        setSpecializare(itemValue)}}>
                    <Picker.Item label="Selecteaza o specializare" value="" />
                    <Picker.Item label="Informatica" value="Informatica" />
                    <Picker.Item label="Matematica informatica" value="Matematica informatica" />
                    <Picker.Item label="Inteligenta artificiala" value="Inteligenta artificiala" />
                    <Picker.Item label="Ingineria informatiei" value="Ingineria informatiei" />
                </Picker>
                <Button title="Selecteaza anul admiterii" onPress={() => setOpen(true)} />
                <DatePicker
                    modal
                    open={open}
                    date={date}
                    onConfirm={(selectedDate) => {
                        setOpen(false);
                        setDate(selectedDate);
                    }}
                    onCancel={() => setOpen(false)}
                    mode="date" // or "time", "datetime"
                />
                <Text>Interese (separate prin virgula)</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setInterests}
                    value={interests}
                ></TextInput>
                <Button
                    title="Register"
                    color="#f1243f"
                    onPress={handleSignUp}
                />
                <Text style={styles.statusMessage}>{message}</Text>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

function validateName(name: string): boolean {
    name = name.trim()

    if(name == "")
        return false

    return /^[A-Za-z\s]+$/.test(name);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    input: {
        height: 40,
        width: 300,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
    statusMessage: {
        marginTop: 10,
        color: "#f60000",
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
});



export default Register;