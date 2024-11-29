import { useRef } from 'react';

const useSmoothScroll = (offset = 0) => {
  const scrollToRef = (ref) => {
    if (ref.current) {
      const elementPosition = ref.current.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return scrollToRef;
};

export default useSmoothScroll;