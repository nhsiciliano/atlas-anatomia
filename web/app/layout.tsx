import type { Metadata } from 'next';
import { Instrument_Sans, Fraunces, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';

const dmSans = Instrument_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-sans', display: 'swap' });
const jakarta = Fraunces({ subsets: ['latin', 'latin-ext'], variable: '--font-display', display: 'swap', axes: ['opsz'] });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Atlas de Anatomía Humana',
  description: 'Explora 12 sistemas del cuerpo humano en un modelo 3D interactivo y en láminas 2D. Representación educativa simplificada.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  openGraph: {
    title: 'Atlas de Anatomía Humana',
    description: 'Explora 12 sistemas del cuerpo humano con ilustraciones interactivas simplificadas.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${dmSans.variable} ${jakarta.variable} ${jetbrains.variable}`}>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className="font-sans antialiased min-h-dvh">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster position="bottom-center" richColors />
          <ChunkLoadErrorHandler />
        </ThemeProvider>
      </body>
    </html>
  );
}
