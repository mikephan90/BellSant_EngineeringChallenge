import FontAwesome from '@expo/vector-icons/FontAwesome';
import {Tabs} from 'expo-router';
import {useColorScheme} from 'react-native';
import Colors from '../../constants/Colors';
import React from "react";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{marginBottom: -3}} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Machine State',
          tabBarIcon: ({color}) => <TabBarIcon name='list-ul' color={color} />,
        }}
      />
      <Tabs.Screen
        name='two'
        options={{
          title: 'Log Part',
          tabBarIcon: ({color}) => <TabBarIcon name='edit' color={color} />,
        }}
      />
    </Tabs>
  );
}
