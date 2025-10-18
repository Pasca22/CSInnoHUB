    import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
    import Login from './login';
    import Profile from './profile';
    import Events from './events';
    import Register from "./register";
    import Mentors from "./mentors";
    import Projects from "./projects";
    import React from "react";
    import { onAuthStateChanged } from "@firebase/auth";
    import { auth } from "@/firebaseConfig";
    import Icon from 'react-native-vector-icons/FontAwesome5';
    import { GestureHandlerRootView } from 'react-native-gesture-handler';
    import { PaperProvider, MD3LightTheme } from 'react-native-paper';

    const theme = {
        ...MD3LightTheme,
        colors: {
            ...MD3LightTheme.colors,
            primary: '#6200EE',
            secondary: '#6a11cb',
        },
    };
    // Import PaperProvider
    const Tab = createBottomTabNavigator();


    export default function RootLayout() {
        const [isAuthenticated, setIsAuthenticated] = React.useState(false);

        // Best practice: use useEffect for subscriptions
        React.useEffect(() => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                setIsAuthenticated(!!user); // Sets to true if user exists, false otherwise
            });
            PaperProvider
            // Cleanup subscription on unmount
            return () => unsubscribe();
        }, []);

        return (
            // Wrap the entire app with PaperProvider
            <GestureHandlerRootView style={{ flex: 1 }}>
                <PaperProvider theme={theme}>
                    {!isAuthenticated ? <NotAuthenticatedTabBar /> : <AuthenticatedTabBar />}
                </PaperProvider>
            </GestureHandlerRootView>
        );
    }

    const NotAuthenticatedTabBar = () => {
        return (
            <Tab.Navigator initialRouteName="login">
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
            <Tab.Navigator initialRouteName="profile">
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