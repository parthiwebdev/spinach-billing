import { Instrument_Sans } from 'next/font/google';
import { Providers } from './providers';
import { AppThemeProvider } from './theme-provider';
import ClientLayout from './client-layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../index.css';
import '../styles/fonts.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Load Instrument Sans with Next.js font optimization
const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

export const metadata = {
  title: 'Vegetables Billing',
  description: 'Vegetables Billing Application',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo192.png',
  },
};

export default function RootLayout({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  return (
    <html lang="en">
      <head>
        {/* Load Clash Display from external source */}
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@200,500,600,300&display=swap" />
      </head>
      <body className={instrumentSans.variable}>
        <Providers>
          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              <AppThemeProvider>
                <ClientLayout>
                  {children}
                </ClientLayout>
              </AppThemeProvider>
            </GoogleOAuthProvider>
          ) : (
            <AppThemeProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
            </AppThemeProvider>
          )}
        </Providers>
      </body>
    </html>
  );
}
