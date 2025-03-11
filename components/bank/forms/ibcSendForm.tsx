import { useChain } from '@cosmos-kit/react';
import { Widget } from '@skip-go/widget';
import { useRef } from 'react';
import { ShadowScopeConfigProvider } from 'react-shadow-scope';

import env from '@/config/env';
import { useTheme } from '@/contexts';
import { getIbcDenom } from '@/utils/ibc';

function IbcSendForm({ token }: { token: string }) {
  const { theme } = useTheme();
  const { address } = useChain(env.chain);
  const ibcDenom = getIbcDenom(env.chainId, token);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine if dark mode is active
  const isDark = theme === 'dark';

  const themeColors = {
    brandColor: '#a087ff',
    primary: {
      background: {
        normal: isDark ? '#302E41' : '#FCFCFF',
      },
      text: {
        normal: isDark ? '#FFFFFF' : '#161616',
        lowContrast: isDark ? '#f0f0ff' : '#1d192d',
        ultraLowContrast: isDark ? '#e0e0ff' : '#f0f0ff',
      },
      ghostButtonHover: '#b19aff',
    },
    secondary: {
      background: {
        normal: '#a087ff',
        transparent: 'transparent',
        hover: isDark ? '#a087ff' : '#a087ff',
      },
    },
    success: {
      text: '#4caf50',
    },
    warning: {
      background: '#ffb300',
      text: '#161616',
    },
    error: {
      background: '#e53935',
      text: '#ffffff',
    },
  };

  return (
    <div ref={containerRef} className="w-[100%] max-w-[500px] px-2 box-border relative">
      <ShadowScopeConfigProvider config={{ dsd: 'off' }}>
        <Widget
          filter={{
            source: {
              [env.chainId]: undefined,
              [env.osmosisChainId]: undefined,
              [env.axelarChainId]: undefined,
            },
            destination: {
              [env.chainId]: undefined,
              [env.osmosisChainId]: undefined,
              [env.axelarChainId]: undefined,
            },
          }}
          defaultRoute={{
            srcAssetDenom: token,
            srcChainId: env.chainId,
            destChainId: env.osmosisChainId,
            destAssetDenom: ibcDenom,
          }}
          brandColor={'#a087ff'}
          onlyTestnet={true}
          connectedAddresses={{
            [env.chainId]: address,
          }}
          theme={themeColors}
        />
      </ShadowScopeConfigProvider>
    </div>
  );
}

export default IbcSendForm;
