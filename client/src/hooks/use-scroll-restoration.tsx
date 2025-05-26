import { useEffect } from 'react';
import { useLocation } from 'wouter';

export const useScrollRestoration = (key: string) => {
  const [location] = useLocation();

  // Salva a posição atual do scroll quando o componente é desmontado
  const saveScrollPosition = () => {
    const scrollY = window.scrollY;
    sessionStorage.setItem(`scroll-${key}`, scrollY.toString());
  };

  // Restaura a posição do scroll quando o componente é montado
  const restoreScrollPosition = () => {
    const savedPosition = sessionStorage.getItem(`scroll-${key}`);
    if (savedPosition) {
      // Aguarda um pequeno delay para garantir que o conteúdo foi renderizado
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition, 10));
        // Remove a posição salva após restaurar
        sessionStorage.removeItem(`scroll-${key}`);
      }, 100);
    }
  };

  // Salva a posição quando navega para outra página
  const handleBeforeUnload = () => {
    saveScrollPosition();
  };

  useEffect(() => {
    // Restaura posição quando o componente monta
    restoreScrollPosition();

    // Salva posição antes de navegar
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [key]);

  return { saveScrollPosition };
};