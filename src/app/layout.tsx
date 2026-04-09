import type { Metadata } from "next";
import { Inter, Ubuntu } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });
const ubuntu = Ubuntu({ 
  weight: ['300', '400', '500', '700'], 
  subsets: ["latin"],
  variable: '--font-ubuntu' 
});

export const metadata: Metadata = {
  title: "Primeira Vaga",
  description: "Encontre seu primeiro emprego de forma simples e moderna.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} ${ubuntu.variable} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
