import { loadFiche, loadFiches } from "@/lib/fiches";

// Export statique : seuls les slugs connus au build existent.
export const dynamicParams = false;

export function generateStaticParams() {
  return loadFiches().map(({ slug }) => ({ slug }));
}

export default async function ProjetPage({ params }: PageProps<"/projets/[slug]">) {
  const { slug } = await params;
  const fiche = loadFiche(slug);
  return <h1>{fiche.titre}</h1>;
}
