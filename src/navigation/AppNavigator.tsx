import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LoginScreen } from "../screens/LoginScreen";
import { MainShellScreen } from "../screens/MainShellScreen";
import { useAppData } from "../store/AppDataContext";
import { RootStackParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { session } = useAppData();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session?.token ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Home" component={MainShellScreen} />
      )}
    </Stack.Navigator>
  );
}
