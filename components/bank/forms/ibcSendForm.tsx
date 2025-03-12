import { useChain } from '@cosmos-kit/react';
import { Widget } from '@skip-go/widget';
import { assets as axelarAssets } from 'chain-registry/testnet/axelartestnet';
import { assets as osmosisAssets } from 'chain-registry/testnet/osmosistestnet';
import { useEffect, useRef } from 'react';
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

  // Add effect to handle overlay click events
  useEffect(() => {
    // Function to handle clicks on the document
    const handleDocumentClick = (event: MouseEvent) => {
      // Check if the click target is a div with the class that matches the modal backdrop
      const target = event.target as HTMLElement;

      // Get the path of elements from the click target up to the document
      const path = event.composedPath ? event.composedPath() : [];

      // Check if the click is on a backdrop-like element
      const isBackdropClick =
        // Direct class check on the target
        (target.tagName === 'DIV' &&
          (target.className.includes('sc-iuUfFv') || target.className.includes('sc-dprtRQ'))) ||
        // Check parent elements in the path for backdrop classes
        path.some(
          el =>
            el instanceof HTMLElement &&
            el.tagName === 'DIV' &&
            (el.className.includes('sc-iuUfFv') || el.className.includes('sc-dprtRQ'))
        );

      if (isBackdropClick) {
        // Find all open dialogs in shadow DOM using the same selector strategy as in sendModal.tsx
        const allInputs = [...document.querySelectorAll('react-shadow-scope')].map(s =>
          s.shadowRoot?.querySelector('div[open]')
        );

        const isSkipGoDialogOpened = allInputs.filter(Boolean).length > 0;

        if (isSkipGoDialogOpened) {
          // Get all the buttons and other interactive elements inside the modal
          const modalContent = document.querySelector('wcm-modal');

          // Check if the click was directly on the backdrop and not on any content
          const isClickOnContent =
            (modalContent && modalContent.contains(event.target as Node)) ||
            path.some(
              el =>
                el instanceof HTMLElement &&
                (el.classList.contains('rc-virtual-list-holder-inner') ||
                  el.tagName === 'BUTTON' ||
                  el.tagName === 'INPUT')
            );

          if (!isClickOnContent) {
            // Create and dispatch an escape key event to close the modal
            const escEvent = new KeyboardEvent('keydown', {
              key: 'Escape',
              code: 'Escape',
              keyCode: 27,
              which: 27,
              bubbles: true,
              cancelable: true,
            });
            document.dispatchEvent(escEvent);
          }
        }
      }
    };

    // Add the click event listener to the document
    document.addEventListener('click', handleDocumentClick, true);

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, []);

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

  // filter osmosis tokens that are on manifesttestnet
  const manifestAssetsOnOsmosis = osmosisAssets.assets
    .filter(asset =>
      asset?.traces?.some(
        trace => trace.type === 'ibc' && trace.counterparty.chain_name === 'manifesttestnet'
      )
    )
    .map(asset => asset.base);

  // filter axelar tokens that are on manifesttestnet
  const manifestAssetsOnAxelar = axelarAssets.assets
    .filter(asset =>
      asset?.traces?.some(
        trace => trace.type === 'ibc' && trace.counterparty.chain_name === 'manifesttestnet'
      )
    )
    .map(asset => asset.base);

  return (
    <div
      aria-label="ibc-send-form"
      ref={containerRef}
      className="w-[100%] max-w-[500px] px-2 box-border relative"
    >
      <ShadowScopeConfigProvider config={{ dsd: 'off' }}>
        <Widget
          filter={{
            source: {
              [env.chainId]: undefined,
              [env.osmosisChainId]: [...manifestAssetsOnOsmosis, 'uosmo'],
              [env.axelarChainId]: [...manifestAssetsOnAxelar, 'uaxl'],
            },
            destination: {
              [env.chainId]: undefined,
              [env.osmosisChainId]: [...manifestAssetsOnOsmosis, 'uosmo'],
              [env.axelarChainId]: [...manifestAssetsOnAxelar, 'uaxl'],
            },
          }}
          defaultRoute={{
            srcAssetDenom: token,
            srcChainId: env.chainId,
            destChainId: env.osmosisChainId,
            destAssetDenom: ibcDenom,
            amountIn: 1,
            amountOut: 1,
          }}
          routeConfig={{
            allowUnsafe: true,
            allowSwaps: true,
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
