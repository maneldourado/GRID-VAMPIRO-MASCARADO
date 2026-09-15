import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vampiro: A Máscara V5",
  description: "Virtual Tabletop para Vampiro V5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="bg-zinc-950 text-zinc-100 min-h-screen font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}