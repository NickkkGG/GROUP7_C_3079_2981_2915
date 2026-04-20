import type { Metadata } from 'next';
import { inter } from '@/app/ui/fonts';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from '@/context/AuthContext';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'ALTUS',
  description: 'Above & Beyond Delivery',
  icons: {
    icon: '/images/altus with white BG.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
          {/* Notifikasi Sistem */}
          <ToastContainer position="top-center" autoClose={3000} theme="light" />
        </AuthProvider>
      </body>
    </html>
  );
}