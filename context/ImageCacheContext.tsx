// src/context/ImageCacheContext.tsx (CORREGIDO)

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Skia, SkImage } from '@shopify/react-native-skia';

const CARDS_API_URL =
  'https://raw.githubusercontent.com/Carlosarturo28/ocar/refs/heads/main/assets/cards.json';

interface ImageCache {
  [key: string]: SkImage | null;
}
interface ImageCacheContextType {
  imageCache: ImageCache;
  isLoading: boolean;
  getImage: (uri: string) => SkImage | null;
}

const ImageCacheContext = createContext<ImageCacheContextType | undefined>(
  undefined
);

export const ImageCacheProvider = ({ children }: { children: ReactNode }) => {
  const [imageCache, setImageCache] = useState<ImageCache>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAndCacheImages = async () => {
      try {
        const response = await fetch(CARDS_API_URL);
        const cards: {
          imageUrl: string;
          maskUrl?: string;
          foilUrl?: string;
        }[] = await response.json();

        const imageUrls = new Set<string>();
        cards.forEach((card) => {
          if (card.imageUrl) imageUrls.add(card.imageUrl);
          if (card.maskUrl) imageUrls.add(card.maskUrl);
          if (card.foilUrl) imageUrls.add(card.foilUrl);
        });

        const loadedImages = await Promise.all(
          Array.from(imageUrls).map(async (url) => {
            try {
              const data = await Skia.Data.fromURI(url);
              const image = Skia.Image.MakeImageFromEncoded(data);
              return { url, image };
            } catch (e) {
              console.error(`Error al cargar la imagen: ${url}`, e);
              return { url, image: null };
            }
          })
        );

        const cache = loadedImages.reduce((acc, { url, image }) => {
          acc[url] = image;
          return acc;
        }, {} as ImageCache);

        setImageCache(cache);
      } catch (error) {
        console.error('Fallo al cargar y cachear imágenes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAndCacheImages();
  }, []);

  const getImage = (uri: string): SkImage | null => {
    return imageCache[uri] || null;
  };

  return (
    <ImageCacheContext.Provider value={{ imageCache, isLoading, getImage }}>
      {children}
    </ImageCacheContext.Provider>
  );
};

export const useImageCache = () => {
  const context = useContext(ImageCacheContext);
  if (context === undefined) {
    throw new Error('useImageCache must be used within an ImageCacheProvider');
  }
  return context;
};
