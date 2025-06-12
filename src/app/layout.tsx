import type { Metadata } from "next";
import { Work_Sans, Kode_Mono, Manuale } from "next/font/google";
import "./globals.css";
import NavBar from "./components/nav/NavBar";

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
})

const kodeMono = Kode_Mono({
  subsets: ['latin'],
  variable: '--font-kode-mono',
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
    <html lang="en" className={`${kodeMono.variable} ${workSans.variable} ${manuale.variable} h-full overflow-scroll`}>
      <body>
        {/* <header className="absolute lg:fixed w-full z-50">
          <NavBar />
        </header> */}
        <main>
          <div className="flex flex-col h-full min-h-screen">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
