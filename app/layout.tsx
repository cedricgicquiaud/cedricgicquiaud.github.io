import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Spotlight } from "@/components/spotlight";
import { cn } from "@/lib/utils";
import site from "../content/site.json";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://cedricgicquiaud.github.io"),
  title: site.name,
  description: site.title,
  openGraph: {
    title: site.name,
    description: site.title,
    // PNG généré par `node scripts/og-image.mjs` (pas de route next/og : l'export
    // statique la sort sans extension, donc sans type MIME image sur GitHub Pages).
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: site.name }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={cn("h-full antialiased", "font-sans", inter.variable)}>
      <body className="bg-grid flex min-h-full flex-col text-foreground">
        <Spotlight />
        {children}
      </body>
    </html>
  );
}
