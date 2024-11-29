import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Index from './index';
import Profile from './profile';
import Events from './events';
import Register from "./register";
import React, {useState} from "react";
import {onAuthStateChanged} from "@firebase/auth";
import {auth} from "@/firebaseConfig";

const Tab = createBottomTabNavigator();

export default function RootLayout() {
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    onAuthStateChanged(auth, (user) => {
        setTimeout(() => {setIsAuthenticated(auth.currentUser != null)}, 0)
    });

    if(!isAuthenticated)
        return <NotAuthenticatedTabBar></NotAuthenticatedTabBar>
    return <AuthenticatedTabBar></AuthenticatedTabBar>

}

const NotAuthenticatedTabBar= () => {
        return(
            <Tab.Navigator initialRouteName="index">
                <Tab.Screen
                    name="login"
                    component={Index}
                     options={{
                         tabBarLabel: "Login",
                        headerShown: false
                    }}
                />
                <Tab.Screen
                    name="register"
                    component={Register}
                    options={{
                     headerShown: false,
                     tabBarLabel: "Register",
                    }}
                />
            </Tab.Navigator>)
}

const AuthenticatedTabBar = () =>{
    return(
        <Tab.Navigator initialRouteName="index">
            <Tab.Screen
                name="profile"
                component={Profile}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Profile',
                }}
            />
            <Tab.Screen
                name="events"
                component={Events}
                options={{
                    headerShown: false,
                    tabBarLabel: 'Events',
                }}
            />
        </Tab.Navigator>)
}