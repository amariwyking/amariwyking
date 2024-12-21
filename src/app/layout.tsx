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
      <body className="flex flex-col h-full md:mx-32">
        <div className="">
          <NavBar />
          {children}
        </div>
      </body>
    </html>
  );
}
