import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserContextType } from '../types/user';
import { useImageCache } from './ImageCacheContext';
import { Card } from '@/utils/imageCache.utils';

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Usar datos y loading desde ImageCacheContext
  const {
    isLoading: imagesCacheLoading,
    expansions,
    cardPool,
  } = useImageCache();

  const createNewUser = (): User => ({
    username: 'Nuevo Jugador',
    acquiredCards: [],
    lastOpenedDate: '',
    packsOpenedToday: 0,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      if (imagesCacheLoading) return;

      try {
        const userDataJSON = await AsyncStorage.getItem('user');
        if (userDataJSON) {
          setUser(JSON.parse(userDataJSON) as User);
        } else {
          const newUser = createNewUser();
          await AsyncStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
        }
      } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [imagesCacheLoading]);

  const addCardsFromBooster = async (drawnCards: Card[]) => {
    if (!user) return;

    const lowerCaseUsername = user.username.toLowerCase();
    const isDebugUser =
      lowerCaseUsername === 'carlos' || lowerCaseUsername === 'jimmy';

    const today = new Date().toISOString().split('T')[0];
    let packsOpened = user.lastOpenedDate === today ? user.packsOpenedToday : 0;

    if (!isDebugUser && packsOpened >= 2) {
      Alert.alert(
        'Límite Alcanzado',
        'Ya has abierto tus 2 sobres de hoy. ¡Vuelve mañana!'
      );
      return;
    }

    try {
      const acquiredCardIds = new Set(user.acquiredCards.map((c) => c.id));
      const newUniqueCards = drawnCards.filter(
        (card) => !acquiredCardIds.has(card.id)
      );

      const updatedUser: User = {
        ...user,
        acquiredCards: [...user.acquiredCards, ...newUniqueCards],
        lastOpenedDate: today,
        packsOpenedToday: packsOpened + 1,
      };

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error al agregar las cartas del sobre:', error);
    }
  };

  const updateUsername = async (newUsername: string) => {
    if (user) {
      try {
        const updatedUser: User = { ...user, username: newUsername };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } catch (error) {
        console.error('Error al actualizar el nombre de usuario:', error);
      }
    }
  };

  const resetAccount = async () => {
    try {
      await AsyncStorage.removeItem('user');
      const newUser = createNewUser();
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      Alert.alert('Progress erased', 'Your account has been reset.');
    } catch (error) {
      console.error('Error al resetear la cuenta:', error);
    }
  };

  const totalLoading = isLoading || imagesCacheLoading;

  return (
    <UserContext.Provider
      value={{
        user,
        expansions,
        cardPool,
        isLoading: totalLoading,
        updateUsername,
        addCardsFromBooster,
        resetAccount,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};
