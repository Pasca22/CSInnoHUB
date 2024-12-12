import React from "react";
import { View, StyleSheet, Linking } from "react-native";
import { Card, Button, Text } from "@rneui/themed";
import { Avatar } from "react-native-elements";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";


// Each mentor has:
    // name
    // picture (url)
    // interests (string separated by comma)
    // associated company
    // association date
    // email



const Mentors = () => {
    return (
        <GestureHandlerRootView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.cardWrapper}>
                    <Card containerStyle={styles.card}>
                        <Card.Title style={styles.cardTitle}>John Doe</Card.Title>
                        <Card.Divider />
                        <Avatar
                            size="xlarge"
                            rounded
                            icon={{ name: "user", type: "font-awesome" }}
                            containerStyle={styles.avatar}
                        />
                        <Text style={styles.infoLabel}>Interests</Text>
                        <Text>Web development, mobile development</Text>
                        <Text style={styles.infoLabel}>Company</Text>
                        <Text>Google</Text>
                        <Text style={styles.infoLabel}>Association date</Text>
                        <Text>01.01.2021</Text>
                        <Button
                            title="Contact"
                            buttonStyle={styles.button}
                            onPress={() => Linking.openURL(`mailto: john@doe.com`)}
                        />
                    </Card>
                </View>
                <View style={styles.cardWrapper}>
                    <Card containerStyle={styles.card}>
                        <Card.Title style={styles.cardTitle}>John Doe</Card.Title>
                        <Card.Divider />
                        <Avatar
                            size="xlarge"
                            rounded
                            icon={{ name: "user", type: "font-awesome" }}
                            containerStyle={styles.avatar}
                        />
                        <Text style={styles.infoLabel}>Interests</Text>
                        <Text>Web development, mobile development</Text>
                        <Text style={styles.infoLabel}>Company</Text>
                        <Text>Google</Text>
                        <Text style={styles.infoLabel}>Association date</Text>
                        <Text>01.01.2021</Text>
                        <Button
                            title="Contact"
                            buttonStyle={styles.button}
                            onPress={() => Linking.openURL(`mailto: john@doe.com`)}
                        />
                    </Card>
                </View>
                <View style={styles.cardWrapper}>
                    <Card containerStyle={styles.card}>
                        <Card.Title style={styles.cardTitle}>John Doe</Card.Title>
                        <Card.Divider />
                        <Avatar
                            size="xlarge"
                            rounded
                            icon={{ name: "user", type: "font-awesome" }}
                            containerStyle={styles.avatar}
                        />
                        <Text style={styles.infoLabel}>Interests</Text>
                        <Text>Web development, mobile development</Text>
                        <Text style={styles.infoLabel}>Company</Text>
                        <Text>Google</Text>
                        <Text style={styles.infoLabel}>Association date</Text>
                        <Text>01.01.2021</Text>
                        <Button
                            title="Contact"
                            buttonStyle={styles.button}
                            onPress={() => Linking.openURL(`mailto: john@doe.com`)}
                        />
                    </Card>
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
    },
    card: {
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 10,
    },
    infoLabel: {
      fontSize: 16,
      marginTop: 12,
      fontWeight: "bold",
    },
    button: {
      backgroundColor: "#6200EE",
      borderRadius: 10,
      marginTop: 15,
      paddingVertical: 10,
    },
    cardWrapper: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    avatar: {
        alignSelf: "center",
        backgroundColor: "#6200EE",
        marginBottom: 10,
    },
    scrollView: {
        paddingTop: 30,
        paddingBottom: 30,
    },
  });

export default Mentors;