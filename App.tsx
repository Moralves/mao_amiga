import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackParamList } from './src/types/navigation';
import { ListScreen } from './src/screens/ListScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { DonationScreen } from './src/screens/DonationScreen';
import { PointItemsScreen } from './src/screens/PointItemsScreen';
import { MyDonationsScreen } from './src/screens/MyDonationsScreen';
import { DonationDetailScreen } from './src/screens/DonationDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="List"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="List" component={ListScreen} />
          <Stack.Screen name="Detail" component={DetailScreen} />
          <Stack.Screen name="Donation" component={DonationScreen} />
          <Stack.Screen name="PointItems" component={PointItemsScreen} />
          <Stack.Screen name="MyDonations" component={MyDonationsScreen} />
          <Stack.Screen name="DonationDetail" component={DonationDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
