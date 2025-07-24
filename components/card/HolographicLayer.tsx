// HolographicLayer.tsx (Versión Final, de Alto Rendimiento y con Efectos Intactos)

import React, { useMemo } from 'react';
import {
  Group,
  RoundedRect,
  LinearGradient,
  RadialGradient, // No se usa aquí, pero puede que lo tengas en otros archivos
  vec,
  SkPoint, // Importamos el tipo SkPoint
} from '@shopify/react-native-skia';
import {
  useDerivedValue,
  interpolate,
  SharedValue,
  DerivedValue,
} from 'react-native-reanimated';

// --- Helper Function (Sin cambios) ---
function withAlpha(color: string, alpha: number): string {
  const a = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),/);
  if (!a) return color;
  return `rgba(${a[1]}, ${a[2]}, ${a[3]}, ${alpha})`;
}

// LA CORRECCIÓN #1: Actualizamos los tipos de las props
interface HolographicLayerProps {
  width: SharedValue<number>;
  height: SharedValue<number>;
  radius: SharedValue<number>;
  adjustedCenter: DerivedValue<SkPoint>; // Acepta el valor derivado
}

interface HoloPattern {
  colors: string[];
  positions: number[];
}

export function HolographicLayer({
  width,
  height,
  adjustedCenter,
  radius,
}: HolographicLayerProps): React.ReactElement {
  // El `useMemo` se ejecuta una vez cuando el componente se monta.
  // No depende de la animación, por lo que es eficiente y no necesita cambios.
  const holoPattern: HoloPattern = useMemo(() => {
    const colors: string[] = [];
    const positions: number[] = [];
    const colorPalette: string[] = [
      'rgba(255, 192, 203, 1.0)',
      'rgba(173, 216, 230, 1.0)',
      'rgba(255, 255, 0, 1.0)',
      'rgba(144, 238, 144, 1.0)',
      'rgba(255, 165, 0, 1.0)',
      'rgba(221, 160, 221, 1.0)',
    ];
    let currentPosition = 0;
    while (currentPosition < 1) {
      const lineWidth = Math.random() * 0.06 + 0.02;
      const spacing = Math.random() * 0.08 + 0.03;
      if (currentPosition + lineWidth > 1) break;
      const baseColor =
        colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const transparentColor = withAlpha(baseColor, 0.0);
      const peakColor = withAlpha(baseColor, 0.8);
      const p0 = currentPosition;
      const p1 = currentPosition + lineWidth / 2;
      const p2 = currentPosition + lineWidth;
      colors.push(transparentColor, peakColor, transparentColor);
      positions.push(p0, p1, p2);
      currentPosition += lineWidth + spacing;
    }
    return { colors, positions };
  }, []); // El array de dependencias vacío asegura que se ejecute solo una vez por montaje.

  // LA CORRECCIÓN #2: Usamos .value DENTRO del worklet para los cálculos.
  const transform = useDerivedValue(() => {
    // Usamos .value para obtener el número actual para el cálculo
    const translateX = interpolate(
      adjustedCenter.value.x,
      [0, width.value],
      [80, -80]
    );
    const translateY = interpolate(
      adjustedCenter.value.y,
      [0, height.value],
      [80, -80]
    );
    return [{ translateX }, { translateY }];
  }, [adjustedCenter, width, height]); // Las dependencias son los SharedValues completos

  // LA CORRECCIÓN #3: Creamos un valor derivado para el vector `end`
  const endVec = useDerivedValue(() => {
    return vec(width.value, height.value);
  });

  return (
    <Group blendMode={'overlay'}>
      {/* Patrón de "glow" que se mueve */}
      <RoundedRect x={0} y={0} r={radius} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={endVec} // Pasamos el valor derivado
          colors={holoPattern.colors}
          positions={holoPattern.positions}
          transform={transform}
        />
      </RoundedRect>
    </Group>
  );
}
