import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PlayCanvas() {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'https://aprendeconsori.com/ocar' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  webview: {
    flex: 1,
    backgroundColor: '#121212',
  },
});
