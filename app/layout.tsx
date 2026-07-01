import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SplashScreen from "@/components/SplashScreen";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/lib/CartContext";
import { GoldRateProvider } from "@/lib/GoldRateContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Shri Vasavi Jewellers",
  description: "Discover our exquisite collection of fine jewelry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cormorant.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <GoldRateProvider>
            <CartProvider>
              <Navbar />
              <main className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
                {children}
              </main>
            </CartProvider>
          </GoldRateProvider>
        </ThemeProvider>
        <SplashScreen />
      </body>
    </html>
  );
}
