import React from "react";
import { cn } from "@/lib/utils";
import { EcoSpinner } from "./eco-spinner";

type EcoTheme = "leaf" | "water" | "wind" | "sun";

interface EcoLoadingProps {
  theme?: EcoTheme;
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

/**
 * EcoLoading - Um componente de carregamento com temas eco-friendly
 */
export function EcoLoading({ 
  theme = "leaf",
  size = "md",
  text,
  className
}: EcoLoadingProps) {
  // Mapear tamanhos para classes
  const sizeClasses = {
    sm: "text-sm gap-2",
    md: "text-base gap-3",
    lg: "text-lg gap-4",
  };

  // Mapear temas para cores
  const themeColors = {
    leaf: "text-primary",
    water: "text-blue-500",
    wind: "text-cyan-500",
    sun: "text-amber-500",
  };

  return (
    <div className={cn(
      "flex items-center justify-center", 
      sizeClasses[size],
      themeColors[theme],
      className
    )}>
      <EcoSpinner size={size} className={themeColors[theme]} />
      {text && <span className="font-medium animate-eco-pulse">{text}</span>}
    </div>
  );
}

/**
 * EcoLoadingOverlay - Um overlay de carregamento com fundo translúcido
 */
export function EcoLoadingOverlay({
  theme = "leaf",
  size = "md",
  text,
  className
}: EcoLoadingProps) {
  return (
    <div className={cn(
      "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <div className="bg-background/50 backdrop-blur-md p-8 rounded-lg shadow-lg animate-eco-grow">
        <EcoLoading theme={theme} size={size} text={text} />
      </div>
    </div>
  );
}

/**
 * EcoLoadingCard - Um card de carregamento com fundo e borda
 */
export function EcoLoadingCard({
  theme = "leaf",
  size = "md",
  text,
  className
}: EcoLoadingProps) {
  return (
    <div className={cn(
      "bg-background/50 border rounded-lg p-6 shadow-sm flex flex-col items-center justify-center min-h-[200px]",
      className
    )}>
      <EcoLoading theme={theme} size={size} text={text} />
    </div>
  );
}

/**
 * EcoLoadingPage - Uma página de carregamento para quando toda a página estiver carregando
 */
export function EcoLoadingPage({
  theme = "leaf",
  size = "lg",
  text = "Carregando conteúdo...",
  className
}: EcoLoadingProps) {
  return (
    <div className={cn(
      "min-h-[50vh] flex flex-col items-center justify-center p-8",
      className
    )}>
      <div className="animate-eco-float mb-6">
        <svg 
          width="60" 
          height="60" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
        >
          <path 
            d="M7,21 C7,21 3,17 3,12 C3,7 7,3 12,3 C17,3 21,7 21,12 C21,17 17,21 17,21" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d="M12,12 C12,12 10,6 12,3" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d="M12,12 C12,12 18,10 21,12" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d="M12,12 C12,12 14,18 12,21" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d="M12,12 C12,12 6,14 3,12" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </svg>
      </div>
      <EcoLoading theme={theme} size={size} text={text} />
    </div>
  );
}