import React, { createContext, useContext, useMemo } from 'react';
import { SkipClient } from '@skip-go/client';

// Create the context
interface SkipContextType {
  createClient: (options: any) => SkipClient;
}

const SkipContext = createContext<SkipContextType | undefined>(undefined);

// Create the provider component
interface SkipProviderProps {
  children: React.ReactNode;
}

export function SkipProvider({ children }: SkipProviderProps) {
  const createClient = useMemo(() => {
    return (options: any) => new SkipClient(options);
  }, []);

  return <SkipContext.Provider value={{ createClient }}>{children}</SkipContext.Provider>;
}

// Update the hook to accept getCosmosSigner
interface UseSkipClientOptions {
  getCosmosSigner: () => Promise<any>;
}

export function useSkipClient(options: UseSkipClientOptions) {
  const context = useContext(SkipContext);
  if (context === undefined) {
    throw new Error('useSkipClient must be used within a SkipProvider');
  }

  // Create a new client with the provided options
  const skipClient = useMemo(() => {
    return context.createClient({
      getCosmosSigner: options.getCosmosSigner,
    });
  }, [context.createClient, options.getCosmosSigner]);

  return skipClient;
}
