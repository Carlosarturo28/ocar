// ImageCanvas.tsx (Versión Final, de Alto Rendimiento y con Efectos Intactos)

import React from 'react';
import {
  Canvas,
  RadialGradient,
  vec,
  useImage,
  Image,
  Group,
  RoundedRect,
  Mask,
  SkPoint,
} from '@shopify/react-native-skia';
import { CardAssets } from '../Card';
import { HolographicLayer } from './HolographicLayer';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  DerivedValue,
} from 'react-native-reanimated';

// LA CORRECCIÓN #1: Actualizamos los tipos de las props
interface ImageCanvasProps {
  width: SharedValue<number>;
  height: SharedValue<number>;
  radius: SharedValue<number>;
  gradientCenter: { x: number; y: number };
  touchPosition: SharedValue<{ x: number; y: number }>;
  images: CardAssets;
  isSelected: boolean;
  isHolo?: boolean;
}

export function ImageCanvas({
  width,
  height,
  gradientCenter,
  touchPosition,
  radius,
  images,
  isSelected,
  isHolo = false,
}: ImageCanvasProps) {
  const { base, mask, foil } = images;
  const baseImage = useImage(base);
  const maskImage = useImage(mask);
  const foilImage = useImage(foil);

  const isFoilVisible = useDerivedValue(() => {
    return touchPosition.value.x > 0;
  });

  // LA CORRECCIÓN #2: Movemos los cálculos al hilo de la UI
  const derivedAdjustedCenter: DerivedValue<SkPoint> = useDerivedValue(() => {
    return vec(width.value - gradientCenter.x, gradientCenter.y);
  });

  const maxDimension: DerivedValue<number> = useDerivedValue(() => {
    return Math.max(width.value, height.value);
  });

  const maxDimensionMask: DerivedValue<number> = useDerivedValue(() => {
    // Cálculo separado para el foil para no afectar el otro
    return Math.max(width.value, height.value) * 0.3;
  });

  // LA CORRECCIÓN #3: Creamos un estilo animado para el contenedor del Canvas
  const animatedCanvasStyle = useAnimatedStyle(() => {
    return {
      width: width.value,
      height: height.value,
    };
  });

  // El `early return` sigue siendo seguro aquí
  if (!baseImage) {
    return null;
  }

  // Las funciones de renderizado de efectos NO CAMBIAN en su lógica visual.
  // Solo usan los nuevos valores derivados para ser eficientes.
  function glareShinyLayer() {
    return (
      <Group blendMode={'overlay'}>
        <RoundedRect x={0} y={0} width={width} r={radius} height={height}>
          <RadialGradient
            c={derivedAdjustedCenter} // Usamos el valor derivado
            r={maxDimension} // Usamos el valor derivado
            colors={[
              'hsla(0, 0%, 100%, 0.5)',
              'hsla(0, 0%, 100%, 0.35)',
              'hsla(0, 0%, 0%, 0.5)',
            ]}
            positions={[0.1, 0.2, 0.9]}
          />
        </RoundedRect>
      </Group>
    );
  }

  function maskedFoilLayer() {
    return (
      <Mask
        mode='luminance'
        mask={
          <RoundedRect x={0} y={0} r={radius} width={width} height={height}>
            <RadialGradient
              c={touchPosition}
              r={maxDimensionMask}
              colors={['white', 'black']}
              positions={[0.0, 1.0]}
            />
          </RoundedRect>
        }
      >
        <Image image={foilImage} width={width} height={height} fit='cover' />
      </Mask>
    );
  }

  return (
    // Envolvemos el Canvas en el contenedor animado
    <Animated.View style={animatedCanvasStyle}>
      <Canvas style={{ flex: 1 }}>
        {/* Usamos RoundedRect para aplicar el radio a la imagen base */}
        <RoundedRect x={0} y={0} width={width} height={height} r={radius}>
          <Image image={baseImage} height={height} width={width} fit='cover' />
        </RoundedRect>

        {maskImage && (
          <Image
            image={maskImage}
            height={height}
            width={width}
            fit='cover'
            opacity={0.9}
            blendMode='overlay'
          />
        )}

        {isSelected && foilImage && isFoilVisible.value && maskedFoilLayer()}

        {isSelected && glareShinyLayer()}

        {isSelected && isHolo && (
          <HolographicLayer
            adjustedCenter={derivedAdjustedCenter}
            height={height}
            width={width}
            radius={radius}
          />
        )}
      </Canvas>
    </Animated.View>
  );
}
