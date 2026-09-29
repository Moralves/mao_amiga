import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ListScreen } from './src/screens/ListScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { DonationScreen } from './src/screens/DonationScreen';
import { CollectionPoint } from './src/types/types';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'list' | 'detail' | 'donation'>('list');
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);

  const handleSelectPoint = (point: CollectionPoint) => {
    setSelectedPoint(point);
    setCurrentScreen('detail');
  };

  const handleBackToList = () => {
    setCurrentScreen('list');
    setSelectedPoint(null);
  };

  const handleOpenDonation = () => {
    setCurrentScreen('donation');
  };

  const handleBackFromDonation = () => {
    setCurrentScreen('detail');
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {currentScreen === 'list' ? (
          <ListScreen onSelectPoint={handleSelectPoint} />
        ) : currentScreen === 'donation' ? (
          selectedPoint && <DonationScreen point={selectedPoint} onBack={handleBackFromDonation} />
        ) : (
          selectedPoint && (
            <DetailScreen point={selectedPoint} onBack={handleBackToList} onOpenDonation={handleOpenDonation} />
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
