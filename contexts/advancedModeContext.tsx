import React, { createContext, useState, useContext, ReactNode } from "react";

interface AdvancedModeContextType {
  isAdvancedMode: boolean;
  toggleAdvancedMode: () => void;
}

const AdvancedModeContext = createContext<AdvancedModeContextType | undefined>(
  undefined
);

export const useAdvancedMode = () => {
  const context = useContext(AdvancedModeContext);
  if (!context) {
    throw new Error(
      "useAdvancedMode must be used within an AdvancedModeProvider"
    );
  }
  return context;
};

interface AdvancedModeProviderProps {
  children: ReactNode;
}

export const AdvancedModeProvider: React.FC<AdvancedModeProviderProps> = ({
  children,
}) => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const toggleAdvancedMode = () => {
    setIsAdvancedMode((prev) => !prev);
  };

  return (
    <AdvancedModeContext.Provider
      value={{ isAdvancedMode, toggleAdvancedMode }}
    >
      {children}
    </AdvancedModeContext.Provider>
  );
};
