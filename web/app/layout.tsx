import type { Metadata } from 'next';
import { Instrument_Sans, Fraunces, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';
import { siteUrl } from '@/lib/site-url';

const instrumentSans = Instrument_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-sans', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin', 'latin-ext'], variable: '--font-display', display: 'swap', axes: ['opsz'] });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

const TITLE = 'Atlas de Anatomía Humana';
const SHARE_DESCRIPTION = 'Explora 12 sistemas del cuerpo humano en un modelo 3D interactivo con fichas educativas.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: TITLE,
  description: 'Explora 12 sistemas del cuerpo humano en un modelo 3D interactivo con fichas educativas bilingües. Representación educativa simplificada.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  openGraph: {
    title: TITLE,
    description: SHARE_DESCRIPTION,
    siteName: TITLE,
    locale: 'es',
    type: 'website',
    url: '/',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: SHARE_DESCRIPTION,
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${instrumentSans.variable} ${fraunces.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased min-h-dvh">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
          <ChunkLoadErrorHandler />
        </ThemeProvider>
      </body>
    </html>
  );
}
