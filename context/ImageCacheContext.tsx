// src/context/ImageCacheContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { Skia, SkImage } from '@shopify/react-native-skia';
import {
  loadCachedData,
  saveCachedData,
  saveImageLocally,
  deleteLocalImage,
  compareExpansions,
  extractAllUrls,
  Expansion,
} from '@/utils/imageCache.utils';

const CARDS_API_URL =
  'https://raw.githubusercontent.com/Carlosarturo28/ocar/refs/heads/main/assets/cards.json';

interface ImageCache {
  [remoteUrl: string]: SkImage | null;
}

interface LoadingProgress {
  loaded: number;
  total: number;
  currentBatch: number;
  totalBatches: number;
}

interface ImageCacheContextType {
  imageCache: ImageCache;
  isLoading: boolean;
  loadingProgress: LoadingProgress;
  loadingMessage: string; // <-- nuevo
  getImage: (remoteUrl: string) => SkImage | null;
  clearCache: () => Promise<void>;
  cacheSize: number;
}

const ImageCacheContext = createContext<ImageCacheContextType | undefined>(
  undefined
);

export const ImageCacheProvider = ({ children }: { children: ReactNode }) => {
  const [imageCache, setImageCache] = useState<ImageCache>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({
    loaded: 0,
    total: 0,
    currentBatch: 0,
    totalBatches: 0,
  });
  const [loadingMessage, setLoadingMessage] = useState('Booting up...');

  const buildSkiaCache = useCallback(
    async (imagesMap: Record<string, string>) => {
      const newCache: ImageCache = {};

      for (const [remoteUrl, localPath] of Object.entries(imagesMap)) {
        try {
          const data = await Skia.Data.fromURI(localPath); // <- aquí el await
          if (!data) {
            newCache[remoteUrl] = null;
            continue;
          }
          const img = Skia.Image.MakeImageFromEncoded(data);
          newCache[remoteUrl] = img;
        } catch (err) {
          console.error(`Error creating SkImage for ${remoteUrl}`, err);
          newCache[remoteUrl] = null;
        }
      }

      setImageCache(newCache);
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    async function initCache() {
      try {
        const { expansions: oldExpansions, imagesMap: oldMap } =
          await loadCachedData();

        const res = await fetch(CARDS_API_URL);
        const newExpansions: Expansion[] = await res.json();

        if (!oldExpansions) {
          setLoadingMessage('Gathering all creatures and relics...');
          const urls = extractAllUrls(newExpansions);

          setLoadingProgress({
            loaded: 0,
            total: urls.length,
            currentBatch: 1,
            totalBatches: 1,
          });

          const newMap: Record<string, string> = {};
          for (let i = 0; i < urls.length; i++) {
            setLoadingMessage(
              `Calling forth creature ${i + 1} of ${urls.length}`
            );
            const localPath = await saveImageLocally(urls[i]);
            newMap[urls[i]] = localPath;
            setLoadingProgress((p) => ({ ...p, loaded: i + 1 }));
          }

          setLoadingMessage('Sealing the archives in the Royal Library...');
          await saveCachedData(newExpansions, newMap);

          if (mounted) {
            setLoadingMessage('Imbuing magic into the scrolls...');
            await buildSkiaCache(newMap);
          }
        } else {
          const { added, removed } = compareExpansions(
            newExpansions,
            oldExpansions
          );
          const updatedMap = { ...oldMap };

          if (added.length > 0) {
            setLoadingMessage(`Summoning ${added.length} new allies...`);
            setLoadingProgress({
              loaded: 0,
              total: added.length,
              currentBatch: 1,
              totalBatches: 1,
            });

            for (let i = 0; i < added.length; i++) {
              setLoadingMessage(
                `Calling forth creature ${i + 1} of ${added.length}`
              );
              updatedMap[added[i]] = await saveImageLocally(added[i]);
              setLoadingProgress((p) => ({ ...p, loaded: i + 1 }));
            }
          }

          if (removed.length > 0) {
            setLoadingMessage(
              `Banishment of ${removed.length} forsaken cards...`
            );
            for (const url of removed) {
              if (updatedMap[url]) {
                await deleteLocalImage(updatedMap[url]);
                delete updatedMap[url];
              }
            }
          }

          setLoadingMessage('Sealing the archives in the Royal Library...');
          await saveCachedData(newExpansions, updatedMap);

          if (mounted) {
            setLoadingMessage('Imbuing magic into the scrolls...');
            await buildSkiaCache(updatedMap);
          }
        }
      } catch (err) {
        console.error('Error initializing image cache:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initCache();
    return () => {
      mounted = false;
    };
  }, [buildSkiaCache]);

  const getImage = useCallback(
    (remoteUrl: string) => imageCache[remoteUrl] || null,
    [imageCache]
  );

  const clearCache = useCallback(async () => {
    setImageCache({});
    await saveCachedData([], {}); // limpia AsyncStorage
  }, []);

  const cacheSize = useMemo(() => Object.keys(imageCache).length, [imageCache]);

  const value: ImageCacheContextType = useMemo(
    () => ({
      imageCache,
      isLoading,
      loadingProgress,
      getImage,
      loadingMessage,
      clearCache,
      cacheSize,
    }),
    [imageCache, isLoading, loadingProgress, getImage, clearCache, cacheSize]
  );

  return (
    <ImageCacheContext.Provider value={value}>
      {children}
    </ImageCacheContext.Provider>
  );
};

export const useImageCache = () => {
  const ctx = useContext(ImageCacheContext);
  if (!ctx)
    throw new Error('useImageCache must be used within ImageCacheProvider');
  return ctx;
};
