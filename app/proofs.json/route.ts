import { buildProofs } from "@/lib/proofs";

// Route statique, pas une API : l'export la fige au build dans out/proofs.json (D12).
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildProofs());
}
