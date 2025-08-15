// src/utils/imageCache.utils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export const STORAGE_KEYS = {
  EXPANSIONS: '@imageCache:expansions',
  IMAGES_MAP: '@imageCache:imagesMap',
} as const;

export interface Card {
  id: string;
  name: string;
  imageUrl: string;
  foilUrl: string | null;
  isHolo: boolean;
  maskUrl: string | null;
  type: string;
  affinity: string;
  probability: number;
}

export interface Expansion {
  id: number;
  name: string;
  description: string;
  releaseYear: number;
  logoUrl: string;
  cards: Card[];
}

export type ImagesMap = Record<string, string>; // { remoteUrl: localPath }

export async function saveImageLocally(url: string): Promise<string> {
  const fileName = url.split('/').pop() || `${Date.now()}.img`;
  const localPath = FileSystem.cacheDirectory + fileName;
  await FileSystem.downloadAsync(url, localPath);
  return localPath;
}

export async function deleteLocalImage(localPath: string) {
  try {
    await FileSystem.deleteAsync(localPath, { idempotent: true });
  } catch (err) {
    console.warn(`Failed to delete local image ${localPath}`, err);
  }
}

export async function loadCachedData(): Promise<{
  expansions: Expansion[] | null;
  imagesMap: ImagesMap;
}> {
  const expansions = await AsyncStorage.getItem(STORAGE_KEYS.EXPANSIONS);
  const imagesMap = await AsyncStorage.getItem(STORAGE_KEYS.IMAGES_MAP);
  return {
    expansions: expansions ? JSON.parse(expansions) : null,
    imagesMap: imagesMap ? JSON.parse(imagesMap) : {},
  };
}

export async function saveCachedData(
  expansions: Expansion[],
  imagesMap: ImagesMap
) {
  await AsyncStorage.setItem(
    STORAGE_KEYS.EXPANSIONS,
    JSON.stringify(expansions)
  );
  await AsyncStorage.setItem(
    STORAGE_KEYS.IMAGES_MAP,
    JSON.stringify(imagesMap)
  );
}

export function extractAllUrls(expansions: Expansion[]): string[] {
  return Array.from(
    new Set(
      expansions
        .flatMap((exp) => exp.cards || [])
        .flatMap((card) => [card.imageUrl, card.maskUrl, card.foilUrl])
        .filter(
          (url): url is string =>
            !!url &&
            typeof url === 'string' &&
            (url.startsWith('http://') || url.startsWith('https://'))
        )
    )
  );
}

export function compareExpansions(
  newExpansions: Expansion[],
  oldExpansions: Expansion[]
) {
  const newUrls = new Set(extractAllUrls(newExpansions));
  const oldUrls = new Set(extractAllUrls(oldExpansions));

  const added = [...newUrls].filter((u) => !oldUrls.has(u));
  const removed = [...oldUrls].filter((u) => !newUrls.has(u));

  return { added, removed };
}
