'use client'

import { useState, useEffect } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const mobile = width <= 640;
      const tablet = width > 640 && width <= 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      setScreenSize(mobile ? 'mobile' : tablet ? 'tablet' : 'desktop');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    screenSize
  };
};

export const useSwipe = () => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    return {
      isLeftSwipe,
      isRightSwipe,
      distance
    };
  };

  return {
    onTouchStart,
    onTouchMove, 
    onTouchEnd
  };
};

export const useTouchFriendly = () => {
  const { isMobile } = useMobile();
  
  const touchProps = {
    whileTap: isMobile ? { scale: 0.98 } : { scale: 0.95 },
    whileHover: isMobile ? {} : { scale: 1.02, y: -2 },
    transition: { duration: 0.15 }
  };

  return touchProps;
};