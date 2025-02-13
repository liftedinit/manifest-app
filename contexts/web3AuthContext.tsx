import { wallets as cosmosWallets } from 'cosmos-kit';
import { wallets as cosmosExtensionWallets } from '@cosmos-kit/cosmos-extension-metamask';
import { makeWeb3AuthWallets, SignData, Web3AuthWallet } from '@cosmos-kit/web3auth';
import { WEB3AUTH_NETWORK_TYPE } from '@web3auth/auth';
import { createContext, ReactNode, useMemo, useState } from 'react';
import env from '@/config/env';
import { MainWalletBase } from '@cosmos-kit/core';

export interface Web3AuthContextType {
  prompt?: {
    signData: SignData;
    resolve: (approved: boolean) => void;
  };
  promptId?: string;
  setPromptId: (id: string | undefined) => void;
  wallets: (MainWalletBase | Web3AuthWallet)[];
  isSigning: boolean;
  setIsSigning: (isSigning: boolean) => void;
}

export const Web3AuthContext = createContext<Web3AuthContextType>({
  prompt: undefined,
  wallets: [],
  promptId: undefined,
  setPromptId: () => {},
  isSigning: false,
  setIsSigning: () => {},
});

export const Web3AuthProvider = ({ children }: { children: ReactNode }) => {
  // web3auth helpers for cosmoskit
  const [prompt, setPrompt] = useState<
    | {
        signData: SignData;
        resolve: (approved: boolean) => void;
      }
    | undefined
  >();

  // A shared signing state for all nodes.
  const [isSigning, setIsSigning] = useState(false);

  const [promptId, setPromptId] = useState<string | undefined>();

  const web3AuthWallets = useMemo(
    () =>
      makeWeb3AuthWallets({
        loginMethods: [
          {
            provider: 'google',
            name: 'Google',
            logo: '/google',
          },
          {
            provider: 'twitter',
            name: 'Twitter',
            logo: '/x',
          },
          {
            provider: 'github',
            name: 'GitHub',
            logo: '/github',
          },
          {
            provider: 'apple',
            name: 'Apple',
            logo: '/apple',
          },
          {
            provider: 'discord',
            name: 'Discord',
            logo: '/discord',
          },
          {
            provider: 'reddit',
            name: 'Reddit',
            logo: '/reddit',
          },
          {
            provider: 'email_passwordless',
            name: 'Email',
            logo: '/email',
          },
          {
            provider: 'sms_passwordless',
            name: 'SMS',
            logo: '/sms',
          },
        ],
        mfaLevel: 'optional',
        client: {
          clientId: env.web3AuthClientId,
          web3AuthNetwork: env.web3AuthNetwork as WEB3AUTH_NETWORK_TYPE, // Safe to cast since we validate the env vars in config/env.ts
        },
        promptSign: async (_, signData) =>
          new Promise(resolve =>
            setPrompt({
              signData,
              resolve: approved => {
                setPrompt(undefined);
                resolve(approved);
              },
            })
          ),
      }),
    []
  );

  // Combine the Web3auth wallets with the other wallets
  const wallets = [
    ...web3AuthWallets,
    ...cosmosWallets.for('keplr', 'cosmostation', 'leap', 'ledger'),
    ...cosmosExtensionWallets,
  ];

  return (
    <Web3AuthContext.Provider
      value={{ prompt, wallets, promptId, setPromptId, isSigning, setIsSigning }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
};
