"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories } from "@/lib/categories";
import type { Branch, Offer, RequestStatus } from "@/lib/types";

const refresh = () => {
  revalidatePath("/", "layout");
};
const num = (v: FormDataEntryValue | null, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const n = Number(String(v ?? "").replace(/[\s,]/g, ""));
  if (!Number.isFinite(n)) throw new Error("Некорректное число");
  return Math.min(max, Math.max(min, n));
};
const s = (v: FormDataEntryValue | null, max = 300) => String(v ?? "").trim().slice(0, max);

export async function login(_: unknown, form: FormData) {
  if (!checkPassword(s(form.get("password"), 200))) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Неверный пароль" };
  }
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function saveSettings(form: FormData) {
  await requireAdmin();
  await db().saveSettings({
    currency: s(form.get("currency"), 8) || "KRW",
    goldPricePerGram: num(form.get("goldPricePerGram"), 1),
    goldPledgeRate: num(form.get("goldPledgeRate"), 0, 100) / 100,
    goldBuyoutRate: num(form.get("goldBuyoutRate"), 0, 100) / 100,
    devicePledgeRate: num(form.get("devicePledgeRate"), 0, 100) / 100,
    deviceBuyoutRate: num(form.get("deviceBuyoutRate"), 0, 100) / 100,
    monthlyFeePercent: num(form.get("monthlyFeePercent"), 0, 100),
  });
  refresh();
}

export async function saveBranch(form: FormData) {
  await requireAdmin();
  const b: Branch = {
    id: s(form.get("id"), 80) || randomUUID().slice(0, 8),
    name: s(form.get("name"), 120),
    city: s(form.get("city"), 80),
    address: s(form.get("address"), 300),
    hours: s(form.get("hours"), 200),
    phone: s(form.get("phone"), 40),
    whatsapp: s(form.get("whatsapp"), 40).replace(/\D/g, ""),
    lat: num(form.get("lat"), -90, 90),
    lng: num(form.get("lng"), -180, 180),
    active: form.get("active") === "on",
  };
  if (!b.name || !b.address) throw new Error("Название и адрес обязательны");
  await db().upsertBranch(b);
  refresh();
}

export async function deleteBranch(id: string) {
  await requireAdmin();
  await db().deleteBranch(id);
  refresh();
}

export async function saveOffer(form: FormData) {
  await requireAdmin();
  const category = categories.find((c) => c.id === form.get("category"))?.id;
  if (!category) throw new Error("Категория обязательна");
  const o: Offer = {
    id: s(form.get("id"), 80) || randomUUID().slice(0, 8),
    title: s(form.get("title"), 160),
    category,
    price: num(form.get("price"), 0),
    condition: s(form.get("condition"), 120),
    description: s(form.get("description"), 600),
    imageUrl: s(form.get("imageUrl"), 500) || null,
    active: form.get("active") === "on",
    createdAt: s(form.get("createdAt"), 40) || new Date().toISOString(),
  };
  if (!o.title) throw new Error("Название обязательно");
  const file = form.get("imageFile");
  if (file instanceof File && file.size > 0) {
    const ext = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>)[file.type];
    if (!ext) throw new Error("Фото должно быть JPG, PNG или WEBP");
    if (file.size > 8 * 1024 * 1024) throw new Error("Фото больше 8 МБ");
    o.imageUrl = await db().uploadOfferImage(`${o.id}-${Date.now()}.${ext}`, await file.arrayBuffer(), file.type);
  }
  if (form.get("removeImage") === "on") o.imageUrl = null;
  await db().upsertOffer(o);
  refresh();
}

export async function deleteOffer(id: string) {
  await requireAdmin();
  await db().deleteOffer(id);
  refresh();
}

export async function updateRequest(id: string, patch: { status?: RequestStatus; note?: string }) {
  await requireAdmin();
  const allowed: RequestStatus[] = ["new", "contacted", "done", "rejected"];
  await db().updateRequest(id, {
    ...(patch.status && allowed.includes(patch.status) ? { status: patch.status } : {}),
    ...(patch.note !== undefined ? { note: patch.note.slice(0, 1000) } : {}),
  });
  revalidatePath("/admin");
}

export async function deleteRequest(id: string) {
  await requireAdmin();
  await db().deleteRequest(id);
  revalidatePath("/admin");
}
