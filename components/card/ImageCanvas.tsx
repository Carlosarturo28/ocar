import React from 'react';
import {
  Canvas,
  RadialGradient,
  vec,
  Image,
  Group,
  RoundedRect,
  Mask,
  SkPoint,
  SkImage, // Importamos el tipo SkImage para type-safety
} from '@shopify/react-native-skia';
import { CardAssets } from '../Card';
import { HolographicLayer } from './HolographicLayer';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  DerivedValue,
} from 'react-native-reanimated';
import { useImageCache } from '@/context/ImageCacheContext';

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
  const { getImage } = useImageCache();

  const baseImage: SkImage | null = getImage(images.base);
  const maskImage: SkImage | null = getImage(images.mask);
  const foilImage: SkImage | null = getImage(images.foil);

  const isFoilVisible = useDerivedValue(() => {
    return touchPosition.value.x > 0;
  });

  const derivedAdjustedCenter: DerivedValue<SkPoint> = useDerivedValue(() => {
    return vec(width.value - gradientCenter.x, gradientCenter.y);
  });

  const maxDimension: DerivedValue<number> = useDerivedValue(() => {
    return Math.max(width.value, height.value);
  });

  const maxDimensionMask: DerivedValue<number> = useDerivedValue(() => {
    return Math.max(width.value, height.value) * 0.3;
  });

  const animatedCanvasStyle = useAnimatedStyle(() => {
    return {
      width: width.value,
      height: height.value,
    };
  });

  if (!baseImage) {
    return null;
  }

  function glareShinyLayer() {
    return (
      <Group blendMode={'overlay'}>
        <RoundedRect x={0} y={0} width={width} r={radius} height={height}>
          <RadialGradient
            c={derivedAdjustedCenter}
            r={maxDimension}
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
    if (!foilImage) return null;

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
    <Animated.View style={animatedCanvasStyle}>
      <Canvas style={{ flex: 1 }}>
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
