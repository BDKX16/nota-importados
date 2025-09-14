import React, { useState, useEffect, memo, useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useImageCache } from '@/hooks/useImageCache';

interface CachedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  eager?: boolean; // Para cargar inmediatamente sin lazy loading
}

const CachedImage = memo(function CachedImage({
  src,
  alt,
  className,
  fallback = "/placeholder.svg",
  onLoad,
  onError,
  eager = false
}: CachedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const imgRef = useRef<HTMLImageElement>(null);
  const { targetRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px' // Cargar cuando esté a 100px de ser visible
  });
  const { isImageCached, preloadImage } = useImageCache();

  // Determinar si la imagen debe cargarse
  useEffect(() => {
    if (eager || hasIntersected || isImageCached(src)) {
      setShouldLoad(true);
    }
  }, [eager, hasIntersected, src, isImageCached]);

  useEffect(() => {
    if (!src || src === fallback) {
      setImageSrc(fallback);
      setIsLoading(false);
      return;
    }

    if (shouldLoad) {
      loadImage(src);
    }
  }, [src, fallback, shouldLoad]);

  const loadImage = async (imageUrl: string) => {
    setIsLoading(true);
    setHasError(false);

    try {
      // Si la imagen ya está cacheada, cargarla directamente
      if (isImageCached(imageUrl)) {
        setImageSrc(imageUrl);
        setIsLoading(false);
        onLoad?.();
        return;
      }

      // Precargar la imagen y añadirla al cache
      await preloadImage(imageUrl);
      setImageSrc(imageUrl);
      setIsLoading(false);
      onLoad?.();
      
    } catch (error) {
      console.error('Error loading image:', error);
      setImageSrc(fallback);
      setHasError(true);
      setIsLoading(false);
      onError?.();
    }
  };

  return (
    <div 
      ref={targetRef}
      className="relative w-full h-full"
    >
      {(isLoading || !shouldLoad) && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse rounded ${className}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      {shouldLoad && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading="lazy"
          onLoad={() => {
            setIsLoading(false);
            onLoad?.();
          }}
          onError={() => {
            if (!hasError) {
              setImageSrc(fallback);
              setHasError(true);
              setIsLoading(false);
              onError?.();
            }
          }}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%'
          }}
        />
      )}
    </div>
  );
});

export default CachedImage;