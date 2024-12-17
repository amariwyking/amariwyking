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
    <html lang="en" className="${inter.variable}">
      <body className="flex h-fit bg-gray-50 dark:bg-gray-900 overflow-scroll">
        <div className="flex justify-center w-full sm:px-8">
          <div className="flex w-full max-w-7xl lg:px-8">
            <div className="relative flex w-full">
              <main className="flex-auto">
                {children}
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
