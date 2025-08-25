import type { Metadata } from "next";
import { Work_Sans, Kode_Mono, Manuale } from "next/font/google";
import "./globals.css";
import { CivicAuthProvider } from "@civic/auth/nextjs";
import { ThemeProvider } from "next-themes";

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

    <html lang="en" className={`bg-background ${kodeMono.variable} ${workSans.variable} ${manuale.variable}`} suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CivicAuthProvider displayMode="iframe" iframeMode="embedded">
            {children}
          </CivicAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
