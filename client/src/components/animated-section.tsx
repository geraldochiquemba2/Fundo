import { ReactNode } from 'react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'scale-up' | 'bounce';
  delay?: number;
}

const AnimatedSection = ({ 
  children, 
  className = '', 
  animation = 'fade-up',
  delay = 0
}: AnimatedSectionProps) => {
  const { ref, isVisible } = useScrollAnimation(0.1);

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-700 ease-out';
    
    if (!isVisible) {
      switch (animation) {
        case 'fade-up':
          return `${baseClasses} opacity-0 translate-y-10`;
        case 'fade-in':
          return `${baseClasses} opacity-0`;
        case 'fade-left':
          return `${baseClasses} opacity-0 -translate-x-10`;
        case 'fade-right':
          return `${baseClasses} opacity-0 translate-x-10`;
        case 'scale-up':
          return `${baseClasses} opacity-0 scale-95`;
        case 'bounce':
          return `${baseClasses} opacity-0 translate-y-10 scale-95`;
        default:
          return `${baseClasses} opacity-0 translate-y-10`;
      }
    }
    
    return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100`;
  };

  return (
    <div
      ref={ref}
      className={`${getAnimationClasses()} ${className}`}
      style={{ 
        transitionDelay: `${delay}ms`,
        animationDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;