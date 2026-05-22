'use client';

import { useEffect, useRef, useState, type ReactNode, type ElementType } from 'react';
import { cn } from '@/lib/utils';

/**
 * RevealOnScroll — wraps any child with a fade-in-on-enter effect.
 * Uses IntersectionObserver (cheap, no scroll listeners). Observes
 * once: after the first reveal, the observer is disconnected so we
 * don't burn CPU watching nodes that have already animated.
 *
 * Respects prefers-reduced-motion (CSS-level — see globals.css).
 */
export function RevealOnScroll({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // If reduced motion is preferred, just show immediately
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => setVisible(true), delay);
            } else {
              setVisible(true);
            }
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1, rootMargin: '40px' }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [delay]);

  const Element = Tag as ElementType;
  return (
    <Element
      ref={ref}
      className={cn('fade-in', visible && 'is-visible', className)}
    >
      {children}
    </Element>
  );
}