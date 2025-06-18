import type { Metadata } from "next";
import { Work_Sans, Kode_Mono, Manuale } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  weight: ['400'],
})

const kodeMono = Kode_Mono({
  subsets: ['latin'],
  variable: '--font-kode-mono',
  weight: ['400', '500', '600', '700'],
})

const manuale = Manuale({
  subsets: ['latin'],
  variable: '--font-manuale',
})

export const metadata: Metadata = {
  title: "Amari Wyking",
  description: "Explore. Build. Enhance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`bg-zinc-100 ${kodeMono.variable} ${workSans.variable} ${manuale.variable}`}>
      <body className="min-h-screen">
          {children}
      </body>
    </html>
  );
}
