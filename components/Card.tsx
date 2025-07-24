import React, { useEffect } from 'react';
import { useWindowDimensions, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { GestureContainer } from './card/GestureContainer';
import { ImageCanvas } from './card/ImageCanvas';

export interface CardAssets {
  base: string;
  mask: string;
  foil: string;
}

// ✅ Props simplificadas: solo lo esencial.
interface CardProps {
  images: CardAssets;
  onPress: () => void;
}

export function Card({ images, onPress }: CardProps): React.JSX.Element {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // ✅ Dimensiones fijas para la tarjeta pequeña.
  const CARD_WIDTH = SCREEN_WIDTH / 3.6;
  const CARD_HEIGHT = 170;
  const CARD_RADIUS = 6; // Radio fijo para la tarjeta pequeña.

  // ✅ Único valor animado: para la aparición inicial del componente.
  const mountProgress = useSharedValue(0);

  // ✅ Animación de montaje simple.
  useEffect(() => {
    // Usamos requestAnimationFrame para asegurar que la UI se renderice antes de animar.
    requestAnimationFrame(() => {
      mountProgress.value = withTiming(1, { duration: 700 });
    });
  }, []);

  // ✅ Estilo animado solo para el montaje. El tamaño es fijo.
  const animatedContainerStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(mountProgress.value, [0, 1], [-90, 0]);
    const opacity = interpolate(mountProgress.value, [0, 0.5], [0, 1]); // Aparece más rápido
    const scale = interpolate(mountProgress.value, [0, 1], [0.95, 1]); // Sutil efecto de escala

    return {
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

  // ✅ SharedValues para los hijos, pero con valores constantes.
  // GestureContainer/ImageCanvas podrían esperar SharedValues.
  const animatedWidth = useSharedValue(CARD_WIDTH);
  const animatedHeight = useSharedValue(CARD_HEIGHT);
  const animatedRadius = useSharedValue(CARD_RADIUS);

  // --- Lógica del efecto de inclinación (sin cambios) ---
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
    [CARD_WIDTH, CARD_HEIGHT] // Dependencias constantes
  );

  const touchPosition = useSharedValue({ x: -1, y: -1 });
  const handleTouch = React.useCallback((x: number, y: number) => {
    'worklet';
    touchPosition.value = { x, y };
  }, []);
  // --- Fin de la lógica de inclinación ---

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
            isSelected={false} // ✅ Siempre es `false` en este componente
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
    // Puedes añadir un margen si es necesario para separar las tarjetas
    margin: 8,
  },
});
