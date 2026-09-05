import type { Metadata } from "next";
import { Fiche } from "@/components/fiche";
import { loadFiche, loadFiches } from "@/lib/fiches";
import site from "../../../content/site.json";

// Export statique : seuls les slugs connus au build existent.
export const dynamicParams = false;

export function generateStaticParams() {
  return loadFiches().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/projets/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const fiche = loadFiche(slug);
  const title = `${fiche.frontmatter.nom} — ${site.name}`;
  // openGraph explicite : sinon la page hérite la carte générique du layout
  // (og:title = nom du site) et un lien partagé sur LinkedIn ne nomme pas le projet.
  // Next remplace l'objet openGraph du layout sans le fusionner : sans `images` ici, la fiche
  // n'aurait aucune og:image. Le visuel de la fiche, rendu absolu via metadataBase.
  return {
    title,
    description: fiche.enBref.quoi,
    openGraph: {
      title,
      description: fiche.enBref.quoi,
      type: "article",
      url: `/projets/${slug}/`,
      images: [{ url: fiche.visuel, width: 1200, height: 750, alt: fiche.frontmatter.nom }],
    },
  };
}

export default async function ProjetPage({ params }: PageProps<"/projets/[slug]">) {
  const { slug } = await params;
  return (
    <main className="flex flex-1 flex-col">
      <Fiche fiche={loadFiche(slug)} />
    </main>
  );
}
