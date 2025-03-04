import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface AdvancedModeContextType {
  isAdvancedMode: boolean;
  toggleAdvancedMode: () => void;
}

const AdvancedModeContext = createContext<AdvancedModeContextType | undefined>(undefined);

export const useAdvancedMode = () => {
  const context = useContext(AdvancedModeContext);
  if (!context) {
    throw new Error('useAdvancedMode must be used within an AdvancedModeProvider');
  }
  return context;
};

interface AdvancedModeProviderProps {
  children: ReactNode;
}

export const AdvancedModeProvider: React.FC<AdvancedModeProviderProps> = ({ children }) => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('isAdvancedMode');
      return saved !== null ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('isAdvancedMode', JSON.stringify(isAdvancedMode));
  }, [isAdvancedMode]);

  const toggleAdvancedMode = () => {
    setIsAdvancedMode((prev: any) => !prev);
  };

  return (
    <AdvancedModeContext.Provider value={{ isAdvancedMode, toggleAdvancedMode }}>
      {children}
    </AdvancedModeContext.Provider>
  );
};
