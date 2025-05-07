import React from "react";
import { cn } from "@/lib/utils";
import { Leaf, Droplets, Wind, Sun } from "lucide-react";

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
  text = "Carregando...",
  className 
}: EcoLoadingProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const containerClasses = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4"
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };
  
  const renderIcon = () => {
    const iconClass = cn(
      sizeClasses[size],
      "text-primary animate-eco-pulse"
    );
    
    switch (theme) {
      case "leaf":
        return <Leaf className={iconClass} />;
      case "water":
        return <Droplets className={iconClass} />;
      case "wind":
        return <Wind className={iconClass} />;
      case "sun":
        return <Sun className={iconClass} />;
      default:
        return <Leaf className={iconClass} />;
    }
  };
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center", 
      containerClasses[size],
      className
    )}>
      <div className="animate-eco-float">
        {renderIcon()}
      </div>
      {text && (
        <p className={cn(
          "text-muted-foreground animate-eco-fade-in", 
          textClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * EcoLoadingOverlay - Um overlay de carregamento com fundo translúcido
 */
export function EcoLoadingOverlay({
  theme = "leaf",
  size = "md",
  text = "Carregando...",
  className
}: EcoLoadingProps) {
  return (
    <div className={cn(
      "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50",
      className
    )}>
      <div className="bg-background shadow-lg rounded-lg p-6 border flex flex-col items-center justify-center">
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
  text = "Carregando...",
  className
}: EcoLoadingProps) {
  return (
    <div className={cn(
      "w-full p-6 bg-background/50 rounded-lg border border-muted flex items-center justify-center",
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
  text = "Carregando dados...",
  className
}: EcoLoadingProps) {
  return (
    <div className={cn(
      "min-h-[50vh] w-full flex flex-col items-center justify-center",
      className
    )}>
      <EcoLoading theme={theme} size={size} text={text} />
    </div>
  );
}