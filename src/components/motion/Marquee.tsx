import React from 'react';
import { cn } from '../../lib/utils';

interface MarqueeProps {
  items: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  repeat?: number;
}

export default function Marquee({ items, className, itemClassName, repeat = 4 }: MarqueeProps) {
  const row = (keyPrefix: string) => (
    <div className="flex items-center shrink-0" aria-hidden="true">
      {Array.from({ length: repeat }).flatMap((_, i) =>
        items.map((item, j) => (
          <span key={`${keyPrefix}-${i}-${j}`} className={cn('flex items-center', itemClassName)}>
            {item}
          </span>
        )),
      )}
    </div>
  );

  return (
    <div className={cn('relative overflow-hidden select-none', className)}>
      <div className="marquee-track">
        {row('a')}
        {row('b')}
      </div>
    </div>
  );
}
