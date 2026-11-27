import { promises as fs } from "fs";
import path from "path";
import { OFFER_IMG_DIR } from "@/lib/db/local";

/** Public showcase photos in local-storage mode (Supabase serves its own public URLs). */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const key = path.basename(decodeURIComponent((await params).key));
  try {
    const data = await fs.readFile(path.join(OFFER_IMG_DIR, key));
    const ext = key.split(".").pop();
    const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return new Response(new Uint8Array(data), { headers: { "content-type": type, "cache-control": "public, max-age=31536000, immutable" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
