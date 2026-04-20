import { Inter, Lusitana } from 'next/font/google';

// Font Utama: Bersih dan mudah dibaca
export const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', 
});

// Font Sekunder: Formal dan tegas untuk Heading/Logo ALTUS
export const lusitana = Lusitana({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});