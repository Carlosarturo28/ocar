// CardListScreen.tsx (versión actualizada)

import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  Text,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Card } from '@/components/Card';
import { AnimatedSelectedCard } from '@/components/card/AnimatedSelectedCard';

interface CardData {
  id: string;
  name: string;
  imageUrl: string;
  maskUrl: string;
  foilUrl: string;
  isHolo?: boolean;
}

const CARDS_API_URL =
  'https://raw.githubusercontent.com/Carlosarturo28/ocar/refs/heads/main/assets/cards.json';

export default function CardListScreen() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardPositions, setCardPositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await fetch(CARDS_API_URL);
        if (!response.ok)
          throw new Error('No se pudo obtener la información de las cartas.');
        const data: CardData[] = await response.json();
        setCards(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchCardData();
  }, []);

  const selectedItem = cards.find((c) => c.id === selectedId);

  const handleCardLayout = (cardId: string, event: any) => {
    event.target.measureInWindow((windowX: number, windowY: number) => {
      const { width, height } = event.nativeEvent.layout;
      setCardPositions((prev) => ({
        ...prev,
        [cardId]: { x: windowX + width / 2, y: windowY + height / 2 },
      }));
    });
  };

  if (isFetchingData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size='large' color='#fff' />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'light-content'} />
      <FlatList
        style={{ paddingHorizontal: 10 }}
        data={cards}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 Of Creatures and Realms™. All rights reserved.
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={styles.cardWrapper}
            onLayout={(event) => handleCardLayout(item.id, event)}
          >
            <Card
              images={{
                base: item.imageUrl,
                mask: item.maskUrl,
                foil: item.foilUrl,
              }}
              onPress={() => setSelectedId(item.id)}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={3}
      />

      {selectedItem && (
        <AnimatedSelectedCard
          images={{
            base: selectedItem.imageUrl,
            mask: selectedItem.maskUrl,
            foil: selectedItem.foilUrl,
          }}
          isHolo={selectedItem.isHolo}
          onClose={() => setSelectedId(null)}
          fromPosition={cardPositions[selectedItem.id]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  logo: { width: 150, height: 150, resizeMode: 'contain' },
  cardWrapper: { flex: 1, alignItems: 'center', marginVertical: 10 },
  footer: {
    paddingBottom: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    marginTop: 60,
    paddingVertical: 10,
    fontSize: 14,
    color: '#646464ff',
    fontFamily: 'Cinzel_700Bold',
    textAlign: 'center',
  },
});
