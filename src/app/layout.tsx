import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { SiteNav, SiteFooter } from '@/components/SiteNav';

export const metadata: Metadata = {
  title: 'Atech — Build custom electronics with AI',
  description:
    'Modular plug-and-play hardware modules, 14-port ESP32-S3 motherboard, and AI firmware Studio. Prompt to Product.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" data-accent="aurora" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50">
        <AppProvider>
          <SiteNav />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AppProvider>
      </body>
    </html>
  );
}
