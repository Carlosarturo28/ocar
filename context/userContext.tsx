// context/UserContext.tsx

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react';
import { Alert } from 'react-native'; // Alert se mantiene por si se usa en otras funciones como resetAccount
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Card, UserContextType, Expansion } from '../types/user';

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [expansions, setExpansions] = useState<Expansion[]>([]);
  const [cardPool, setCardPool] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const createNewUser = (): User => ({
    username: 'Nuevo Jugador',
    acquiredCards: [],
    lastOpenedDate: '',
    packsOpenedToday: 0,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const userLoader = async () => {
          const userDataJSON = await AsyncStorage.getItem('user');
          if (userDataJSON) {
            setUser(JSON.parse(userDataJSON) as User);
          } else {
            const newUser = createNewUser();
            await AsyncStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
          }
        };
        const cardLoader = async () => {
          const response = await fetch(
            'https://raw.githubusercontent.com/Carlosarturo28/ocar/refs/heads/main/assets/cards.json'
          );
          if (!response.ok) throw new Error('Failed to fetch card data');

          const expansionsData = (await response.json()) as Expansion[];
          setExpansions(expansionsData);

          const allCards = expansionsData.flatMap(
            (expansion) => expansion.cards
          );
          setCardPool(allCards);
        };

        await Promise.all([userLoader(), cardLoader()]);
      } catch (error) {
        console.error('Error al cargar los datos iniciales:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const addCardsFromBooster = async (drawnCards: Card[]) => {
    if (!user) return;

    const lowerCaseUsername = user.username.toLowerCase();
    const isDebugUser =
      lowerCaseUsername === 'carlos' || lowerCaseUsername === 'jimmy';

    const today = new Date().toISOString().split('T')[0];
    let packsOpened = user.lastOpenedDate === today ? user.packsOpenedToday : 0;

    if (!isDebugUser) {
      if (packsOpened >= 2) {
        // La alerta de límite se queda, porque es un feedback importante.
        Alert.alert(
          'Límite Alcanzado',
          'Ya has abierto tus 2 sobres de hoy. ¡Vuelve mañana!'
        );
        return;
      }
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

      // ✅ ¡LISTO! LA ALERTA DE "OBTUVISTE ESTAS CARTAS" HA SIDO ELIMINADA.
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

  return (
    <UserContext.Provider
      value={{
        user,
        expansions,
        cardPool,
        isLoading,
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
