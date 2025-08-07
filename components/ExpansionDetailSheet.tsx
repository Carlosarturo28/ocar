// components/ExpansionDetailSheet.tsx

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Expansion } from '@/types/user';
import { LinearGradient } from 'expo-linear-gradient';

interface ExpansionDetailSheetProps {
  expansion: Expansion | null;
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
}

export const ExpansionDetailSheet = ({
  expansion,
  bottomSheetModalRef,
}: ExpansionDetailSheetProps) => {
  const { width: screenWidth } = useWindowDimensions();
  // Definimos la altura de la imagen manteniendo el aspect ratio
  const imageHeight = screenWidth / 1.833;

  // Ajustamos los snap points para darle espacio a la imagen
  const snapPoints = useMemo(() => ['65%', '75%'], []);

  if (!expansion) return null;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={styles.sheetBackground}
      // ✅ 1. LE DECIMOS A LA LIBRERÍA QUE NO RENDERICE SU PROPIO HANDLER.
      // Esto elimina el espaciado superior que nos estaba molestando.
      handleComponent={null}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.9} // Respetando tu cambio de opacidad
        />
      )}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* ✅ 2. EL HANDLER MANUAL */}
        {/* Lo renderizamos como un View simple, posicionado de forma absoluta por encima de todo. */}
        <View style={styles.handleContainer}>
          <View style={styles.handleIndicator} />
        </View>

        <Image
          source={{ uri: expansion.logoUrl }}
          style={[styles.expansionImage, { height: imageHeight }]}
        />

        <View style={styles.infoWrapper}>
          <Text style={styles.title}>{expansion.name}</Text>
          <LinearGradient
            colors={['transparent', 'rgba(199, 165, 104, 0.25)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.divider}
          />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Release Year:</Text>
            <Text style={styles.infoValue}>{expansion.releaseYear}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Cards:</Text>
            <Text style={styles.infoValue}>{expansion.cards.length}</Text>
          </View>
          <Text style={styles.description}>{expansion.description}</Text>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  handleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 10,
    zIndex: 100,
  },
  handleIndicator: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Un color que resalte sobre la imagen
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 20,
  },
  expansionImage: {
    width: '100%',
    resizeMode: 'cover',
  },
  infoWrapper: {
    width: '100%',
    padding: 20,
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 28,
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '90%',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  infoLabel: {
    fontFamily: 'Cinzel_700Bold', // Respetando tu cambio
    fontSize: 16,
    color: '#aaa',
  },
  infoValue: {
    fontFamily: 'Cinzel_700Bold', // Respetando tu cambio
    fontSize: 16,
    color: '#c7a568',
  },
  description: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginTop: 20,
  },
});
