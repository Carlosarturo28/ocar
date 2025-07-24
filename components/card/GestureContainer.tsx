// GestureContainer.tsx (Versión Corregida y de Alto Rendimiento)

import React from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useAnimatedReaction,
  SharedValue, // Importamos el tipo
} from 'react-native-reanimated';

interface GestureContainerProps {
  children: React.ReactNode;
  width: SharedValue<number>;
  radius?: number;
  height: SharedValue<number>;
  maxAngle?: number;
  onRotationChange?: (rx: number, ry: number) => void;
  onTouch?: (x: number, y: number) => void; // LA CORRECCIÓN #1: Nueva prop
  invertX?: boolean;
  invertY?: boolean;
  enabled?: boolean;
}

export function GestureContainer({
  children,
  width,
  height,
  maxAngle = 10,
  onRotationChange,
  onTouch, // LA CORRECCIÓN #1: Nueva prop
  invertX = false,
  invertY = false,
  enabled = false,
  radius = 6,
}: GestureContainerProps) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  // Esta función es un worklet y espera números.
  const interpolateRotation = React.useCallback(
    (value: number, size: number, invert = false) => {
      'worklet';
      const range = invert ? [maxAngle, -maxAngle] : [-maxAngle, maxAngle];
      return interpolate(value, [0, size], range, Extrapolation.CLAMP);
    },
    [maxAngle]
  );

  useAnimatedReaction(
    () => ({ x: rotateX.value, y: rotateY.value }),
    (current, previous) => {
      if (current !== previous && onRotationChange) {
        onRotationChange(current.x, current.y);
      }
    },
    [onRotationChange] // Añadimos la dependencia que faltaba
  );

  const gesture = Gesture.Pan()
    .onBegin((event) => {
      rotateX.value = withTiming(
        interpolateRotation(event.y, height.value, !invertX)
      );
      rotateY.value = withTiming(
        interpolateRotation(event.x, width.value, invertY)
      );
      if (onTouch) {
        onTouch(event.x, event.y); // LA CORRECCIÓN #2: Reportamos la posición
      }
    })
    .onUpdate((event) => {
      rotateX.value = interpolateRotation(event.y, height.value, !invertX);
      rotateY.value = interpolateRotation(event.x, width.value, invertY);
      if (onTouch) {
        onTouch(event.x, event.y); // LA CORRECCIÓN #2: Reportamos la posición
      }
    })
    .onFinalize(() => {
      rotateX.value = withTiming(0);
      rotateY.value = withTiming(0);
      if (onTouch) {
        onTouch(-1, -1); // LA CORRECCIÓN #3: Reseteamos la posición para ocultar el efecto
      }
    });

  const rStyle = useAnimatedStyle(
    () => ({
      transform: [
        { perspective: 300 },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
      ],
    }),
    [] // Dejamos el array de dependencias vacío para que se cree una sola vez
  );

  return (
    // Si la gestura no está habilitada, le pasamos una gestura deshabilitada.
    <GestureDetector gesture={enabled ? gesture : Gesture.Pan().enabled(false)}>
      <Animated.View
        style={[
          {
            // LA CORRECCIÓN #3: Pasamos el SharedValue COMPLETO al estilo.
            // Animated.View está optimizado para esto.
            height,
            width,
            borderRadius: radius,
            overflow: 'hidden',
          },
          rStyle,
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
