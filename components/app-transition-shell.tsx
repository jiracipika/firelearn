'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSwipeNav } from '@/hooks/use-swipe-nav';

const SWIPE_ROUTES = ["/", "/dashboard", "/courses", "/flashcards", "/profile"];

export default function AppTransitionShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dragOffset, dragOpacity, canSwipe } = useSwipeNav({
    routes: SWIPE_ROUTES,
    enabled: SWIPE_ROUTES.some((r) => pathname.startsWith(r)),
  });

  // Reduced-motion read is deferred to a microtask so the effect never calls
  // setState synchronously (react-hooks/set-state-in-effect).
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setReducedMotion(mq.matches);
    });
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => {
      cancelled = true;
      mq.removeEventListener('change', handler);
    };
  }, []);

  const currentIndex = SWIPE_ROUTES.findIndex(
    (r) => pathname === r || (r !== SWIPE_ROUTES[0] && pathname.startsWith(`${r}/`)),
  );
  const [prevIndex, setPrevIndex] = useState(currentIndex);

  useEffect(() => {
    if (currentIndex === prevIndex) return;
    const timer = window.setTimeout(() => setPrevIndex(currentIndex), 0);
    return () => window.clearTimeout(timer);
  }, [currentIndex, prevIndex]);

  const direction = currentIndex >= 0 && prevIndex >= 0
    ? currentIndex > prevIndex ? 1 : currentIndex < prevIndex ? -1 : 0 : 0;

  const transitionStyle: React.CSSProperties = {
    transform: canSwipe && dragOffset !== 0 ? `translateX(${dragOffset}px)` : undefined,
    opacity: canSwipe && dragOpacity < 1 ? dragOpacity : undefined,
    transition: dragOffset !== 0 ? 'none' : 'opacity 0.38s cubic-bezier(0.22,1,0.36,1)',
  };

  const enterClass = !reducedMotion && currentIndex >= 0 && direction !== 0
    ? direction > 0 ? 'firelearn-enter-right' : 'firelearn-enter-left' : '';

  return (
    <div key={pathname} className={enterClass} style={transitionStyle}>
      {children}
    </div>
  );
}
