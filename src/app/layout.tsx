import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "./components/nav/NavBar";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" className="h-full overflow-scroll">
      <body>
        <header className="fixed w-full">
          <NavBar />
        </header>
        <main>
          <div className="flex flex-col h-full min-h-screen">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
