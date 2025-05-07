import React from "react";
import { cn } from "@/lib/utils";

/**
 * EcoSpinner - Um spinner eco-friendly com folhas rotativas para indicar carregamento
 */
export function EcoSpinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <svg
        className="animate-spin text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M12,2 C6.48,2 2,6.48 2,12 C2,17.52 6.48,22 12,22 L12,22 C17.52,22 22,17.52 22,12 C22,6.48 17.52,2 12,2 Z M12,20 C7.59,20 4,16.41 4,12 C4,7.59 7.59,4 12,4 C16.41,4 20,7.59 20,12 C20,16.41 16.41,20 12,20 Z"
        ></path>
        <path
          className="opacity-90"
          fill="currentColor"
          d="M12,6 C10.9,6 10,6.9 10,8 C10,9.1 10.9,10 12,10 C13.1,10 14,9.1 14,8 C14,6.9 13.1,6 12,6 Z"
        ></path>
      </svg>
      
      {/* Folhas em rotação */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          className="animate-spin-slow text-accent" 
          width="70%" 
          height="70%" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
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
    </div>
  );
}

/**
 * EcoProgressBar - Uma barra de progresso eco-friendly com degradê de cores naturais
 */
export function EcoProgressBar({
  value = 0,
  className,
  showValue = false,
}: {
  value?: number;
  className?: string;
  showValue?: boolean;
}) {
  const clampedValue = Math.max(0, Math.min(100, value));
  
  return (
    <div className={cn("relative w-full overflow-hidden rounded-full bg-secondary h-2", className)}>
      <div
        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 animate-eco-grow"
        style={{ width: `${clampedValue}%` }}
      />
      {showValue && (
        <span className="text-xs text-primary font-medium absolute right-2 top-1/2 transform -translate-y-1/2">
          {clampedValue}%
        </span>
      )}
    </div>
  );
}

/**
 * EcoTransition - Um componente para transições eco-friendly
 */
export function EcoTransition({
  children,
  show,
  appear = false,
}: {
  children: React.ReactNode;
  show: boolean;
  appear?: boolean;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted && !appear) {
    return null;
  }

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        show
          ? "opacity-100 translate-y-0 animate-eco-grow"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      {children}
    </div>
  );
}