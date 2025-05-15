import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "./use-localstorage";
import { useAuth } from "./use-auth";

interface OnboardingContextType {
  isOnboardingVisible: boolean;
  showOnboarding: () => void;
  hideOnboarding: () => void;
  completeOnboarding: () => void;
  hasCompletedOnboarding: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { user } = useAuth();
  const userId = user?.id;
  
  // Usar um valor baseado no usuário para armazenar o status do onboarding
  const storageKey = userId ? `onboarding-completed-${userId}` : null;
  
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage<boolean>(
    storageKey || "onboarding-temp",
    false
  );
  
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);
  
  // Verificar se o usuário escolheu nunca mais mostrar o onboarding
  const [neverShowOnboarding, setNeverShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem("neverShowOnboarding") === "true";
  });
  
  // Mostrar o onboarding automaticamente para usuários que não o completaram e não optaram por nunca mais vê-lo
  useEffect(() => {
    // Verificar novamente o localStorage a cada render, caso tenha sido atualizado
    const neverShow = localStorage.getItem("neverShowOnboarding") === "true";
    setNeverShowOnboarding(neverShow);
    
    if (userId && !hasCompletedOnboarding && !neverShow) {
      // Pequeno delay para garantir que a interface já esteja carregada
      const timer = setTimeout(() => {
        setIsOnboardingVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [userId, hasCompletedOnboarding]);
  
  const showOnboarding = () => setIsOnboardingVisible(true);
  const hideOnboarding = () => setIsOnboardingVisible(false);
  
  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    setIsOnboardingVisible(false);
  };
  
  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingVisible,
        showOnboarding,
        hideOnboarding,
        completeOnboarding,
        hasCompletedOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}