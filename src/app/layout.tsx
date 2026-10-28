import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'LulusATS',
  description: 'Optimalkan CV Anda dengan kata kunci relevan sesuai deskripsi lowongan kerja impian.',
  icons: {
    icon: '/LA.jpeg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="bg-slate-100 text-slate-900 font-sans min-h-screen antialiased selection:bg-indigo-600 selection:text-white flex justify-center">
        {children}
      </body>
    </html>
  );
}