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
  Card,
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
  loadingMessage: string;
  getImage: (remoteUrl: string) => SkImage | null;
  clearCache: () => Promise<void>;
  cacheSize: number;
  expansions: Expansion[]; // ✅ Estas expansions ya tienen rutas locales
  cardPool: Card[]; // ✅ Estas cards ya tienen rutas locales
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
  const [expansions, setExpansions] = useState<Expansion[]>([]);
  const [cardPool, setCardPool] = useState<Card[]>([]);

  // ✅ Función para convertir URLs remotas a rutas locales en las expansiones
  const convertExpansionsToLocalPaths = useCallback(
    (
      expansions: Expansion[],
      imagesMap: Record<string, string>
    ): Expansion[] => {
      return expansions.map((expansion) => ({
        ...expansion,
        logoUrl: imagesMap[expansion.logoUrl] || expansion.logoUrl, // Convertir logo
        cards: expansion.cards.map((card) => ({
          ...card,
          imageUrl: imagesMap[card.imageUrl] || card.imageUrl, // Convertir imagen de carta
          maskUrl: card.maskUrl
            ? imagesMap[card.maskUrl] || card.maskUrl
            : card.maskUrl, // Convertir máscara solo si no es null
          foilUrl: card.foilUrl
            ? imagesMap[card.foilUrl] || card.foilUrl
            : card.foilUrl, // Convertir foil solo si no es null
        })),
      }));
    },
    []
  );

  const buildSkiaCache = useCallback(
    async (imagesMap: Record<string, string>) => {
      const newCache: ImageCache = {};

      for (const [remoteUrl, localPath] of Object.entries(imagesMap)) {
        try {
          const data = await Skia.Data.fromURI(localPath);
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
        const remoteExpansions: Expansion[] = await res.json();

        if (!oldExpansions) {
          setLoadingMessage('Gathering all creatures and relics...');
          const urls = extractAllUrls(remoteExpansions);

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
          await saveCachedData(remoteExpansions, newMap);

          if (mounted) {
            // ✅ Convertir expansiones a rutas locales ANTES de guardarlas en el estado
            const localExpansions = convertExpansionsToLocalPaths(
              remoteExpansions,
              newMap
            );
            setExpansions(localExpansions);
            setCardPool(localExpansions.flatMap((exp) => exp.cards));

            setLoadingMessage('Imbuing magic into the scrolls...');
            await buildSkiaCache(newMap);
          }
        } else {
          const { added, removed } = compareExpansions(
            remoteExpansions,
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
          await saveCachedData(remoteExpansions, updatedMap);

          if (mounted) {
            // ✅ Convertir expansiones a rutas locales ANTES de guardarlas en el estado
            const localExpansions = convertExpansionsToLocalPaths(
              remoteExpansions,
              updatedMap
            );
            setExpansions(localExpansions);
            setCardPool(localExpansions.flatMap((exp) => exp.cards));

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
  }, [buildSkiaCache, convertExpansionsToLocalPaths]);

  const getImage = useCallback(
    (remoteUrl: string) => imageCache[remoteUrl] || null,
    [imageCache]
  );

  const clearCache = useCallback(async () => {
    setImageCache({});
    await saveCachedData([], {});
    setExpansions([]);
    setCardPool([]);
  }, []);

  const cacheSize = useMemo(() => Object.keys(imageCache).length, [imageCache]);

  const value: ImageCacheContextType = useMemo(
    () => ({
      imageCache,
      isLoading,
      loadingProgress,
      loadingMessage,
      getImage,
      clearCache,
      cacheSize,
      expansions, // ✅ Ya contienen rutas locales
      cardPool, // ✅ Ya contienen rutas locales
    }),
    [
      imageCache,
      isLoading,
      loadingProgress,
      loadingMessage,
      getImage,
      clearCache,
      cacheSize,
      expansions,
      cardPool,
    ]
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
