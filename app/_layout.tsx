import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Index from './index';
import Profile from './profile';
import Events from './events';
// import Settings from './Settings';

const Tab = createBottomTabNavigator();

export default function RootLayout() {
  return (
    <Tab.Navigator initialRouteName="index">
      <Tab.Screen
        name="index"
        component={Index}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="profile"
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
      <Tab.Screen
        name="events"
        component={Events}
        options={{
          tabBarLabel: 'Events',
        }}
      />
      {/* <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarLabel: 'Settings',
        }}
      /> */}
    </Tab.Navigator>
  );
}
