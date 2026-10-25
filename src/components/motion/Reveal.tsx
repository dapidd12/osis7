import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/utils';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  as?: React.ElementType;
}

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
  as: Tag = 'div',
}: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? {} : { opacity: 1, y: 0 }}
      viewport={{ once, margin: '-10% 0px' }}
      transition={{ 
        duration: 0.65, 
        delay, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className={cn(className)}
    >
      <Tag>{children}</Tag>
    </motion.div>
  );
}
