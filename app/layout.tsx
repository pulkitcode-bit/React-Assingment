import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ProductProvider } from '@/context/ProductContext';
import ToastContainer from '@/components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ProductAdmin Dashboard - Product Catalog Manager',
  description: 'A Next.js App Router Admin Dashboard for managing products via DummyJSON API.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} h-full dark`}>
      <body className="bg-slate-950 text-slate-100 min-h-full flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <ProductProvider>
            {children}
            <ToastContainer />
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
