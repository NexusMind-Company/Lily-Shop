import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BackToTop = ({ containerRef }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollY = containerRef?.current
        ? containerRef.current.scrollTop
        : window.pageYOffset;

      if (scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const target = containerRef?.current || window;
    target.addEventListener("scroll", toggleVisibility);
    return () => target.removeEventListener("scroll", toggleVisibility);
  }, [containerRef]);

  const scrollToTop = () => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-lily text-white shadow-lg shadow-lily/20 transition-transform hover:scale-110 active:scale-95"
          aria-label="Back to top"
        >
          <ChevronUp size={24} strokeWidth={3} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
