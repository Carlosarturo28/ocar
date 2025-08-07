// components/Card.tsx

import React, { useEffect } from 'react';
import { useWindowDimensions, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { GestureContainer } from './card/GestureContainer';
import { ImageCanvas } from './card/ImageCanvas';

export interface CardAssets {
  base: string;
  mask: string;
  foil: string;
}

// ✅ 1. AÑADIMOS PROPS OPCIONALES PARA EL TAMAÑO
interface CardProps {
  images: CardAssets;
  onPress: () => void;
  width?: number; // Ancho opcional
  height?: number; // Alto opcional
}

export function Card({
  images,
  onPress,
  width,
  height,
}: CardProps): React.JSX.Element {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const CARD_WIDTH = width || SCREEN_WIDTH / 3.6;
  const CARD_HEIGHT = height || 170;
  const CARD_RADIUS = 6;

  const mountProgress = useSharedValue(0);

  useEffect(() => {
    requestAnimationFrame(() => {
      mountProgress.value = withTiming(1, { duration: 700 });
    });
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(mountProgress.value, [0, 1], [-90, 0]);
    const opacity = interpolate(mountProgress.value, [0, 0.5], [0, 1]);
    const scale = interpolate(mountProgress.value, [0, 1], [0.95, 1]);

    return {
      // Usamos las dimensiones calculadas (grandes o pequeñas)
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      opacity,
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
    };
  });

  const animatedWidth = useSharedValue(CARD_WIDTH);
  const animatedHeight = useSharedValue(CARD_HEIGHT);
  const animatedRadius = useSharedValue(CARD_RADIUS);

  // El resto de la lógica de inclinación no cambia para nada...
  const [gradientCenter, setGradientCenter] = React.useState({ x: 0, y: 0 });
  const handleRotationChange = React.useCallback(
    (rx: number, ry: number) => {
      'worklet';
      const MAX_ANGLE = 10;
      runOnJS(setGradientCenter)({
        x: CARD_WIDTH / 2 + (CARD_WIDTH / 2) * (ry / MAX_ANGLE),
        y: CARD_HEIGHT / 2 + (CARD_HEIGHT / 2) * (rx / MAX_ANGLE),
      });
    },
    [CARD_WIDTH, CARD_HEIGHT]
  );
  const touchPosition = useSharedValue({ x: -1, y: -1 });
  const handleTouch = React.useCallback((x: number, y: number) => {
    'worklet';
    touchPosition.value = { x, y };
  }, []);

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.cardWrapper, animatedContainerStyle]}>
        <GestureContainer
          width={animatedWidth}
          height={animatedHeight}
          maxAngle={10}
          onRotationChange={handleRotationChange}
          onTouch={handleTouch}
          enabled={true}
          invertX={true}
          invertY={true}
        >
          <ImageCanvas
            images={images}
            width={animatedWidth}
            height={animatedHeight}
            gradientCenter={gradientCenter}
            touchPosition={touchPosition}
            radius={animatedRadius}
            isSelected={false}
          />
        </GestureContainer>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
});
