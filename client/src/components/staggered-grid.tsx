import { ReactNode } from 'react';
import { useStaggeredAnimation } from '@/hooks/use-scroll-animation';

interface StaggeredGridProps {
  children: ReactNode[];
  className?: string;
  itemClassName?: string;
  delay?: number;
}

const StaggeredGrid = ({ 
  children, 
  className = '', 
  itemClassName = '',
  delay = 150
}: StaggeredGridProps) => {
  const { ref, visibleItems } = useStaggeredAnimation(children.length, delay);

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`${itemClassName} transition-all duration-600 ease-out ${
            visibleItems.has(index) 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-8 scale-95'
          }`}
          style={{ 
            transitionDelay: visibleItems.has(index) ? '0ms' : `${index * delay}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default StaggeredGrid;