import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';

import { store, persistor } from './src/store';
import AppNavigator from './src/navigation';
import { colors } from '@theme/color';

export default function App() {
    return (
        <Provider store={store}>
            <PersistGate
                loading={
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={colors.primary[500]} />
                    </View>
                }
                persistor={persistor}
            >
                <SafeAreaProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <NavigationContainer>
                            <AppNavigator />
                        </NavigationContainer>
                    </GestureHandlerRootView>
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
}