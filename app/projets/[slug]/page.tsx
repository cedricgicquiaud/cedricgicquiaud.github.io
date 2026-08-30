import type { Metadata } from "next";
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
  return { title: `${fiche.frontmatter.nom} — ${site.name}`, description: fiche.enBref.quoi };
}

export default async function ProjetPage({ params }: PageProps<"/projets/[slug]">) {
  const { slug } = await params;
  const fiche = loadFiche(slug);
  return <h1>{fiche.titre}</h1>;
}
