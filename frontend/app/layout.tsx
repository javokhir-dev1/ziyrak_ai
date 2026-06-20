import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'InstaBot — Boshqaruv Paneli',
  description: 'Instagram Auto Bot Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body className="bg-background text-on-surface antialiased flex h-screen overflow-hidden">
        <Sidebar />
        <main className="ml-64 flex-1 flex flex-col h-full overflow-hidden w-[calc(100%-256px)]">
          {children}
        </main>
      </body>
    </html>
  );
}
