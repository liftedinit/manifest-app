import '../styles/globals.css';
import '@interchain-ui/react/styles';
import '@fontsource/manrope';

import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import SideNav from '../components/react/sideNav';
import MobileNav from '@/components/react/mobileNav';

import { SkipProvider } from '@/contexts/skipGoContext';
import { ManifestAppProviders } from '@/contexts/manifestAppProviders';
import { useLocalStorage } from '@/hooks';

type ManifestAppProps = AppProps & {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
};

// TODO: remove asset list injections when chain registry is updated

function ManifestApp({ Component, pageProps }: ManifestAppProps) {
  const [drawer, setDrawer] = useLocalStorage('isDrawerVisible', true);

  return (
    <ManifestAppProviders>
      <div className="flex min-h-screen bg-background-color relative">
        <div className="hidden md:block">
          <SideNav isDrawerVisible={drawer} setDrawerVisible={setDrawer} />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ease-in-out 
                      ml-0 lg:ml-36 ${drawer ? 'lg:ml-[17rem]' : ''} relative z-0`}
        >
          <div className="lg:hidden pt-12">
            <MobileNav />
          </div>
          <main className="p-6 relative z-10">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </ManifestAppProviders>
  );
}

export default ManifestApp;
