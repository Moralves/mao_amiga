import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ListScreen } from './src/screens/ListScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { DonationScreen } from './src/screens/DonationScreen';
import { PointItemsScreen } from './src/screens/PointItemsScreen';
import { CollectionPoint } from './src/types/types';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'list' | 'detail' | 'donation' | 'pointItems'>('list');
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [donationReturnScreen, setDonationReturnScreen] = useState<'detail' | 'pointItems'>('detail');

  const handleSelectPoint = (point: CollectionPoint) => {
    setSelectedPoint(point);
    setCurrentScreen('detail');
  };

  const handleBackToList = () => {
    setCurrentScreen('list');
    setSelectedPoint(null);
  };

  const handleOpenDonation = () => {
    setDonationReturnScreen(currentScreen === 'pointItems' ? 'pointItems' : 'detail');
    setCurrentScreen('donation');
  };

  const handleOpenPointItems = () => {
    setCurrentScreen('pointItems');
  };

  const handleBackFromDonation = () => {
    setCurrentScreen(donationReturnScreen);
  };

  const handleBackFromPointItems = () => {
    setCurrentScreen('detail');
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {currentScreen === 'list' ? (
          <ListScreen onSelectPoint={handleSelectPoint} />
        ) : currentScreen === 'donation' ? (
          selectedPoint && <DonationScreen point={selectedPoint} onBack={handleBackFromDonation} onSaved={handleOpenPointItems} />
        ) : currentScreen === 'pointItems' ? (
          selectedPoint && <PointItemsScreen point={selectedPoint} onBack={handleBackFromPointItems} onOpenDonation={handleOpenDonation} />
        ) : (
          selectedPoint && (
            <DetailScreen point={selectedPoint} onBack={handleBackToList} onOpenDonation={handleOpenDonation} onOpenPointItems={handleOpenPointItems} />
          )
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
