import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Footer } from "@/components/footer";
import { Spotlight } from "@/components/spotlight";
import { ThemeToggle } from "@/components/theme-toggle";
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
    <html
      lang="fr"
      className={cn("h-full antialiased", "font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <head>
        {/* Lu avant la première peinture : pose data-theme si un choix est mémorisé,
            sinon ne touche à rien (le système décide). Aucune dépendance. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}",
          }}
        />
      </head>
      <body className="bg-grid flex min-h-full flex-col text-foreground">
        <Spotlight />
        {/* En desktop, le bouton de thème vit en bas de la colonne gauche (intro). */}
        <div className="fixed right-4 top-4 z-50 rounded-md bg-background lg:hidden">
          <ThemeToggle />
        </div>
        {children}
        <Footer />
      </body>
    </html>
  );
}
