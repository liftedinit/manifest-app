// import { OfflineAminoSigner } from '@cosmjs/amino';
// import { OfflineDirectSigner } from '@cosmjs/proto-signing';
// import { SkipClient, SkipClientOptions } from '@skip-go/client';
// import React, { createContext, useContext, useMemo } from 'react';
//
// // Create the context
// interface SkipContextType {
//   createClient: (options: SkipClientOptions) => SkipClient;
// }
//
// const SkipContext = createContext<SkipContextType | undefined>(undefined);
//
// // Create the provider component
// interface SkipProviderProps {
//   children: React.ReactNode;
// }
//
// export function SkipProvider({ children }: SkipProviderProps) {
//   const createClient = useMemo(() => {
//     return (options: SkipClientOptions) => new SkipClient(options);
//   }, []);
//
//   return <SkipContext.Provider value={{ createClient }}>{children}</SkipContext.Provider>;
// }
//
// // Update the hook to accept getCosmosSigner
// interface UseSkipClientOptions {
//   getCosmosSigner: () => Promise<
//     OfflineAminoSigner | OfflineDirectSigner | (OfflineAminoSigner & OfflineDirectSigner)
//   >;
// }
//
// export function useSkipClient(options: UseSkipClientOptions) {
//   const context = useContext(SkipContext);
//   if (context === undefined) {
//     throw new Error('useSkipClient must be used within a SkipProvider');
//   }
//
//   // Create a new client with the provided options
//   const skipClient = useMemo(() => {
//     return context.createClient({
//       getCosmosSigner: options.getCosmosSigner,
//       endpointOptions: {
//         endpoints: {
//           'manifest-ledger-testnet': {
//             rpc: 'https://nodes.liftedinit.tech/manifest/testnet/rpc/',
//             rest: 'https://nodes.liftedinit.tech/manifest/testnet/api/',
//           },
//         },
//         getRpcEndpointForChain: async (chainID: string) => {
//           // You can add logic here to return different RPC endpoints based on chainID
//           if (chainID === 'manifest-ledger-testnet') {
//             return 'https://nodes.liftedinit.tech/manifest/testnet/rpc/';
//           }
//           throw new Error(`No RPC endpoint configured for chain ${chainID}`);
//         },
//         getRestEndpointForChain: async (chainID: string) => {
//           // You can add logic here to return different REST endpoints based on chainID
//           if (chainID === 'manifest-ledger-testnet') {
//             return 'https://nodes.liftedinit.tech/manifest/testnet/api/';
//           }
//           throw new Error(`No REST endpoint configured for chain ${chainID}`);
//         },
//       },
//     });
//   }, [context, options.getCosmosSigner]);
//
//   return skipClient;
// }
