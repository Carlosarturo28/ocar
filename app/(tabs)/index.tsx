import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  Text,
  StatusBar,
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
  isHolo?: boolean;
}

const misCartas: CardData[] = [
  {
    id: 'swsh179',
    name: 'Flareon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH179_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/179_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/Flareon.png',
    isHolo: true,
  },
  {
    id: 'swsh181',
    name: 'vaporeon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH181_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/181_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/vaporeon.png',
  },
  {
    id: 'swsh183',
    name: 'Jolteon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH183_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/183_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/Jolteon.png',
    isHolo: true,
  },
  {
    id: 'swsh8-245',
    name: 'celebi',
    imageUrl: 'https://images.pokemontcg.io/swsh8/245_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh8/masks/upscaled/245_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/celebi.png',
  },
  {
    id: 'swsh11-186',
    name: 'Giratina',
    imageUrl: 'https://images.pokemontcg.io/swsh11/186_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh11/masks/upscaled/186_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/Giratina.png',
    isHolo: true,
  },
  {
    id: 'swsh9-14568',
    name: 'charizard',
    imageUrl: 'https://images.pokemontcg.io/swsh9/18_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh9/masks/upscaled/018_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/charizard.png',
    isHolo: true,
  },
  {
    id: 'swsh174679',
    name: 'Flareon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH179_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/179_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/Flareon.png',
  },
  {
    id: 'swsh1864561',
    name: 'vaporeon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH181_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/181_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/vaporeon.png',
    isHolo: true,
  },
  {
    id: 'swsh134683',
    name: 'Jolteon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH183_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/183_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/Jolteon.png',
  },
  {
    id: 'swsh8-234245',
    name: 'celebi',
    imageUrl: 'https://images.pokemontcg.io/swsh8/245_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh8/masks/upscaled/245_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/celebi.png',
    isHolo: true,
  },
  {
    id: 'swsh11-1833336',
    name: 'Giratina',
    imageUrl: 'https://images.pokemontcg.io/swsh11/186_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh11/masks/upscaled/186_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/Giratina.png',
    isHolo: true,
  },
  {
    id: 'swsh9-1822222222',
    name: 'charizard',
    imageUrl: 'https://images.pokemontcg.io/swsh9/18_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh9/masks/upscaled/018_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/charizard.png',
    isHolo: true,
  },
  {
    id: 'swsh17ghfgh4679',
    name: 'Flareon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH179_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/179_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/Flareon.png',
  },
  {
    id: 'swsh18sdf64561',
    name: 'vaporeon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH181_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/181_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/vaporeon.png',
  },
  {
    id: 'swsh134asdasdf683',
    name: 'Jolteon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH183_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/183_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/Jolteon.png',
  },
  {
    id: 'swsh8-234asdsad245',
    name: 'celebi',
    imageUrl: 'https://images.pokemontcg.io/swsh8/245_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh8/masks/upscaled/245_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/celebi.png',
  },
  {
    id: 'swsh11-183sdfsdf3336',
    name: 'Giratina',
    imageUrl: 'https://images.pokemontcg.io/swsh11/186_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh11/masks/upscaled/186_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/Giratina.png',
  },
  {
    id: 'swsh9-18sdfsdf22222222',
    name: 'charizard',
    imageUrl: 'https://images.pokemontcg.io/swsh9/18_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh9/masks/upscaled/018_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/charizard.png',
  },
  {
    id: 'swsh17asds4679',
    name: 'Flareon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH179_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/179_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/Flareon.png',
  },
  {
    id: 'swsh18sdfs64561',
    name: 'vaporeon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH181_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/181_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/vaporeon.png',
  },
  {
    id: 'swsh134sdfsdfsdf683',
    name: 'Jolteon',
    imageUrl: 'https://images.pokemontcg.io/swshp/SWSH183_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swshp/masks/upscaled/183_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/Jolteon.png',
  },
  {
    id: 'swsh8-234sdfsdf245',
    name: 'celebi',
    imageUrl: 'https://images.pokemontcg.io/swsh8/245_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh8/masks/upscaled/245_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/celebi.png',
  },
  {
    id: 'swsh11-183sdfsdf3336',
    name: 'Giratina',
    imageUrl: 'https://images.pokemontcg.io/swsh11/186_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh11/masks/upscaled/186_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/Giratina.png',
  },
  {
    id: 'swsh9-1822222dsg2',
    name: 'charizard',
    imageUrl: 'https://images.pokemontcg.io/swsh9/18_hires.png',
    maskUrl:
      'https://poke-holo.b-cdn.net/foils/swsh9/masks/upscaled/018_foil_etched_sunpillar_2x.webp',
    foilUrl:
      'https://github.com/Carlosarturo28/ocar/raw/main/assets/foils/charizard.png',
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
      <StatusBar barStyle={'light-content'} />
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
          isHolo={selectedItem.isHolo}
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
