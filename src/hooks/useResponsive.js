// 📱 useResponsive Hook - Responsive design utilities
// Following Single Responsibility Principle

import { useState, useEffect } from 'react';

// Tailwind CSS breakpoints
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [breakpoint, setBreakpoint] = useState('xs');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({ width, height });

      // Determine current breakpoint
      let currentBreakpoint = 'xs';
      if (width >= breakpoints['2xl']) {
        currentBreakpoint = '2xl';
      } else if (width >= breakpoints.xl) {
        currentBreakpoint = 'xl';
      } else if (width >= breakpoints.lg) {
        currentBreakpoint = 'lg';
      } else if (width >= breakpoints.md) {
        currentBreakpoint = 'md';
      } else if (width >= breakpoints.sm) {
        currentBreakpoint = 'sm';
      }

      setBreakpoint(currentBreakpoint);
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper functions
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
  
  const isBreakpoint = (bp) => breakpoint === bp;
  const isMinBreakpoint = (bp) => windowSize.width >= breakpoints[bp];
  const isMaxBreakpoint = (bp) => windowSize.width < breakpoints[bp];

  return {
    windowSize,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isBreakpoint,
    isMinBreakpoint,
    isMaxBreakpoint,
    breakpoints,
  };
};

export default useResponsive;