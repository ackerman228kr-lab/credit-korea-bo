import { promises as fs } from "fs";
import path from "path";
import { isAdmin } from "@/lib/auth";
import { UPLOAD_DIR } from "@/lib/db/local";

/** Serves locally stored photos to the admin (Supabase uses signed URLs instead). */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const key = path.basename(decodeURIComponent((await params).key));
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, key));
    const ext = key.split(".").pop();
    const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return new Response(new Uint8Array(data), { headers: { "content-type": type, "cache-control": "private, max-age=3600" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
