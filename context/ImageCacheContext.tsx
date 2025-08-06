// src/context/ImageCacheContext.tsx (SIMPLIFICADO Y CORREGIDO)

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { Skia, SkImage, useImage } from '@shopify/react-native-skia';

const CARDS_API_URL =
  'https://raw.githubusercontent.com/Carlosarturo28/ocar/refs/heads/main/assets/cards.json';

// Configuración de optimización
const BATCH_SIZE = 5;
const RETRY_ATTEMPTS = 2;
const CACHE_TIMEOUT = 30000;

interface ImageCache {
  [key: string]: SkImage | null;
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
  getImage: (uri: string) => SkImage | null;
  preloadImage: (uri: string) => Promise<SkImage | null>;
  clearCache: () => void;
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

  const loadImageWithRetry = useCallback(
    async (
      url: string,
      attempts: number = RETRY_ATTEMPTS
    ): Promise<SkImage | null> => {
      for (let i = 0; i < attempts; i++) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), CACHE_TIMEOUT)
          );

          const loadPromise = (async () => {
            const data = await Skia.Data.fromURI(url);
            return Skia.Image.MakeImageFromEncoded(data);
          })();

          const image = await Promise.race([loadPromise, timeoutPromise]);

          if (image) {
            return image;
          }
        } catch (error) {
          console.warn(
            `⚠️ Intento ${i + 1}/${attempts} falló para ${url}:`,
            error
          );
          if (i === attempts - 1) {
            console.error(`❌ Error final al cargar imagen: ${url}`, error);
          }
          if (i < attempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }
      return null;
    },
    []
  );

  const loadImagesInBatches = useCallback(
    async (urls: string[]) => {
      if (urls.length === 0) {
        return [];
      }

      const batches = [];
      for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        batches.push(urls.slice(i, i + BATCH_SIZE));
      }

      setLoadingProgress((prev) => ({
        ...prev,
        total: urls.length,
        totalBatches: batches.length,
      }));

      const allResults: Array<{ url: string; image: SkImage | null }> = [];

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];

        setLoadingProgress((prev) => ({
          ...prev,
          currentBatch: batchIndex + 1,
        }));

        try {
          const batchResults = await Promise.all(
            batch.map(async (url) => {
              const image = await loadImageWithRetry(url);

              setLoadingProgress((prev) => ({
                ...prev,
                loaded: prev.loaded + 1,
              }));

              setImageCache((prevCache) => ({
                ...prevCache,
                [url]: image,
              }));

              return { url, image };
            })
          );

          allResults.push(...batchResults);
        } catch (error) {
          console.error(`❌ Error en lote ${batchIndex + 1}:`, error);
        }

        if (batchIndex < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      return allResults;
    },
    [loadImageWithRetry]
  );

  useEffect(() => {
    let isMounted = true;

    const loadAndCacheImages = async () => {
      try {
        const response = await fetch(CARDS_API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const cards = await response.json();

        if (!isMounted) {
          return;
        }

        if (!Array.isArray(cards)) {
          throw new Error('La respuesta no es un array válido');
        }

        const imageUrls = Array.from(
          new Set(
            cards
              .flatMap((card) => [card.imageUrl, card.maskUrl, card.foilUrl])
              .filter(
                (url): url is string =>
                  url != null &&
                  typeof url === 'string' &&
                  (url.startsWith('http://') || url.startsWith('https://'))
              )
          )
        );

        if (imageUrls.length === 0) {
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        await loadImagesInBatches(imageUrls);
      } catch (error) {
        console.error('❌ Error en loadAndCacheImages:', error);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    setTimeout(() => {
      if (isMounted) {
        loadAndCacheImages();
      }
    }, 100);

    return () => {
      isMounted = false;
    };
  }, [loadImagesInBatches]);

  // Funciones del contexto (solo para URLs remotas)
  const preloadImage = useCallback(
    async (uri: string): Promise<SkImage | null> => {
      if (imageCache[uri]) {
        return imageCache[uri];
      }

      const image = await loadImageWithRetry(uri);

      setImageCache((prevCache) => ({
        ...prevCache,
        [uri]: image,
      }));

      return image;
    },
    [imageCache, loadImageWithRetry]
  );

  const clearCache = useCallback(() => {
    setImageCache({});
    setLoadingProgress({
      loaded: 0,
      total: 0,
      currentBatch: 0,
      totalBatches: 0,
    });
  }, []);

  const getImage = useCallback(
    (uri: string): SkImage | null => {
      return imageCache[uri] || null;
    },
    [imageCache]
  );

  const cacheSize = useMemo(() => {
    return Object.keys(imageCache).length;
  }, [imageCache]);

  const contextValue: ImageCacheContextType = useMemo(
    () => ({
      imageCache,
      isLoading,
      loadingProgress,
      getImage,
      preloadImage,
      clearCache,
      cacheSize,
    }),
    [
      imageCache,
      isLoading,
      loadingProgress,
      getImage,
      preloadImage,
      clearCache,
      cacheSize,
    ]
  );

  return (
    <ImageCacheContext.Provider value={contextValue}>
      {children}
    </ImageCacheContext.Provider>
  );
};

export const useImageCache = () => {
  const context = useContext(ImageCacheContext);
  if (context === undefined) {
    throw new Error(
      'useImageCache debe ser usado dentro de un ImageCacheProvider'
    );
  }
  return context;
};

// Hook adicional para monitorear el progreso de carga
export const useImageCacheProgress = () => {
  const { loadingProgress, isLoading } = useImageCache();

  const progressPercentage = useMemo(() => {
    if (loadingProgress.total === 0) return 0;
    return Math.round((loadingProgress.loaded / loadingProgress.total) * 100);
  }, [loadingProgress.loaded, loadingProgress.total]);

  return {
    ...loadingProgress,
    progressPercentage,
    isLoading,
  };
};

// Hook para assets locales (mejorado)
export const useLocalImage = (asset: any): SkImage | null => {
  // Usar directamente el hook de Skia con require()
  return useImage(asset);
};

// Hook para cargar assets con ruta string
export const useLocalImageFromPath = (assetPath: string) => {
  const [image, setImage] = useState<SkImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Intentar diferentes formas de resolver la ruta
        let resolvedUri: string;

        // Si ya es una URI válida
        if (assetPath.startsWith('http') || assetPath.startsWith('file://')) {
          resolvedUri = assetPath;
        } else {
          // Para rutas relativas, necesitamos usar bundle
          const { resolveAssetSource } = require('react-native');

          // Esto requiere que tengas el asset importado
          // Mejor usar require() directamente
          throw new Error(
            'Usa require() en lugar de rutas string para assets locales'
          );
        }

        const data = await Skia.Data.fromURI(resolvedUri);
        const skImage = Skia.Image.MakeImageFromEncoded(data);

        if (isMounted) {
          setImage(skImage);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading local image:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error desconocido');
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [assetPath]);

  return { image, isLoading, error };
};

// Hook para precargar assets locales en el cache principal
export const usePreloadLocalAssets = () => {
  const { preloadImage } = useImageCache();

  const preloadLocalAsset = useCallback(
    async (asset: any) => {
      try {
        const { resolveAssetSource } = require('react-native');
        const resolvedAsset = resolveAssetSource(asset);

        if (resolvedAsset?.uri) {
          return await preloadImage(resolvedAsset.uri);
        }

        return null;
      } catch (error) {
        console.error('Error preloading local asset:', error);
        return null;
      }
    },
    [preloadImage]
  );

  return { preloadLocalAsset };
};
