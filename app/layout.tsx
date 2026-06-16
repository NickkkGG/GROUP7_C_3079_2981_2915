import type { Metadata } from 'next';
import { inter } from '@/app/ui/fonts';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'ALTUS',
  description: 'Above & Beyond Delivery',
  icons: {
    icon: '/images/altus with white BG.png',
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            {/* Notifikasi Sistem */}
            <ToastContainer position="top-center" autoClose={3000} theme="light" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}