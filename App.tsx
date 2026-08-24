import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ListScreen } from './src/screens/ListScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { CollectionPoint } from './src/types/types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'list' | 'detail'>('list');
  const [selectedPoint, setSelectedPoint] = useState<CollectionPoint | null>(null);

  const handleSelectPoint = (point: CollectionPoint) => {
    setSelectedPoint(point);
    setCurrentScreen('detail');
  };

  const handleBackToList = () => {
    setCurrentScreen('list');
    setSelectedPoint(null);
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'list' ? (
        <ListScreen onSelectPoint={handleSelectPoint} />
      ) : (
        selectedPoint && (
          <DetailScreen point={selectedPoint} onBack={handleBackToList} />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});