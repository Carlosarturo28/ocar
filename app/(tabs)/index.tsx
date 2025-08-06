import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  StatusBar,
  ActivityIndicator,
  Image,
  SafeAreaView,
  LayoutChangeEvent,
  useWindowDimensions, // Importamos para calcular el ancho
} from 'react-native';

// --- Componentes de UI ---
import { Card as CardComponent } from '@/components/Card'; // Asumo que esta es la ruta a tu Card.tsx
import { AnimatedSelectedCard } from '@/components/card/AnimatedSelectedCard';
import { useUser } from '@/context/userContext';

// --- Recursos Locales ---
// Si el alias '@' no funciona, usa una ruta relativa como '../../assets/images/back.webp'
const CARD_BACK_IMAGE = require('@/assets/images/back.webp');
const LOGO_IMAGE = require('../../assets/logo.png'); // Asegúrate que la ruta es correcta

export default function CardListScreen() {
  // Obtenemos el ancho de la pantalla para que los cálculos coincidan con Card.tsx
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { user, cardPool, isLoading } = useUser();

  // Estados locales para la interactividad de la UI
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardPositions, setCardPositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});

  // Memoizamos un Set con los IDs de las cartas del usuario para búsquedas eficientes
  const acquiredCardIds = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(user.acquiredCards.map((c) => c.id));
  }, [user]);

  // Encontramos el objeto de la carta seleccionada en el pool completo
  const selectedItem = cardPool.find((c) => c.id === selectedId);

  // Mide la posición de una carta en la pantalla para la animación
  const handleCardLayout = (cardId: string, event: LayoutChangeEvent) => {
    // La medición no es crítica para el layout, pero sí para la animación de apertura
    event.target.measureInWindow((x, y, width, height) => {
      setCardPositions((prev) => ({
        ...prev,
        [cardId]: { x: x + width / 2, y: y + height / 2 },
      }));
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size='large' color='#fff' />
      </View>
    );
  }

  if (!cardPool || cardPool.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>
          Error: No se pudieron cargar las cartas.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'} />
      <FlatList
        style={styles.list}
        data={cardPool}
        numColumns={3}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.logoContainer}>
            <Image source={LOGO_IMAGE} style={styles.logo} />
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 Of Creatures and Realms™. All rights reserved.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isAcquired = acquiredCardIds.has(item.id);

          return (
            <View
              style={styles.gridItemContainer}
              onLayout={(e) => handleCardLayout(item.id, e)}
            >
              {isAcquired ? (
                <CardComponent
                  images={{
                    base: item.imageUrl,
                    mask: item.maskUrl,
                    foil: item.foilUrl,
                  }}
                  onPress={() => setSelectedId(item.id)}
                />
              ) : (
                // El placeholder es un View que imita exactamente el tamaño y margen del CardComponent.
                <View
                  style={{
                    width: SCREEN_WIDTH / 3.6,
                    height: 170,
                    margin: 8, // El mismo margen que en styles.cardWrapper de Card.tsx
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#1C1C1E', // Un color de fondo sutil
                    borderRadius: 6, // El mismo radio que en Card.tsx
                  }}
                >
                  <Image
                    source={CARD_BACK_IMAGE}
                    style={styles.cardBackImage}
                  />
                </View>
              )}
            </View>
          );
        }}
      />

      {/* La vista animada de la carta seleccionada */}
      {selectedItem && acquiredCardIds.has(selectedItem.id) && (
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 10 },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  logo: { width: 150, height: 150, resizeMode: 'contain' },
  gridItemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
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
