import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Ziyrak AI — Boshqaruv Paneli',
  description: 'Instagram Auto Bot Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-surface antialiased flex h-screen overflow-hidden selection:bg-brand-100 selection:text-brand-900">
        <ThemeProvider>
          <Sidebar />
          <main className="ml-64 flex-1 flex flex-col h-full overflow-hidden w-[calc(100%-256px)]">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
