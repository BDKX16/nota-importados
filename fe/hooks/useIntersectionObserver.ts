import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
}

export function useIntersectionObserver({
  threshold = 0.1,
  root = null,
  rootMargin = '50px'
}: UseIntersectionObserverProps = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        
        // Una vez que se intersecta, marcarlo como intersectado para siempre
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold,
        root,
        rootMargin
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [threshold, root, rootMargin, hasIntersected]);

  return {
    targetRef,
    isIntersecting,
    hasIntersected
  };
}