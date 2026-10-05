import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ListScreen } from './src/screens/ListScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { DonationScreen } from './src/screens/DonationScreen';
import { PointItemsScreen } from './src/screens/PointItemsScreen';
import { MyDonationsScreen } from './src/screens/MyDonationsScreen';
import { DonationDetailScreen } from './src/screens/DonationDetailScreen';
import { CollectionPoint, DonationItem } from './src/types/types';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    'list' | 'detail' | 'donation' | 'pointItems' | 'myDonations' | 'donationDetail'
  >('list');
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null);
  const [donationReturnScreen, setDonationReturnScreen] = useState<'detail' | 'pointItems' | 'myDonations'>('detail');
  const [donationDetailReturnScreen, setDonationDetailReturnScreen] = useState<'myDonations' | 'pointItems'>('myDonations');

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

  // Abre os detalhes da doação a partir do histórico
  const handleOpenDonationDetailFromHistory = (donation: DonationItem) => {
    setSelectedDonation(donation);
    setDonationDetailReturnScreen('myDonations');
    setCurrentScreen('donationDetail');
  };

  // Abre os detalhes da doação a partir dos itens do ponto
  const handleOpenDonationDetailFromPointItems = (donation: DonationItem) => {
    setSelectedDonation(donation);
    setDonationDetailReturnScreen('pointItems');
    setCurrentScreen('donationDetail');
  };

  // Retorno manual a partir do detalhe da doação
  const handleBackFromDonationDetail = () => {
    setCurrentScreen(donationDetailReturnScreen);
    setSelectedDonation(null);
  };

  // Retorno após exclusão com sucesso da doação
  const handleDonationDeleted = () => {
    setCurrentScreen(donationDetailReturnScreen);
    setSelectedDonation(null);
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
            onSelectDonation={handleOpenDonationDetailFromHistory}
          />
        ) : currentScreen === 'donationDetail' ? (
          <DonationDetailScreen
            route={{
              params: {
                donation: selectedDonation ?? undefined,
                doacao: selectedDonation ?? undefined,
                ...(selectedDonation || {}),
              },
            }}
            donation={selectedDonation ?? undefined}
            onBack={handleBackFromDonationDetail}
            onDeleteSuccess={handleDonationDeleted}
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
              onSelectDonation={handleOpenDonationDetailFromPointItems}
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
