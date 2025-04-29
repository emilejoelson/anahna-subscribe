'use client';

// Core
import { ApolloProvider } from '@apollo/client';

// Prime React
import { PrimeReactProvider } from 'primereact/api';

// Providers
import { LayoutProvider } from '@/lib/context/global/layout.context';
import { SidebarProvider } from '@/lib/context/global/sidebar.context';
import { UserProvider } from '@/lib/context/global/user-context';

// Context
import { ConfigurationProvider } from '@/lib/context/global/configuration.context';
import { ToastProvider } from '@/lib/context/global/toast.context';

// Configuration
import { FontawesomeConfig } from '@/lib/config';

// Styles
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import './global.css';

// Apollo
import { useSetupApollo } from '@/lib/hooks/useSetApollo';

import Script from 'next/script';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Apollo
  const client = useSetupApollo();

  // Constants
  const value = {
    ripple: true,
  };

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <FontawesomeConfig />
        <Script
          src="https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.8.0-min.js.gz"
          strategy="beforeInteractive"
        />
        <Script id="amplitude-init" strategy="beforeInteractive">
          {`
      window.amplitude.add(window.sessionReplay.plugin({sampleRate: 1}));
      window.amplitude.init('c3172763ba1e7748d7b284239a85f5fa', {
        autocapture: { elementInteractions: true }
      });
    `}
        </Script>
      </head>
      <body className={'flex flex-col flex-wrap'}>
        <PrimeReactProvider value={value}>
          <ApolloProvider client={client}>
            <ConfigurationProvider>
              <LayoutProvider>
                <UserProvider>
                  <SidebarProvider>
                    <ToastProvider>{children}</ToastProvider>
                  </SidebarProvider>
                </UserProvider>
              </LayoutProvider>
            </ConfigurationProvider>
          </ApolloProvider>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
