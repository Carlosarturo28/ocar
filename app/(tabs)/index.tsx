import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  SectionList,
  StyleSheet,
  Text,
  StatusBar,
  ActivityIndicator,
  Image,
  SafeAreaView,
  LayoutChangeEvent,
  useWindowDimensions,
  Pressable,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

// --- UI Components & Context ---
import { Card as CardComponent } from '@/components/Card';
import { AnimatedSelectedCard } from '@/components/card/AnimatedSelectedCard';
import { ExpansionDetailSheet } from '@/components/ExpansionDetailSheet';
import { useUser } from '@/context/userContext';
import { useImageCache } from '@/context/ImageCacheContext';
import { Expansion } from '@/utils/imageCache.utils';

// --- Local Resources ---
const CARD_BACK_IMAGE = require('@/assets/images/back.webp');
const LOGO_IMAGE = require('@/assets/logo.png');
const INFO_ICON_IMAGE = require('@/assets/images/info-icon.png');

interface CardRow {
  id: string;
  cards: any[];
}

interface ExpansionSection extends Expansion {
  data: CardRow[];
}

export default function CardListScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { user, isLoading, expansions } = useUser();
  const {
    isLoading: imagesLoading,
    loadingMessage,
    loadingProgress,
  } = useImageCache();

  const [selectedExpansion, setSelectedExpansion] = useState<Expansion | null>(
    null
  );
  const bottomSheetModalRef = useRef<BottomSheetModal | null>(null);

  const handlePresentModalPress = useCallback((expansion: Expansion) => {
    setSelectedExpansion(expansion);
    bottomSheetModalRef.current?.present();
  }, []);

  const cardPool = useMemo(
    () => expansions.flatMap((exp) => exp.cards || []),
    [expansions]
  );

  // Convertir expansiones a secciones con filas de 3 cartas
  const sections = useMemo((): ExpansionSection[] => {
    return expansions.map((exp) => {
      const cards = exp.cards || [];
      const rows: CardRow[] = [];

      for (let i = 0; i < cards.length; i += 3) {
        const rowCards = cards.slice(i, i + 3);
        rows.push({
          id: `${exp.id}-row-${i}`,
          cards: rowCards,
        });
      }

      return {
        ...exp,
        data: rows,
      };
    });
  }, [expansions]);

  const CARD_WIDTH = SCREEN_WIDTH / 3.6;
  const CARD_HEIGHT = 170;
  const ROW_HEIGHT = CARD_HEIGHT + 16;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardPositions, setCardPositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});

  const acquiredCardIds = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(user.acquiredCards.map((c) => c.id));
  }, [user]);

  const selectedItem = cardPool.find((c) => c.id === selectedId);

  const handleCardLayout = useCallback(
    (cardId: string, event: LayoutChangeEvent) => {
      event.target.measureInWindow((x, y, width, height) => {
        setCardPositions((prev) => ({
          ...prev,
          [cardId]: { x: x + width / 2, y: y + height / 2 },
        }));
      });
    },
    []
  );

  // ✅ Loading mejorado con progreso de imágenes
  if (isLoading || imagesLoading) {
    const progressPercentage =
      loadingProgress.total > 0
        ? Math.round((loadingProgress.loaded / loadingProgress.total) * 100)
        : 0;

    return (
      <View style={[styles.container, styles.centered]}>
        <Image source={LOGO_IMAGE} style={styles.loadingLogo} />
        <ActivityIndicator
          size='large'
          color='#c7a568'
          style={styles.loadingSpinner}
        />
        <Text style={styles.loadingMessage}>{loadingMessage}</Text>
        {loadingProgress.total > 0 && (
          <Text style={styles.loadingProgress}>
            {loadingProgress.loaded} / {loadingProgress.total} (
            {progressPercentage}%)
          </Text>
        )}
      </View>
    );
  }

  if (!expansions || expansions.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>
          Error: Could not load card expansions.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        removeClippedSubviews={true}
        // ✅ Optimizaciones compensatorias para mantener performance
initialNumToRender={50}
windowSize={50}
maxToRenderPerBatch={50}
        legacyImplementation={false}
        ListHeaderComponent={
          <View style={styles.logoContainer}>
            <Image source={LOGO_IMAGE} style={styles.logo} />
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 Of Creatures and Realms™.{'\n'}All rights reserved.
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeaderContainer}>
            <LinearGradient
              colors={[
                'transparent',
                'rgba(199, 165, 104, 0.25)',
                'transparent',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.divider}
            />
            {section.logoUrl && (
              <>
                <Image
                  source={{ uri: section.logoUrl }}
                  style={styles.sectionHeaderLogo}
                />
                <Pressable
                  style={styles.infoIconContainer}
                  onPress={() => handlePresentModalPress(section)}
                  hitSlop={10}
                >
                  <Image
                    source={INFO_ICON_IMAGE}
                    style={styles.infoIconImage}
                  />
                </Pressable>
              </>
            )}
          </View>
        )}
        renderItem={({ item: row }) => (
          <View style={styles.cardRow}>
            {row.cards.map((cardItem, index) => {
              const isAcquired = acquiredCardIds.has(cardItem.id);
              return (
                <View
                  key={cardItem.id}
                  style={styles.gridItemContainer}
                  onLayout={(e) => handleCardLayout(cardItem.id, e)}
                >
                  {isAcquired ? (
                    <Pressable style={[
                        styles.cardBackContainer,
                        {
                          width: CARD_WIDTH,
                          height: CARD_HEIGHT,
                        },
                      ]} onPress={() => {
                      setSelectedId(cardItem.id)
                    Alert.alert(cardItem.imageUrl)
                    }}>
                    <Image source={{ uri: cardItem.imageUrl }} style={styles.cardBackImage} />
                    </Pressable>
                  ) : (
                    <View
                      style={[
                        styles.cardBackContainer,
                        {
                          width: CARD_WIDTH,
                          height: CARD_HEIGHT,
                        },
                      ]}
                    >
                      <Image
                        source={CARD_BACK_IMAGE}
                        style={styles.cardBackImage}
                      />
                    </View>
                  )}
                </View>
              );
            })}
            {/* Spacers para completar filas incompletas */}
            {Array.from({ length: 3 - row.cards.length }).map((_, index) => (
              <View key={`spacer-${index}`} style={styles.gridItemContainer} />
            ))}
          </View>
        )}
      />

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

      <ExpansionDetailSheet
        expansion={selectedExpansion}
        bottomSheetModalRef={bottomSheetModalRef}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centered: { justifyContent: 'center', alignItems: 'center' },

  // ✅ Estilos mejorados para loading
  loadingLogo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingMessage: {
    color: '#c7a568',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Cinzel_400Regular',
    marginBottom: 10,
  },
  loadingProgress: {
    color: '#646464',
    fontSize: 14,
    textAlign: 'center',
  },

  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: { alignItems: 'center', marginTop: 40 },
  logo: { width: 150, height: 150, resizeMode: 'contain' },
  sectionHeaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionHeaderLogo: {
    width: '100%',
    aspectRatio: 1.833,
    resizeMode: 'contain',
  },
  infoIconContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 8,
  },
  infoIconImage: {
    width: 28,
    height: 28,
    opacity: 1,
  },
  divider: {
    height: 2,
    width: '90%',
    alignSelf: 'center',
  },

  // ✅ Nuevos estilos para el grid de cartas
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  gridItemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackContainer: {
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
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
    paddingHorizontal: 20,
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
