// Mobile touch utilities and gestures
export const mobileUtils = {
  // Touch-friendly hover states
  touchHover: 'active:scale-95 transition-transform duration-150',
  
  // Improved touch targets (minimum 44px)
  touchTarget: 'min-h-[44px] min-w-[44px]',
  
  // Mobile-optimized animations
  mobileMotion: {
    tap: { scale: 0.98 },
    hover: { scale: 1.02 },
    transition: { duration: 0.15 }
  },
  
  // Swipe detection
  detectSwipe: (startX: number, endX: number, threshold = 50) => {
    const diff = startX - endX;
    if (Math.abs(diff) > threshold) {
      return diff > 0 ? 'left' : 'right';
    }
    return null;
  },
  
  // Mobile breakpoints
  breakpoints: {
    mobile: '(max-width: 640px)',
    tablet: '(min-width: 641px) and (max-width: 1024px)',
    desktop: '(min-width: 1025px)'
  },
  
  // Touch-optimized spacing
  spacing: {
    mobile: {
      padding: 'p-4',
      margin: 'm-4',
      gap: 'gap-4'
    },
    tablet: {
      padding: 'sm:p-6',
      margin: 'sm:m-6', 
      gap: 'sm:gap-6'
    }
  }
};

// Mobile-specific component props
export const mobileProps = {
  // Touch-friendly button props
  button: {
    className: 'touch-manipulation select-none',
    style: { touchAction: 'manipulation' }
  },
  
  // Mobile-optimized input props
  input: {
    autoComplete: 'on',
    autoCapitalize: 'off',
    autoCorrect: 'off',
    spellCheck: false
  },
  
  // Smooth scrolling for mobile
  scroll: {
    style: { 
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth'
    }
  }
};