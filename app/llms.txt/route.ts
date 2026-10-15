import { buildLlms } from "@/lib/llms";

// Route statique, pas une API : l'export la fige au build dans out/llms.txt (D12).
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlms(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
