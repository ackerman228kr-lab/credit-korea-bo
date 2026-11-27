import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories } from "@/lib/categories";
import type { ValuationRequest } from "@/lib/types";

const MAX_PHOTOS = 6;
const MAX_BYTES = 10 * 1024 * 1024;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic", "image/heif": "heif" };

// naive in-memory rate limit (per server instance)
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 8;
}

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ error: "Слишком много заявок, попробуйте позже" }, { status: 429 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(String(form.get("payload") ?? "{}"));
  } catch {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const name = str(form.get("name"), 80);
  const phone = str(form.get("phone"), 30);
  if (!name || phone.replace(/\D/g, "").length < 7) return NextResponse.json({ error: "Укажите имя и телефон" }, { status: 400 });

  const category = categories.find((c) => c.id === payload.category)?.id;
  if (!category) return NextResponse.json({ error: "Неизвестная категория" }, { status: 400 });
  const kind = payload.kind === "gold" ? "gold" : "device";
  const mode = payload.mode === "buyout" ? "buyout" : "pledge";
  const contact = (["phone", "whatsapp", "telegram"] as const).find((c) => c === payload.contact) ?? "phone";

  const repo = db();
  const id = randomUUID();
  const photos: string[] = [];
  const files = form.getAll("photos").filter((f): f is File => f instanceof File).slice(0, MAX_PHOTOS);
  for (const [i, f] of files.entries()) {
    const ext = EXT[f.type];
    if (!ext || f.size > MAX_BYTES) continue;
    try {
      photos.push(await repo.uploadPhoto(`${id}-${i}.${ext}`, await f.arrayBuffer(), f.type));
    } catch (e) {
      console.error("photo upload failed", e);
    }
  }

  const details = typeof payload.details === "object" && payload.details ? (payload.details as Record<string, unknown>) : {};
  const request: ValuationRequest = {
    id,
    createdAt: new Date().toISOString(),
    category,
    kind,
    mode,
    summary: str(payload.summary, 200),
    details: JSON.parse(JSON.stringify(details).slice(0, 4000) || "{}"),
    estimateMin: Math.max(0, Number(payload.estimateMin) || 0),
    estimateMax: Math.max(0, Number(payload.estimateMax) || 0),
    name,
    phone,
    contact,
    branchId: str(form.get("branchId"), 80) || null,
    photos,
    status: "new",
  };

  try {
    await repo.createRequest(request);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Не удалось сохранить заявку" }, { status: 500 });
  }
  revalidatePath("/admin");
  return NextResponse.json({ ok: true, id });
}
