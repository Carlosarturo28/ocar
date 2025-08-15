import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  SafeAreaView,
  Image,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Card as CardData } from '../types/user';

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

  // Animaciones de escala y opacidad
  const scaleAnim = useRef(new Animated.Value(1.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const currentCard = revealedItems[swipedCardIndex];
    if (currentCard && !currentCard.isDuplicate) {
      scaleAnim.setValue(1.5);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 120,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [swipedCardIndex]);

  const handleSwiped = () => {
    setSwipedCardIndex((prevIndex) => prevIndex + 1);
  };

  const renderCard = useCallback(
    (item: RevealedCard, index: number) => {
      if (!item) return null;

      const { card, isDuplicate } = item;
      const isActive = index === swipedCardIndex;

      return (
        <View style={styles.cardWrapper}>
          <Pressable
            style={{
              width: cardWidth,
              height: cardHeight,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <Image style={styles.cardImage} source={{ uri: card.imageUrl }} />
          </Pressable>

          {isActive && !isDuplicate && (
            <Animated.View
              style={[
                styles.newBanner,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }, { rotate: '12deg' }],
                },
              ]}
            >
              <Image
                source={require('@/assets/images/new-card.png')}
                style={styles.bannerImage}
                resizeMode='contain'
              />
            </Animated.View>
          )}
        </View>
      );
    },
    [cardWidth, cardHeight, swipedCardIndex, scaleAnim, opacityAnim]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {swipedCardIndex + 1} / {revealedItems.length}
        </Text>
      </View>

      <Swiper
        cards={revealedItems}
        renderCard={renderCard}
        onSwiped={handleSwiped}
        onSwipedAll={onSwipedAll}
        stackSize={2}
        stackSeparation={6}
        backgroundColor={'transparent'}
        cardStyle={{ justifyContent: 'center', alignItems: 'center' }}
        disableTopSwipe
        disableBottomSwipe
        stackAnimationTension={200}
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
  cardImage: {
    width: '100%',
    height: '100%',
  },
  newBanner: {
    position: 'absolute',
    zIndex: 10,
    top: 28,
    right: 20,
    transform: [{ rotate: '-12deg' }],
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
  bannerImage: {
    width: 120,
    height: 120,
  },
});
