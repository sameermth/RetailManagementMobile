import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LoginScreen } from "../screens/LoginScreen";
import { MainShellScreen } from "../screens/MainShellScreen";
import { OrganizationChooserScreen } from "../screens/OrganizationChooserScreen";
import { useAppData } from "../store/AppDataContext";
import { RootStackParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { organizationSelectionRequired, session } = useAppData();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session?.token ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : organizationSelectionRequired ? (
        <Stack.Screen name="OrganizationChooser" component={OrganizationChooserScreen} />
      ) : (
        <Stack.Screen name="Home" component={MainShellScreen} />
      )}
    </Stack.Navigator>
  );
}
