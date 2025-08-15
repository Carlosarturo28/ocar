// screens/CardListScreen.tsx

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  SectionList,
  FlatList,
  StyleSheet,
  Text,
  StatusBar,
  ActivityIndicator,
  Image,
  SafeAreaView,
  LayoutChangeEvent,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

// --- UI Components & Context ---
import { Card as CardComponent } from '@/components/Card';
import { AnimatedSelectedCard } from '@/components/card/AnimatedSelectedCard';
import { ExpansionDetailSheet } from '@/components/ExpansionDetailSheet';
import { useUser } from '@/context/userContext';
import { Expansion } from '@/types/user';

// --- Local Resources ---
const CARD_BACK_IMAGE = require('@/assets/images/back.webp');
const LOGO_IMAGE = require('@/assets/logo.png');
const INFO_ICON_IMAGE = require('@/assets/images/info-icon.png');

export default function CardListScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { user, isLoading, expansions } = useUser();

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

  const sections = useMemo(
    () =>
      expansions.map((exp) => ({
        ...exp,
        data: [exp.cards || []],
      })),
    [expansions]
  );

  const CARD_WIDTH = SCREEN_WIDTH / 3.6;
  const CARD_HEIGHT = 170;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardPositions, setCardPositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});

  const acquiredCardIds = useMemo(() => {
    if (!user) return new Set<string>();
    return new Set(user.acquiredCards.map((c) => c.id));
  }, [user]);

  const selectedItem = cardPool.find((c) => c.id === selectedId);

  const handleCardLayout = (cardId: string, event: LayoutChangeEvent) => {
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
        keyExtractor={(item, index) =>
          item[0]?.id
            ? `section-${item[0].id}-${index}`
            : `section-empty-${index}`
        }
        stickySectionHeadersEnabled={false}
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
        renderItem={({ item }) => (
          <FlatList
            data={item}
            renderItem={({ item: cardItem, index }) => {
              const isAcquired = acquiredCardIds.has(cardItem.id);
              return (
                <View
                  style={styles.gridItemContainer}
                  onLayout={(e) => handleCardLayout(cardItem.id, e)}
                >
                  {isAcquired ? (
                    <CardComponent
                      index={index}
                      images={{
                        base: cardItem.imageUrl,
                        mask: cardItem.maskUrl,
                        foil: cardItem.foilUrl,
                      }}
                      onPress={() => setSelectedId(cardItem.id)}
                    />
                  ) : (
                    <View
                      style={{
                        width: CARD_WIDTH,
                        height: CARD_HEIGHT,
                        margin: 8,
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
            keyExtractor={(cardItem) => cardItem.id}
            numColumns={3}
            scrollEnabled={false}
          />
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
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: { alignItems: 'center', marginTop: 40 },
  logo: { width: 150, height: 150, resizeMode: 'contain' },
  sectionHeaderWrapper: {
    marginTop: 40,
    marginBottom: 20,
  },
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
