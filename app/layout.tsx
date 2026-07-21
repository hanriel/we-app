import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from './providers';

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WE — приложение для пар и семей: списки задач, вишлист, планирование поездок и покупок",
  description: "WE (МЫ) — уютное PWA-приложение для двоих и всей семьи. Совместно ведите списки дел и покупок, собирайте вишлисты, планируйте поездки и воплощайте мечты. Работает офлайн, всегда под рукой.",
  keywords: "приложение для пар, семейный трекер, общий список задач, вишлист, wishlist для пар, совместные покупки, планирование поездок, we, мы вдвоём, pwa",
  openGraph: {
    title: "WE — приложение для пар и семей: общие списки, вишлист и планы",
    description: "Создавайте списки дел и покупок, вишлисты и планы поездок вместе с близкими. Тёплое приложение для двоих и всей семьи.",
    url: "https://we.hanriel.ru",
    type: "website",
    siteName: "WE — мы вдвоём",
    locale: "ru_RU",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    startupImage: "/icons/logo-transparent.png",
    title: "WE",
  },
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
