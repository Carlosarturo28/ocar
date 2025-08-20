// screens/ProfileScreen.tsx

import { useUser } from '@/context/userContext';
import { CardAffinity } from '@/types/user';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
// Asumo que tienes estos iconos en la ruta especificada.
// Crea una carpeta 'icons' dentro de 'assets' para ellos.
const affinityIcons = {
  Umbral: require('@/assets/icons/umbral.png'),
  Verdant: require('@/assets/icons/verdant.png'),
  Bestial: require('@/assets/icons/bestial.png'),
  Arcane: require('@/assets/icons/arcane.png'),
};

export default function ProfileScreen() {
  const { user, isLoading, updateUsername, resetAccount } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState(user?.username || '');

  const stats = useMemo(() => {
    if (!user) return null;
    const initialStats = {
      byAffinity: { Umbral: 0, Verdant: 0, Bestial: 0, Arcane: 0 } as Record<
        CardAffinity,
        number
      >,
      totalHolo: user.acquiredCards.filter((c) => c.isHolo).length,
    };
    return user.acquiredCards.reduce((acc, card) => {
      acc.byAffinity[card.affinity as CardAffinity]++;
      return acc;
    }, initialStats);
  }, [user]);

  const handleSaveUsername = () => {
    if (tempUsername.trim()) {
      updateUsername(tempUsername.trim());
      setIsEditing(false);
    }
  };

  const handleResetPress = () => {
    Alert.alert(
      'Erase Progress',
      'Are you sure you want to erase your progress?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, erase all',
          onPress: resetAccount,
          style: 'destructive',
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.containerCentered}>
        <ActivityIndicator size='large' color='#fff' />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor='#121212' />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {isEditing ? (
            <TextInput
              value={tempUsername}
              onChangeText={setTempUsername}
              style={styles.input}
              autoFocus
            />
          ) : (
            <Text style={styles.username}>{user?.username}</Text>
          )}
          <Button
            title={isEditing ? 'Save' : 'Edit'}
            color='#c7a568'
            onPress={() =>
              isEditing ? handleSaveUsername() : setIsEditing(true)
            }
          />
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>General Statistics</Text>
          <View style={styles.generalStatsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {user?.acquiredCards.length ?? 0}
              </Text>
              <Text style={styles.statLabel}>Unique Cards</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats?.totalHolo ?? 0}</Text>
              <Text style={styles.statLabel}>Holo</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Collection by Affinity</Text>
          <View style={styles.affinityGrid}>
            {stats &&
              Object.entries(stats.byAffinity).map(([affinity, count]) => (
                <View key={affinity} style={styles.affinityBox}>
                  <Image
                    source={affinityIcons[affinity as CardAffinity]}
                    style={styles.affinityIcon}
                  />
                  <Text style={styles.affinityCount}>{count}</Text>
                  <Text style={styles.affinityLabel}>{affinity}</Text>
                </View>
              ))}
          </View>
        </View>

        <View style={styles.dangerZone}>
          <Button
            title='Start Over'
            color='#ff3b30'
            onPress={handleResetPress}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  containerCentered: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 150 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  username: { fontSize: 28, color: '#fff', fontFamily: 'Cinzel_700Bold' },
  input: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Cinzel_700Bold',
    borderBottomWidth: 1,
    borderColor: '#c7a568',
    flex: 1,
    marginRight: 10,
  },
  statsSection: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 22,
    color: '#c7a568',
    fontFamily: 'Cinzel_700Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  generalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 36, color: '#fff', fontWeight: 'bold' },
  statLabel: { fontSize: 14, color: '#aaa', marginTop: 4 },
  affinityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  affinityBox: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
  },
  affinityIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  affinityCount: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  affinityLabel: { fontSize: 14, color: '#c7a568', marginTop: 4 },
  dangerZone: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  footerImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
});
