// screens/OpenPackScreen.tsx

import { RevealedCard, CardRevealSwiper } from '@/components/CardRevealSwiper';
import { useUser } from '@/context/userContext';
import { Card } from '@/types/user';
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  Modal,
  Image,
} from 'react-native';

// Function to select cards with weighted probability
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
  const [isOpening, setIsOpening] = useState(false);
  const [revealedCards, setRevealedCards] = useState<RevealedCard[] | null>(
    null
  );
  const [timeLeft, setTimeLeft] = useState('');

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

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (!canOpenPack && !isDebugUser) {
      timer = setInterval(() => {
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const diff = tomorrow.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(
          minutes
        ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        setTimeLeft(formattedTime);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [canOpenPack, isDebugUser]);

  const handleOpenPack = async () => {
    if (!cardPool || cardPool.length === 0 || isOpening) return;
    setIsOpening(true);

    const newDrawnCards: Card[] = [];
    for (let i = 0; i < 5; i++) {
      const newCard = drawWeightedCard(cardPool);
      if (newCard) newDrawnCards.push(newCard);
    }

    if (newDrawnCards.length > 0) {
      try {
        const imagePreloadPromises = newDrawnCards.map((card) =>
          Image.prefetch(card.imageUrl)
        );
        await Promise.all(imagePreloadPromises);

        const seenInThisSession = new Set<string>(
          user.acquiredCards.map((c) => c.id)
        );

        const processedCards = newDrawnCards.map((card) => {
          const isDuplicate = seenInThisSession.has(card.id);
          if (!isDuplicate) {
            seenInThisSession.add(card.id);
          }
          return { card: card, isDuplicate: isDuplicate };
        });

        setRevealedCards(processedCards);
      } catch (error) {
        console.error('Error preloading images:', error);
        setRevealedCards(
          newDrawnCards.map((card) => ({ card, isDuplicate: false }))
        );
      }
    }

    setIsOpening(false);
  };

  const handleRevealComplete = () => {
    if (revealedCards) {
      addCardsFromBooster(revealedCards.map((item) => item.card));
    }
    setRevealedCards(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {canOpenPack ? (
        <View style={styles.content}>
          <Pressable onPress={handleOpenPack} disabled={isLoading || isOpening}>
            <View style={styles.boosterPlaceholder}>
              {isOpening ? (
                <ActivityIndicator size='large' color='#c7a568' />
              ) : (
                <Text style={styles.boosterText}>TAP TO OPEN</Text>
              )}
            </View>
          </Pressable>
          <View style={styles.statusBox}>
            <Text style={styles.statusValue}>
              {isDebugUser ? '∞' : packsLeft}
            </Text>
            <Text style={styles.statusLabel}>Packs left today</Text>
          </View>
          {isDebugUser && (
            <Text style={styles.debugText}>DEBUG MODE ACTIVE</Text>
          )}
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>Daily Limit</Text>
          <View style={styles.countdownBox}>
            <Text style={styles.countdownLabel}>Next pack in:</Text>
            <Text style={styles.countdownTimer}>{timeLeft}</Text>
          </View>
          <Text style={styles.comebackText}>
            Come back soon to expand your collection.
          </Text>
        </View>
      )}

      <Modal
        animationType='fade'
        transparent={true}
        visible={revealedCards !== null}
        onRequestClose={handleRevealComplete}
      >
        {revealedCards && (
          <CardRevealSwiper
            revealedItems={revealedCards}
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
  statusBox: { alignItems: 'center', marginVertical: 40 },
  statusValue: { fontSize: 72, color: '#fff', fontWeight: 'bold' },
  statusLabel: { fontSize: 18, color: '#c7a568', marginTop: 4 },
  debugText: {
    color: '#fdd835',
    position: 'absolute',
    bottom: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 42,
    color: '#fff',
    fontFamily: 'Cinzel_700Bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  countdownBox: {
    alignItems: 'center',
    marginVertical: 40,
    padding: 20,
    borderWidth: 1,
    borderColor: '#c7a568',
    borderRadius: 15,
    backgroundColor: '#1C1C1E',
  },
  countdownLabel: {
    fontSize: 18,
    color: '#c7a568',
    fontFamily: 'Cinzel_400Regular',
  },
  countdownTimer: {
    fontSize: 64,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 10,
  },
  comebackText: {
    color: '#aaa',
    marginTop: 40,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
