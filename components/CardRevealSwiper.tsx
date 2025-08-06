// components/CardRevealSwiper.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Card as CardData } from '../types/user';
import { Card as CardComponent } from '@/components/Card';

// Exporting this type so OpenPackScreen knows what data structure to send
export interface RevealedCard {
  card: CardData;
  isDuplicate: boolean;
}

interface CardRevealSwiperProps {
  revealedItems: RevealedCard[];
  onSwipedAll: () => void;
}

export const CardRevealSwiper = ({
  revealedItems,
  onSwipedAll,
}: CardRevealSwiperProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const [swipedCardIndex, setSwipedCardIndex] = useState(0);

  const cardWidth = screenWidth * 0.85;
  const cardHeight = cardWidth * 1.4;

  const handleSwiped = () => {
    setSwipedCardIndex((prevIndex) => prevIndex + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {swipedCardIndex + 1} / {revealedItems.length}
        </Text>
      </View>

      <Swiper
        cards={revealedItems}
        renderCard={(item: RevealedCard) => {
          if (!item) return null;

          const { card, isDuplicate } = item;

          return (
            <View style={styles.cardWrapper}>
              <CardComponent
                images={{
                  base: card.imageUrl,
                  mask: card.maskUrl,
                  foil: card.foilUrl,
                }}
                onPress={() => {}}
                width={cardWidth}
                height={cardHeight}
              />

              {isDuplicate ? (
                <View style={styles.duplicateBanner}>
                  <Text style={styles.bannerText}>DUPLICATE</Text>
                </View>
              ) : (
                <View style={[styles.duplicateBanner, styles.newBanner]}>
                  <Text style={[styles.bannerText, styles.newText]}>NEW</Text>
                </View>
              )}
            </View>
          );
        }}
        onSwiped={handleSwiped}
        onSwipedAll={onSwipedAll}
        stackSize={3}
        stackSeparation={18}
        backgroundColor={'transparent'}
        cardStyle={{ justifyContent: 'center', alignItems: 'center' }}
        disableTopSwipe
        disableBottomSwipe
      />
      <Text style={styles.instructions}>Swipe to reveal your cards</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  counterContainer: {
    position: 'absolute',
    top: 20,
    width: '100%',
    alignItems: 'center',
    zIndex: 20,
  },
  counterText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Cinzel_700Bold',
  },
  cardWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  duplicateBanner: {
    position: 'absolute',
    zIndex: 10,
    top: 30,
    left: 20,
    backgroundColor: '#fdd835',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    transform: [{ rotate: '-12deg' }],
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  newBanner: {
    backgroundColor: '#29b6f6',
    left: 'auto',
    right: 20,
    transform: [{ rotate: '12deg' }],
  },
  bannerText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 22,
  },
  newText: {
    color: '#fff',
  },
  instructions: {
    position: 'absolute',
    bottom: '10%',
    width: '100%',
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Cinzel_700Bold',
    letterSpacing: 1,
  },
});
