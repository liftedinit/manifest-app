import '@fontsource/manrope';
import '@interchain-ui/react/styles';
import type { AppProps } from 'next/app';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

import MobileNav from '@/components/react/mobileNav';
import { ManifestAppProviders } from '@/contexts/manifestAppProviders';
import { useTheme } from '@/contexts/useTheme';
import { useLocalStorage } from '@/hooks';

import SideNav from '../components/react/sideNav';
import '../styles/globals.css';

// TODO: remove asset list injections when chain registry is updated

function ManifestApp({ Component, pageProps }: AppProps) {
  // Initialize PostHog on the client
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: '/ingest',
        ui_host: 'https://us.posthog.com',
        capture_pageview: 'history_change',
        autocapture: false,
        capture_exceptions: true, // enable capturing exceptions
        loaded: ph => {
          if (process.env.NODE_ENV === 'development') ph.debug();
        },
        debug: process.env.NODE_ENV === 'development',
      });
    }
  }, []);

  const [drawer, setDrawer] = useLocalStorage('isDrawerVisible', true);

  return (
    <PostHogProvider client={posthog}>
      <ManifestAppProviders>
        <AppContent
          Component={Component}
          pageProps={pageProps}
          drawer={drawer}
          setDrawer={setDrawer}
        />
      </ManifestAppProviders>
    </PostHogProvider>
  );
}

// Separate component to use hooks inside the providers
interface AppContentProps {
  Component: AppProps['Component'];
  pageProps: AppProps['pageProps'];
  drawer: boolean;
  setDrawer: (value: boolean | ((val: boolean) => boolean)) => void;
}

function AppContent({ Component, pageProps, drawer, setDrawer }: AppContentProps) {
  const { theme } = useTheme();

  // Add a class to the div based on the theme for Tailwind dark mode
  const themeClass = theme === 'dark' ? 'dark' : '';

  return (
    <div
      className={`flex min-h-screen bg-background-color relative ${themeClass}`}
      data-theme={theme}
    >
      <div className="hidden md:block">
        <SideNav isDrawerVisible={drawer} setDrawerVisible={setDrawer} />
      </div>

      <div
        className={`flex-1 transition-all duration-300 ease-in-out \
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
  );
}

export default ManifestApp;
