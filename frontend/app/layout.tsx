import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Larder - every package, decoded",
  description:
    "Search real barcoded foods from the Open Food Facts vault. Read brands, ingredients, and nutrition in plain language.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F0E4" },
    { media: "(prefers-color-scheme: dark)", color: "#17130F" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={space.variable}
    >
      <body>
        <div
          aria-hidden="true"
          className="grain pointer-events-none fixed inset-0 z-50"
        />
        <div className="overflow-x-clip">
          <LanguageProvider>
            <Nav />
            {children}
            <Footer />
          </LanguageProvider>
        </div>
      </body>
    </html>
  );
}