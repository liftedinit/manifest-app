import React, { useRef, useState, useEffect } from "react";

const ScrollableFade: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowFade(
        scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight,
      );
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  return (
    <div className="relative max-h-72">
      <div
        ref={scrollRef}
        className="overflow-y-auto max-h-72 pr-4"
        onScroll={checkScroll}
      >
        {children}
      </div>
      {showFade && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-base-100 to-transparent pointer-events-none"></div>
      )}
    </div>
  );
};

export default ScrollableFade;
