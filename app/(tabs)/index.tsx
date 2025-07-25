import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  Text,
  StatusBar,
  ActivityIndicator, // ✅ Importado para el indicador de carga
} from 'react-native';
import { Card } from '@/components/Card';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AnimatedSelectedCard } from '@/components/card/AnimatedSelectedCard';

interface CardData {
  id: string;
  name: string;
  imageUrl: string;
  maskUrl: string;
  foilUrl: string;
  isHolo?: boolean;
}

// ✅ URL de ejemplo con tus datos. ¡Reemplázala por tu URL real!
const CARDS_API_URL =
  'https://gist.githubusercontent.com/Carlosarturo28/f3014a605f6d65b067980993f3c3732c/raw/8141445749f71c4c935492d50694e9f906f2e854/cards.json';

export default function CardListScreen() {
  // ✅ Estados para manejar los datos, la carga y los errores
  const [cards, setCards] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardPositions, setCardPositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});

  // ✅ Hook para realizar la petición de red al montar el componente
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch(CARDS_API_URL);
        if (!response.ok) {
          throw new Error('No se pudo obtener la información de las cartas.');
        }
        const data: CardData[] = await response.json();
        setCards(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, []); // El array vacío asegura que se ejecute solo una vez

  // ✅ Ahora buscamos en el estado 'cards' en lugar de 'misCartas'
  const selectedItem = cards.find((c) => c.id === selectedId);

  const handleCardLayout = (cardId: string, event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    event.target.measureInWindow((windowX: number, windowY: number) => {
      setCardPositions((prev) => ({
        ...prev,
        [cardId]: { x: windowX + width / 2, y: windowY + height / 2 },
      }));
    });
  };

  // ✅ Renderizado condicional para el estado de carga
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size='large' color='#fff' />
        <Text style={styles.loadingText}>Cargando cartas...</Text>
      </View>
    );
  }

  // ✅ Renderizado condicional para el estado de error
  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle={'light-content'} />
      <FlatList
        style={{ paddingHorizontal: 10 }}
        // ✅ Usamos el estado 'cards' como fuente de datos
        data={cards}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 Of Creatures and Realms™. All rights reserved. Unauthorized
              reproduction or distribution is prohibited.
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  // ✅ Estilos para centrar los indicadores
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
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
