import { useEffect, useState } from 'react';

interface LoaderProps {
  progress: number;
  loaded: boolean;
  onEnter: () => void;
}

export const Loader = ({ progress, loaded, onEnter }: LoaderProps) => {
  const [showEnterButton, setShowEnterButton] = useState(false);

  useEffect(() => {
    if (loaded) {
      // Add a small delay before showing the enter button
      const timer = setTimeout(() => setShowEnterButton(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  return (
    <div className="flex flex-col items-center">
      <progress className="progress progress-primary w-56" value={progress} max="100" />
      <div className="mt-2 text-sm text-gray-500">Loading... {Math.round(progress)}%</div>
      {showEnterButton && (
        <button
          onClick={onEnter}
          className="mt-8 px-8 py-3 bg-primary text-white rounded-md opacity-0 animate-fade-in hover:bg-primary-dark transition-colors duration-300"
        >
          Enter
        </button>
      )}
    </div>
  );
};
