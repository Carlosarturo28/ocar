// types/user.ts

import { Card, Expansion } from '@/utils/imageCache.utils';

// Tipos literales para mayor seguridad y autocompletado
export type CardType = 'Object' | 'Realm' | 'Creature' | 'Servants';
export type CardAffinity = 'Umbral' | 'Verdant' | 'Bestial' | 'Arcane';

// Estructura del usuario, con los nuevos campos para el límite de sobres
export interface User {
  username: string;
  acquiredCards: Card[];
  lastOpenedDate: string; // Fecha del último sobre abierto, en formato 'YYYY-MM-DD'
  packsOpenedToday: number; // Contador de sobres abiertos en esa fecha
}

// Estructura del valor que provee nuestro Contexto
export type UserContextType = {
  user: User | null;
  expansions: Expansion[];
  cardPool: Card[];
  isLoading: boolean;
  updateUsername: (newUsername: string) => Promise<void>;
  addCardsFromBooster: (drawnCards: Card[]) => Promise<void>;
  resetAccount: () => Promise<void>;
};
