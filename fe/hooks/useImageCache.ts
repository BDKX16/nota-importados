import { useState, useEffect, useCallback } from "react";

interface ImageCacheEntry {
  url: string;
  timestamp: number;
  loaded: boolean;
}

interface ImageCache {
  [url: string]: ImageCacheEntry;
}

const CACHE_KEY = "image-cache-metadata";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos

// Cache en memoria para mejor rendimiento
const memoryCache: Map<string, Promise<string>> = new Map();

export function useImageCache() {
  const [cacheMetadata, setCacheMetadata] = useState<ImageCache>({});

  useEffect(() => {
    loadCacheMetadata();
  }, []);

  const loadCacheMetadata = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(CACHE_KEY);
      if (stored) {
        const metadata = JSON.parse(stored);
        const now = Date.now();

        // Filtrar entradas expiradas
        const validMetadata: ImageCache = {};
        Object.entries(metadata).forEach(([url, entry]: [string, any]) => {
          if (now - entry.timestamp < CACHE_DURATION) {
            validMetadata[url] = entry;
          }
        });

        setCacheMetadata(validMetadata);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(validMetadata));
      }
    } catch (error) {
      console.error("Error loading cache metadata:", error);
      clearCache();
    }
  }, []);

  const isImageCached = useCallback(
    (url: string): boolean => {
      return cacheMetadata[url]?.loaded || false;
    },
    [cacheMetadata]
  );

  const preloadImage = useCallback(
    (url: string): Promise<string> => {
      // Si ya está en el cache de memoria, devolverlo
      if (memoryCache.has(url)) {
        return memoryCache.get(url)!;
      }

      // Crear promesa para cargar la imagen
      const loadPromise = new Promise<string>((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          // Actualizar metadata
          const newMetadata = {
            ...cacheMetadata,
            [url]: {
              url,
              timestamp: Date.now(),
              loaded: true,
            },
          };

          setCacheMetadata(newMetadata);

          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(newMetadata));
          } catch (error) {
            console.warn("SessionStorage full, cache metadata not saved");
          }

          resolve(url);
        };

        img.onerror = () => {
          memoryCache.delete(url);
          reject(new Error(`Failed to load image: ${url}`));
        };

        // Configurar headers de cache para aprovechar el cache del navegador
        img.crossOrigin = "anonymous";
        img.src = url;
      });

      // Guardar en cache de memoria
      memoryCache.set(url, loadPromise);

      return loadPromise;
    },
    [cacheMetadata]
  );

  const clearCache = useCallback(() => {
    setCacheMetadata({});
    memoryCache.clear();
    sessionStorage.removeItem(CACHE_KEY);
  }, []);

  const getCacheStats = useCallback(() => {
    const totalEntries = Object.keys(cacheMetadata).length;
    const memoryEntries = memoryCache.size;

    return {
      totalEntries,
      memoryEntries,
      cacheHitRate: totalEntries > 0 ? (memoryEntries / totalEntries) * 100 : 0,
    };
  }, [cacheMetadata]);

  return {
    isImageCached,
    preloadImage,
    clearCache,
    getCacheStats,
  };
}
