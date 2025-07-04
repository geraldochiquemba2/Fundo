import { useState, useEffect } from 'react';

interface UseSmartImageOptions {
  fallbackExtensions?: string[];
  fallbackColor?: string;
  showNameAsFallback?: boolean;
}

export const useSmartImage = (
  originalUrl: string, 
  name: string = '',
  options: UseSmartImageOptions = {}
) => {
  const [imageUrl, setImageUrl] = useState(originalUrl);
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error' | 'fallback'>('loading');
  const [attempts, setAttempts] = useState<string[]>([]);
  
  const {
    fallbackExtensions = ['.jpg', '.jpeg', '.png', '.webp'],
    fallbackColor = 'linear-gradient(135deg, #22c55e, #16a34a)',
    showNameAsFallback = true
  } = options;

  const tryImageLoad = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      // Add aggressive cache busting with timestamp and random
      const separator = url.includes('?') ? '&' : '?';
      img.src = `${url}${separator}t=${Date.now()}&r=${Math.random()}`;
    });
  };

  const getBaseUrl = (url: string): string => {
    const lastDotIndex = url.lastIndexOf('.');
    return lastDotIndex === -1 ? url : url.substring(0, lastDotIndex);
  };

  const getCurrentExtension = (url: string): string => {
    const lastDotIndex = url.lastIndexOf('.');
    return lastDotIndex === -1 ? '' : url.substring(lastDotIndex);
  };

  useEffect(() => {
    const loadImage = async () => {
      setImageStatus('loading');
      setAttempts([]);

      // Try the original URL first with cache busting
      const originalWorks = await tryImageLoad(originalUrl);
      if (originalWorks) {
        const separator = originalUrl.includes('?') ? '&' : '?';
        setImageUrl(`${originalUrl}${separator}t=${Date.now()}&r=${Math.random()}`);
        setImageStatus('loaded');
        return;
      }

      // If original doesn't work, try different extensions
      const baseUrl = getBaseUrl(originalUrl);
      const currentExt = getCurrentExtension(originalUrl);
      const extensionsToTry = fallbackExtensions.filter(ext => ext !== currentExt);
      
      let attemptedUrls = [originalUrl];

      for (const extension of extensionsToTry) {
        const testUrl = baseUrl + extension;
        attemptedUrls.push(testUrl);
        
        const works = await tryImageLoad(testUrl);
        if (works) {
          const separator = testUrl.includes('?') ? '&' : '?';
          setImageUrl(`${testUrl}${separator}t=${Date.now()}&r=${Math.random()}`);
          setImageStatus('loaded');
          setAttempts(attemptedUrls);
          return;
        }
      }

      // All attempts failed
      setAttempts(attemptedUrls);
      setImageStatus('error');
    };

    if (originalUrl) {
      loadImage();
    }
  }, [originalUrl]);

  const getFallbackStyle = (): React.CSSProperties => ({
    background: fallbackColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    color: 'white',
    fontSize: '1.125rem',
    fontWeight: '600',
    textAlign: 'center',
    padding: '1rem'
  });

  const getFallbackContent = () => {
    if (!showNameAsFallback) return null;
    return name || 'Imagem';
  };

  return {
    imageUrl: imageStatus === 'loaded' ? imageUrl : '',
    imageStatus,
    attempts,
    fallbackStyle: getFallbackStyle(),
    fallbackContent: getFallbackContent(),
    isLoading: imageStatus === 'loading',
    hasError: imageStatus === 'error',
    isLoaded: imageStatus === 'loaded'
  };
};