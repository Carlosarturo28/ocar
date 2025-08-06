// components/CardRevealSwiper.tsx

import React, { useState } from 'react'; // <-- Importamos useState
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

interface CardRevealSwiperProps {
  cards: CardData[];
  acquiredCardIds: Set<string>;
  onSwipedAll: () => void;
}

export const CardRevealSwiper = ({
  cards,
  acquiredCardIds,
  onSwipedAll,
}: CardRevealSwiperProps) => {
  const { width: screenWidth } = useWindowDimensions();

  // ✅ 1. AÑADIMOS UN ESTADO PARA LLEVAR LA CUENTA
  // Empieza en 0 y lo actualizaremos cada vez que se haga un swipe.
  const [swipedCardIndex, setSwipedCardIndex] = useState(0);

  const cardWidth = screenWidth * 0.85;
  const cardHeight = cardWidth * 1.4;

  const handleSwiped = () => {
    // Actualizamos el contador cada vez que se desliza una carta
    setSwipedCardIndex((prevIndex) => prevIndex + 1);
  };

  return (
    // Envolvemos todo en un SafeAreaView para que el contador no se pegue al notch
    <SafeAreaView style={styles.container}>
      {/* ✅ 2. EL CONTADOR */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {/* Mostramos el número de la carta actual y el total */}
          {swipedCardIndex + 1} / {cards.length}
        </Text>
      </View>

      <Swiper
        cards={cards}
        renderCard={(card: CardData) => {
          if (!card) return null;
          const isDuplicate = acquiredCardIds.has(card.id);

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

              {isDuplicate && (
                <View style={styles.duplicateBanner}>
                  <Text style={styles.bannerText}>REPETIDA</Text>
                </View>
              )}

              {!isDuplicate && (
                <View style={[styles.duplicateBanner, styles.newBanner]}>
                  <Text style={[styles.bannerText, styles.newText]}>NUEVA</Text>
                </View>
              )}
            </View>
          );
        }}
        // ✅ 3. LLAMAMOS A LA FUNCIÓN EN CADA SWIPE
        onSwiped={handleSwiped}
        onSwipedAll={onSwipedAll}
        stackSize={3}
        stackSeparation={18}
        backgroundColor={'transparent'}
        cardStyle={{ justifyContent: 'center', alignItems: 'center' }}
        disableTopSwipe
        disableBottomSwipe
      />
      <Text style={styles.instructions}>Desliza para revelar tus cartas</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  // Estilo para el contenedor del contador en la parte superior
  counterContainer: {
    position: 'absolute',
    top: 20, // Lo separamos un poco de la parte de arriba
    width: '100%',
    alignItems: 'center',
    zIndex: 20, // Aseguramos que esté por encima de todo
  },
  // Estilo para el texto del contador
  counterText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Cinzel_700Bold', // Usamos la misma fuente para consistencia
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
