import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ListScreen } from './src/screens/ListScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { DonationScreen } from './src/screens/DonationScreen';
import { PointItemsScreen } from './src/screens/PointItemsScreen';
import { MyDonationsScreen } from './src/screens/MyDonationsScreen';
import { CollectionPoint } from './src/types/types';
import { mockCollectionPoints } from './src/data/mockPoints';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'list' | 'detail' | 'donation' | 'pointItems' | 'myDonations'>('list');
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [donationReturnScreen, setDonationReturnScreen] = useState<'detail' | 'pointItems' | 'myDonations'>('detail');

  const handleSelectPoint = (point: CollectionPoint) => {
    setSelectedPoint(point);
    setCurrentScreen('detail');
  };

  const handleBackToList = () => {
    setCurrentScreen('list');
    setSelectedPoint(null);
  };

  const handleOpenMyDonations = () => {
    setCurrentScreen('myDonations');
  };

  const handleBackFromMyDonations = () => {
    setCurrentScreen('list');
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

  const handleOpenCadastroFromMyDonations = () => {
    setSelectedPoint(null);
    setDonationReturnScreen('myDonations');
    setCurrentScreen('donation');
  };

  const handleDonationSaved = () => {
    if (donationReturnScreen === 'myDonations') {
      setCurrentScreen('myDonations');
    } else {
      handleOpenPointItems();
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {currentScreen === 'list' ? (
          <ListScreen
            onSelectPoint={handleSelectPoint}
            onOpenMyDonations={handleOpenMyDonations}
          />
        ) : currentScreen === 'myDonations' ? (
          <MyDonationsScreen
            onBack={handleBackFromMyDonations}
            onGoToCadastro={handleOpenCadastroFromMyDonations}
          />
        ) : currentScreen === 'donation' ? (
          <DonationScreen
            point={selectedPoint}
            onBack={handleBackFromDonation}
            onSaved={handleDonationSaved}
            onSelectPoint={setSelectedPoint}
          />
        ) : currentScreen === 'pointItems' ? (
          selectedPoint && (
            <PointItemsScreen
              point={selectedPoint}
              onBack={handleBackFromPointItems}
              onOpenDonation={handleOpenDonation}
            />
          )
        ) : (
          selectedPoint && (
            <DetailScreen
              point={selectedPoint}
              onBack={handleBackToList}
              onOpenDonation={handleOpenDonation}
              onOpenPointItems={handleOpenPointItems}
            />
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
