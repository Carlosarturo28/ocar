import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  Text,
} from 'react-native';
import { Card } from '@/components/Card'; // ✅ Card original sin cambios
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AnimatedSelectedCard } from '@/components/card/AnimatedSelectedCard';

interface CardData {
  id: string;
  name: string;
  imageUrl: string;
  maskUrl: string;
  foilUrl: string;
}

const misCartas: CardData[] = [
  {
    id: 'swsh179',
    name: 'Flareon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH179_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/179_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/foils/upscaled/179_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh181',
    name: 'Vaporeon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH181_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/181_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/foils/upscaled/181_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh183',
    name: 'Jolteon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH183_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/183_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/foils/upscaled/183_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh8-245',
    name: 'Celebi',
    imageUrl: 'https://images.pokemontcg.io/swsh8/245_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh8/masks/upscaled/245_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swsh8/foils/upscaled/245_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh11-186',
    name: 'Giratina',
    imageUrl: 'https://images.pokemontcg.io/swsh11/186_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh11/masks/upscaled/186_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swsh11/foils/upscaled/186_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh9-14568',
    name: 'Charizard',
    imageUrl: 'https://images.pokemontcg.io/swsh9/18_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh9/masks/upscaled/018_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swsh9/foils/upscaled/018_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh174679',
    name: 'Flareon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH179_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/179_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/foils/upscaled/179_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh1864561',
    name: 'Vaporeon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH181_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/181_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/foils/upscaled/181_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh134683',
    name: 'Jolteon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH183_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/183_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/foils/upscaled/183_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh8-234245',
    name: 'Celebi',
    imageUrl: 'https://images.pokemontcg.io/swsh8/245_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh8/masks/upscaled/245_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swsh8/foils/upscaled/245_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh11-1833336',
    name: 'Giratina',
    imageUrl: 'https://images.pokemontcg.io/swsh11/186_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh11/masks/upscaled/186_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swsh11/foils/upscaled/186_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh9-1822222222',
    name: 'Charizard',
    imageUrl: 'https://images.pokemontcg.io/swsh9/18_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh9/masks/upscaled/018_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swsh9/foils/upscaled/018_foil_etched_sunpillar_2x.webp',
  },
  {
    id: '23425',
    name: 'Flareon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH179_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/179_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/foils/upscaled/179_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh18123443',
    name: 'Vaporeon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH181_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/181_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/foils/upscaled/181_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh183234',
    name: 'Jolteon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH183_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/183_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/foils/upscaled/183_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh8-24543',
    name: 'Celebi',
    imageUrl: 'https://images.pokemontcg.io/swsh8/245_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh8/masks/upscaled/245_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swsh8/foils/upscaled/245_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh11-18644',
    name: 'Giratina',
    imageUrl: 'https://images.pokemontcg.io/swsh11/186_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh11/masks/upscaled/186_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swsh11/foils/upscaled/186_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh9-1823',
    name: 'Charizard',
    imageUrl: 'https://images.pokemontcg.io/swsh9/18_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh9/masks/upscaled/018_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swsh9/foils/upscaled/018_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh179323',
    name: 'Flareon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH179_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/179_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/foils/upscaled/179_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh18132',
    name: 'Vaporeon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH181_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/181_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/foils/upscaled/181_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh18322',
    name: 'Jolteon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH183_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/183_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/foils/upscaled/183_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh8-24512',
    name: 'Celebi',
    imageUrl: 'https://images.pokemontcg.io/swsh8/245_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh8/masks/upscaled/245_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swsh8/foils/upscaled/245_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh11-18632',
    name: 'Giratina',
    imageUrl: 'https://images.pokemontcg.io/swsh11/186_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh11/masks/upscaled/186_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swsh11/foils/upscaled/186_foil_etched_sunpillar_2x.webp',
  },
  {
    id: 'swsh9-1823',
    name: 'Charizard',
    imageUrl: 'https://images.pokemontcg.io/swsh9/18_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh9/masks/upscaled/018_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://poke-holo.b-cdn.net/foils/swsh9/foils/upscaled/018_foil_etched_sunpillar_2x.webp',
  },
];

export default function CardListScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardPositions, setCardPositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});

  const selectedItem = misCartas.find((c) => c.id === selectedId);

  // ✅ Función para capturar la posición de cada carta en el grid
  const handleCardLayout = (cardId: string, event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;

    // Medimos la posición relativa a la pantalla completa
    event.target.measureInWindow((windowX: number, windowY: number) => {
      setCardPositions((prev) => ({
        ...prev,
        [cardId]: {
          x: windowX + width / 2, // Centro X de la carta
          y: windowY + height / 2, // Centro Y de la carta
        },
      }));
    });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <FlatList
        style={{
          paddingHorizontal: 10,
        }}
        data={misCartas}
        ListFooterComponent={
          <View
            style={{
              paddingBottom: 150,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                marginTop: 60,
                paddingVertical: 10,
                fontSize: 14,
                color: '#646464ff',
                fontFamily: 'Cinzel_700Bold',
                textAlign: 'center',
              }}
            >
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
              // ✅ Sin props adicionales - Card original
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={3}
      />

      {/* ✅ Modal con la carta animada */}
      {selectedItem && (
        <AnimatedSelectedCard
          images={{
            base: selectedItem.imageUrl,
            mask: selectedItem.maskUrl,
            foil: selectedItem.foilUrl,
          }}
          onClose={() => setSelectedId(null)}
          fromPosition={cardPositions[selectedItem.id]} // ✅ Posición de origen
        />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  logoContainer: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  logo: { width: 150, height: 150, resizeMode: 'contain' },
  cardWrapper: { flex: 1, alignItems: 'center', marginVertical: 10 },
});
