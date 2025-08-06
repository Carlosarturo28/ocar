import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, Text } from 'react-native';
import { ImageCacheProvider, useImageCache } from '@/context/ImageCacheContext';
import { useColorScheme } from '@/components/useColorScheme';
import { UserProvider } from '@/context/userContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Cinzel_700Bold,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageCacheProvider>
        <AppContent />
      </ImageCacheProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const colorScheme = useColorScheme();

  const { isLoading: areImagesLoading } = useImageCache();

  if (areImagesLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#121212',
        }}
      >
        <ActivityIndicator size='large' color='#fff' />
        <Text
          style={{
            color: 'white',
            marginTop: 15,
            fontFamily: 'Cinzel_700Bold',
          }}
        >
          Loading resources...
        </Text>
      </View>
    );
  }

  return (
    <UserProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </UserProvider>
  );
}
