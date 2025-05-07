import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LeafProps {
  style: React.CSSProperties;
  id: number;
}

const Leaf = ({ style, id }: LeafProps) => (
  <div 
    className="animate-leaf-fall absolute pointer-events-none" 
    style={style}
  >
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M6.5 21C5 19.5 5 18.5 5 17.5C5 16.5 5.5 16 6 15.5C6.5 15 7 14 7 13C7 12 6.5 11 6 10.5C5.5 10 5 9.5 5 8.5C5 7.5 5.5 7 6 6.5C6.5 6 7 5 7 4C7 3 6.5 2 5.5 1.5" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M12.5 21C12.5 16 14.5 14 17.5 11C20.5 8 18 3 18 3" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

interface EcoBackgroundProps {
  variant?: 'leaf' | 'forest';
  density?: 'light' | 'medium' | 'heavy';
  className?: string;
  color?: string;
  children?: React.ReactNode;
}

export function EcoBackground({
  variant = 'leaf',
  density = 'light',
  className,
  color = 'text-primary/20',
  children
}: EcoBackgroundProps) {
  const [leaves, setLeaves] = useState<LeafProps[]>([]);
  
  useEffect(() => {
    // Definir quantidade de elementos com base na densidade
    const itemCount = density === 'light' ? 15 : density === 'medium' ? 25 : 40;
    
    // Criar array de elementos
    const items: LeafProps[] = [];
    for (let i = 0; i < itemCount; i++) {
      const style: React.CSSProperties = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: Math.random() * 0.5 + 0.1,
        transform: `scale(${Math.random() * 0.5 + 0.5}) rotate(${Math.random() * 360}deg)`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 10 + 10}s`,
      };
      
      items.push({ style, id: i });
    }
    
    setLeaves(items);
  }, [density]);
  
  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      <div className={cn('absolute inset-0 pointer-events-none', color)}>
        {variant === 'leaf' && leaves.map(leaf => (
          <Leaf key={leaf.id} {...leaf} />
        ))}
      </div>
      {children}
    </div>
  );
}

export function EcoWaveBackground({
  className,
  children,
  color = 'from-primary/20 to-accent/10'
}: {
  className?: string;
  children?: React.ReactNode;
  color?: string;
}) {
  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      <div className="absolute inset-0 -z-10">
        <div className={cn(`absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t ${color} animate-eco-fade-in opacity-40`)} />
        
        <svg 
          className="absolute bottom-0 left-0 right-0 w-full animate-eco-wave"
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M0,64L48,69.3C96,75,192,85,288,90.7C384,96,480,96,576,80C672,64,768,32,864,32C960,32,1056,64,1152,74.7C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
            fill="currentColor" 
            className="text-primary/20"
          />
          <path 
            d="M0,42L48,53.3C96,64,192,85,288,85.3C384,85,480,64,576,64C672,64,768,85,864,80C960,75,1056,43,1152,37.3C1248,32,1344,53,1392,64L1440,74.7L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
            fill="currentColor" 
            className="text-accent/10"
          />
        </svg>
      </div>
      {children}
    </div>
  );
}