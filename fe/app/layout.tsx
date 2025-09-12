import type React from "react";
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { CartSidebar } from "@/components/cart-sidebar";
import { Suspense } from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Luxe Parfums - Perfumes Importados de Lujo",
  description:
    "Descubre nuestra exclusiva colección de perfumes importados de las mejores marcas del mundo.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${playfair.variable} ${inter.variable}`}>
        <Suspense fallback={null}>
          <StoreProvider>
            {children}
            <CartSidebar />
          </StoreProvider>
        </Suspense>
      </body>
    </html>
  );
}
