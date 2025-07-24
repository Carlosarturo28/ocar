import React, { useEffect } from 'react';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { CardAssets } from '../Card';
import { GestureContainer } from '../card/GestureContainer';
import { ImageCanvas } from '../card/ImageCanvas';
import Animated, {
  useSharedValue,
  withTiming,
  runOnJS,
  useAnimatedStyle,
  interpolate,
  useDerivedValue,
} from 'react-native-reanimated';

interface Props {
  images: CardAssets;
  onClose: () => void;
  fromPosition?: { x: number; y: number }; // ✅ Posición de origen para la animación
}

export function AnimatedSelectedCard({ images, onClose, fromPosition }: Props) {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const mountProgress = useSharedValue(0);

  // ✅ Dimensiones exactas que debe animar
  const LARGE_WIDTH = SCREEN_WIDTH * 0.9;
  const LARGE_HEIGHT = LARGE_WIDTH * 1.4;
  const SMALL_WIDTH = SCREEN_WIDTH / 3.6;
  const SMALL_HEIGHT = 170;

  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2;

  useEffect(() => {
    // ✅ Animación de entrada más espectacular

    requestAnimationFrame(() => {
      mountProgress.value = withTiming(1, { duration: 1000 });
    });
  }, []);

  const handleClose = () => {
    // ✅ Animación de salida
    mountProgress.value = withTiming(0, { duration: 600 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  // ✅ Valores derivados para la carta interna
  const animatedRadius = useDerivedValue(() =>
    interpolate(mountProgress.value, [0, 1], [8, 17])
  );

  const animatedWidth = useDerivedValue(() =>
    interpolate(mountProgress.value, [0, 1], [SMALL_WIDTH, LARGE_WIDTH])
  );

  const animatedHeight = useDerivedValue(() =>
    interpolate(mountProgress.value, [0, 1], [SMALL_HEIGHT, LARGE_HEIGHT])
  );

  // ✅ Estilo animado para la carta en el modal
  const animatedCardStyle = useAnimatedStyle(() => {
    // ✅ DIMENSIONES QUE CAMBIAN DE PEQUEÑO A GRANDE
    const width = interpolate(
      mountProgress.value,
      [0, 1],
      [SMALL_WIDTH, LARGE_WIDTH]
    );
    const height = interpolate(
      mountProgress.value,
      [0, 1],
      [SMALL_HEIGHT, LARGE_HEIGHT]
    );

    // ✅ ROTACIÓN ESPECTACULAR: 360 grados al entrar, -360 al salir
    const rotateY = interpolate(mountProgress.value, [0, 1], [0, 360]);

    // ✅ TRASLACIÓN: Desde la posición original hasta el centro
    let translateX = 0;
    let translateY = 0;

    if (fromPosition) {
      // Calculamos la distancia desde la posición original hasta el centro
      const deltaX = centerX - fromPosition.x;
      const deltaY = centerY - fromPosition.y;

      // Al entrar: desde la posición original hasta el centro
      translateX = interpolate(
        mountProgress.value,
        [0, 1],
        [-deltaX, 0] // Invertido porque partimos del centro en el overlay
      );
      translateY = interpolate(mountProgress.value, [0, 1], [-deltaY, 0]);
    }

    // ✅ ESCALA DRAMÁTICA - Empieza pequeño y crece
    const scale = interpolate(
      mountProgress.value,
      [0, 0.3, 0.7, 1],
      [0.1, 0.8, 1.05, 1] // Efecto de "bounce" más pronunciado
    );

    // ✅ OPACIDAD PARA ENTRADA/SALIDA SUAVE
    const opacity = interpolate(mountProgress.value, [0, 0.2, 1], [0, 0.9, 1]);

    return {
      width,
      height,
      opacity,
      transform: [
        { perspective: 1000 },
        { translateX },
        { translateY },
        { scale },
        { rotateY: `${rotateY}deg` },
      ],
    };
  });

  // ✅ Estilo animado para el overlay (fondo) - MÁS OPACO
  const animatedOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      mountProgress.value,
      [0, 0.3, 1],
      [0, 0.9, 0.98] // ✅ Mucho más opaco para ocultar completamente el fondo
    );

    return {
      opacity,
    };
  });

  // ✅ Estilo animado para el botón de cerrar
  const animatedCloseButtonStyle = useAnimatedStyle(() => {
    const opacity = interpolate(mountProgress.value, [0, 0.7, 1], [0, 0, 1]);

    const scale = interpolate(mountProgress.value, [0.7, 1], [0.5, 1]);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // ✅ Lógica para el gradiente center y touch (copiada de Card)
  const [gradientCenter, setGradientCenter] = React.useState({ x: 0, y: 0 });
  const handleRotationChange = React.useCallback(
    (rx: number, ry: number) => {
      'worklet';
      const w = animatedWidth.value;
      const h = animatedHeight.value;
      const MAX_ANGLE = 10;
      runOnJS(setGradientCenter)({
        x: w / 2 + (w / 2) * (ry / MAX_ANGLE),
        y: h / 2 + (h / 2) * (rx / MAX_ANGLE),
      });
    },
    [animatedWidth, animatedHeight]
  );

  const touchPosition = useSharedValue({ x: -1, y: -1 });
  const handleTouch = React.useCallback(
    (x: number, y: number) => {
      'worklet';
      touchPosition.value = { x, y };
    },
    [touchPosition]
  );

  return (
    <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
      <Pressable style={styles.overlayPressable} onPress={handleClose}>
        <Animated.View
          style={[styles.selectedCardContainer, animatedCardStyle]}
        >
          {/* ✅ Recreamos la estructura de Card pero con control total */}
          <GestureContainer
            width={animatedWidth}
            height={animatedHeight}
            maxAngle={10}
            onRotationChange={handleRotationChange}
            onTouch={handleTouch}
            enabled={true}
            invertX={true}
            invertY={true}
            radius={17}
          >
            <ImageCanvas
              images={images}
              width={animatedWidth}
              height={animatedHeight}
              gradientCenter={gradientCenter}
              touchPosition={touchPosition}
              radius={animatedRadius}
              isSelected={true} // Siempre true en el modal
            />
          </GestureContainer>
        </Animated.View>
      </Pressable>

      <Animated.View style={[styles.closeButton, animatedCloseButtonStyle]}>
        <Pressable onPress={handleClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.98)', // ✅ Fondo base muy oscuro
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayPressable: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
