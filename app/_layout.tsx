import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import Index from './index';
import Login from './login'; // <-- ADD this import

import Profile from './profile';
import Events from './events';
import Register from "./register";
import Mentors from "./mentors";
import Projects from "./projects";
import React, { useState } from "react";
import { onAuthStateChanged } from "@firebase/auth";
import { auth } from "@/firebaseConfig";
import Icon from 'react-native-vector-icons/FontAwesome5';

const Tab = createBottomTabNavigator();

export default function RootLayout() {
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    onAuthStateChanged(auth, (user) => {
        setTimeout(() => { setIsAuthenticated(auth.currentUser != null) }, 0);
    });

    if (!isAuthenticated)
        return <NotAuthenticatedTabBar />;
    return <AuthenticatedTabBar />;
}

const NotAuthenticatedTabBar = () => {
    return (
        <Tab.Navigator initialRouteName="index">
            <Tab.Screen
                name="login"
                component={Login}
                options={{
                    tabBarLabel: "Login",
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="sign-in-alt" color={color} size={size} />
                    ),
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="register"
                component={Register}
                options={{
                    headerShown: false,
                    tabBarLabel: "Register",
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="user-plus" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const AuthenticatedTabBar = () => {
    return (
        <Tab.Navigator initialRouteName="index">
            <Tab.Screen
                name="profile"
                component={Profile}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="user" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="events"
                component={Events}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Events',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="calendar-alt" color={color} size={size} />
                    ),
                }}
            />
             <Tab.Screen
                name="projects"
                component={Projects}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Projects',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="tasks" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="mentors"
                component={Mentors}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Mentors',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="user-tie" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};
