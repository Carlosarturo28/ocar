import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  useFonts,
  Cinzel_700Bold,
  Cinzel_400Regular,
} from '@expo-google-fonts/cinzel';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SystemBars } from 'react-native-edge-to-edge';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator, Text } from 'react-native';
import { ImageCacheProvider, useImageCache } from '@/context/ImageCacheContext';
import { UserProvider } from '@/context/userContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Cinzel_700Bold,
    Cinzel_400Regular,
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
      <BottomSheetModalProvider>
        <ImageCacheProvider>
          <AppContent />
        </ImageCacheProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const {
    isLoading: areImagesLoading,
    loadingMessage,
    loadingProgress,
  } = useImageCache();

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
        <SystemBars style='dark' />
        <ActivityIndicator size='large' color='#fff' />
        <Text
          style={{
            color: 'white',
            marginTop: 15,
            fontFamily: 'Cinzel_700Bold',
          }}
        >
          {loadingMessage}
        </Text>
        <Text style={{ color: '#aaa', marginTop: 5 }}>
          {loadingProgress.loaded} / {loadingProgress.total}
        </Text>
      </View>
    );
  }

  return (
    <UserProvider>
      <SystemBars style='dark' />
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      </Stack>
    </UserProvider>
  );
}
