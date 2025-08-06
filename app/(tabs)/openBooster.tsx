// screens/OpenPackScreen.tsx

import { CardRevealSwiper } from '@/components/CardRevealSwiper';
import { useUser } from '@/context/userContext';
import { Card } from '@/types/user';
import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Pressable,
  Image, // Importamos Image para usar su método de precarga
} from 'react-native';

// Función para seleccionar cartas con probabilidad ponderada
const drawWeightedCard = (cardPool: Card[]): Card | null => {
  if (!cardPool || cardPool.length === 0) return null;
  const totalWeight = cardPool.reduce((sum, card) => sum + card.probability, 0);
  let randomNum = Math.random() * totalWeight;
  for (const card of cardPool) {
    randomNum -= card.probability;
    if (randomNum <= 0) return card;
  }
  return cardPool[cardPool.length - 1]; // Fallback
};

export default function OpenPackScreen() {
  const { user, cardPool, isLoading, addCardsFromBooster } = useUser();
  const [drawnCards, setDrawnCards] = useState<Card[] | null>(null);
  const [isOpening, setIsOpening] = useState(false); // Estado para la animación de carga

  const acquiredCardIds = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(user.acquiredCards.map((c) => c.id));
  }, [user]);

  const handleOpenPack = async () => {
    if (!cardPool || cardPool.length === 0 || isOpening) return;

    setIsOpening(true);

    // 1. Sacamos las 5 cartas
    const newDrawnCards: Card[] = [];
    for (let i = 0; i < 5; i++) {
      const newCard = drawWeightedCard(cardPool);
      if (newCard) newDrawnCards.push(newCard);
    }

    if (newDrawnCards.length > 0) {
      try {
        // 2. Creamos una promesa por cada imagen que queremos precargar
        const imagePreloadPromises = newDrawnCards.map((card) =>
          Image.prefetch(card.imageUrl)
        );

        // 3. Esperamos a que TODAS las imágenes se hayan descargado en segundo plano
        await Promise.all(imagePreloadPromises);

        // 4. Cuando están listas, las guardamos en el estado para mostrar el modal
        setDrawnCards(newDrawnCards);
      } catch (error) {
        console.error('Error al precargar las imágenes:', error);
        // Si la precarga falla, igual mostramos las cartas
        setDrawnCards(newDrawnCards);
      }
    }

    setIsOpening(false);
  };

  const handleRevealComplete = () => {
    if (drawnCards) {
      addCardsFromBooster(drawnCards);
    }
    setDrawnCards(null);
  };

  if (isLoading || !user) {
    return (
      <View style={styles.containerCentered}>
        <ActivityIndicator size='large' color='#fff' />
      </View>
    );
  }

  const lowerCaseUsername = user.username.toLowerCase();
  const isDebugUser =
    lowerCaseUsername === 'carlos' || lowerCaseUsername === 'jimmy';
  const today = new Date().toISOString().split('T')[0];
  const packsOpenedToday =
    user.lastOpenedDate === today ? user.packsOpenedToday : 0;
  const packsLeft = 2 - packsOpenedToday;
  const canOpenPack = packsLeft > 0 || isDebugUser;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Pressable
          onPress={handleOpenPack}
          disabled={!canOpenPack || isLoading || isOpening}
        >
          <View style={styles.boosterPlaceholder}>
            {isOpening ? (
              <ActivityIndicator size='large' color='#c7a568' />
            ) : (
              <Text style={styles.boosterText}>TOCA PARA ABRIR</Text>
            )}
          </View>
        </Pressable>

        <View style={styles.statusBox}>
          <Text style={styles.statusValue}>
            {canOpenPack ? (isDebugUser ? '∞' : packsLeft) : 0}
          </Text>
          <Text style={styles.statusLabel}>Sobres restantes hoy</Text>
        </View>

        {isDebugUser && (
          <Text style={styles.debugText}>MODO DEBUG ACTIVADO</Text>
        )}
      </View>

      <Modal
        animationType='fade'
        transparent={true}
        visible={drawnCards !== null}
        onRequestClose={handleRevealComplete}
      >
        {drawnCards && (
          <CardRevealSwiper
            cards={drawnCards}
            acquiredCardIds={acquiredCardIds}
            onSwipedAll={handleRevealComplete}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  containerCentered: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  boosterPlaceholder: {
    width: 250,
    height: 350,
    backgroundColor: '#333',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#c7a568',
  },
  boosterText: {
    color: '#c7a568',
    fontSize: 24,
    fontFamily: 'Cinzel_700Bold',
    textAlign: 'center',
  },
  debugText: {
    color: '#fdd835',
    position: 'absolute',
    bottom: 120,
    fontWeight: 'bold',
  },
  statusBox: { alignItems: 'center', marginVertical: 40 },
  statusValue: { fontSize: 72, color: '#fff', fontWeight: 'bold' },
  statusLabel: { fontSize: 18, color: '#c7a568', marginTop: 4 },
});
