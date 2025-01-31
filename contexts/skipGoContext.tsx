import React, { createContext, useContext } from 'react';
import { SkipClient } from '@skip-go/client';

// Create the context
interface SkipContextType {
  skipClient: SkipClient;
}

const SkipContext = createContext<SkipContextType | undefined>(undefined);

// Create the provider component
interface SkipProviderProps {
  children: React.ReactNode;
}

export function SkipProvider({ children }: SkipProviderProps) {
  const skipClient = new SkipClient({});

  return <SkipContext.Provider value={{ skipClient }}>{children}</SkipContext.Provider>;
}

// Create a custom hook to use the Skip client
export function useSkipClient() {
  const context = useContext(SkipContext);
  if (context === undefined) {
    throw new Error('useSkipClient must be used within a SkipProvider');
  }
  return context.skipClient;
}
