// En app/(tabs)/_layout.tsx

import React from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  ImageSourcePropType,
  ImageBackground,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Tabs } from 'expo-router';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useFonts, Cinzel_700Bold } from '@expo-google-fonts/cinzel';

const COLORS = {
  activeText: '#E0B64B',
  inactiveText: '#A9A9A9',
  shadow: '#E0B64B',
};

const BACKGROUND_IMAGE = require('../../assets/images/tab-background.png');

// --- NUEVO: PARÁMETROS DE ANIMACIÓN CONFIGURABLES ---
// ¡Ajusta estos valores para cambiar la animación fácilmente!
const ANIMATION_PARAMS = {
  SCALE_ACTIVE: 1.65, // Escala del ícono activo (antes 1.2)
  SCALE_INACTIVE: 1.3,
  TRANSLATE_Y_ACTIVE: -7, // Cuánto sube el ícono activo (0 es sin movimiento)
  TRANSLATE_Y_INACTIVE: -2,
  ANIMATION_DURATION: 200, // Duración en milisegundos (antes 300)
};

interface TabIconProps {
  icon: ImageSourcePropType;
  name: string;
  isFocused: boolean;
  activeIndex: Animated.SharedValue<number>;
  index: number;
}

const TabIcon: React.FC<TabIconProps> = ({
  icon,
  name,
  isFocused,
  activeIndex,
  index,
}) => {
  // --- MODIFICADO: ESTILO ANIMADO CON TRASLACIÓN Y ESCALA MÁS RÁPIDA ---
  const animatedStyle = useAnimatedStyle(() => {
    const isActive = activeIndex.value === index;
    const scale = withTiming(
      isActive
        ? ANIMATION_PARAMS.SCALE_ACTIVE
        : ANIMATION_PARAMS.SCALE_INACTIVE,
      { duration: ANIMATION_PARAMS.ANIMATION_DURATION }
    );
    const translateY = withTiming(
      isActive
        ? ANIMATION_PARAMS.TRANSLATE_Y_ACTIVE
        : ANIMATION_PARAMS.TRANSLATE_Y_INACTIVE,
      { duration: ANIMATION_PARAMS.ANIMATION_DURATION }
    );
    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(
        activeIndex.value === index ? COLORS.activeText : COLORS.inactiveText,
        { duration: ANIMATION_PARAMS.ANIMATION_DURATION }
      ),
    };
  });

  return (
    <View style={styles.tabIconContainer}>
      <Animated.View style={animatedStyle}>
        <Image
          source={icon}
          resizeMode='contain'
          style={[styles.tabIcon, isFocused && styles.tabIconFocused]}
        />
      </Animated.View>
      <Animated.Text style={[styles.tabLabel, animatedTextStyle]}>
        {name}
      </Animated.Text>
    </View>
  );
};

const CustomTabBar: React.FC<
  BottomTabBarProps & { activeIndex: Animated.SharedValue<number> }
> = ({ state, navigation, activeIndex }) => {
  useAnimatedReaction(
    () => state.index,
    (current_index, previous_index) => {
      if (current_index !== previous_index) {
        activeIndex.value = current_index;
      }
    },
    [state.index]
  );

  const tabConfig = {
    index: {
      icon: require('../../assets/images/cards.webp'),
      name: 'My cards',
    },
    openBooster: {
      icon: require('../../assets/images/booster.webp'),
      name: 'Open booster',
    },
    playCanvas: {
      icon: require('../../assets/images/playroom.webp'),
      name: 'Playroom',
    },
    profile: {
      icon: require('../../assets/images/profile.webp'),
      name: 'My profile',
    },
  };

  return (
    <View style={styles.customTabBarContainer}>
      <ImageBackground source={BACKGROUND_IMAGE} style={styles.tabBarBg}>
        <View style={styles.tabBarContent}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const tabInfo = tabConfig[route.name as keyof typeof tabConfig];

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableWithoutFeedback
                key={route.key}
                onPress={onPress}
                accessibilityRole='button'
                accessibilityState={isFocused ? { selected: true } : {}}
              >
                <View style={styles.tabBarButton}>
                  <TabIcon
                    icon={tabInfo.icon}
                    name={tabInfo.name}
                    isFocused={isFocused}
                    activeIndex={activeIndex}
                    index={index}
                  />
                </View>
              </TouchableWithoutFeedback>
            );
          })}
        </View>
      </ImageBackground>
    </View>
  );
};

export default function TabsLayout() {
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
  });

  const activeIndex = useSharedValue(0);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} activeIndex={activeIndex} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name='index' />
      <Tabs.Screen name='openBooster' />
      <Tabs.Screen name='playCanvas' />
      <Tabs.Screen name='profile' />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  customTabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
  },
  tabBarBg: {
    flex: 1,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  tabBarButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: '100%',
    backgroundColor: 'transparent',
  },
  tabIcon: {
    width: 35,
    height: 35,
    marginBottom: 5,
  },
  tabIconFocused: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  tabLabel: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 11,
    textAlign: 'center',
  },
});
