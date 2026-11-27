import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Repository } from "./repo";
import type { Branch, Offer, Settings, ValuationRequest } from "../types";
import { defaultSettings } from "./seed";

/** Supabase (PostgreSQL + Storage) repository. Server-side only: uses the service role key. */
export function createSupabaseRepo(url: string, key: string, bucket: string): Repository {
  const sb: SupabaseClient = createClient(url, key, { auth: { persistSession: false } });

  const check = <T>(res: { data: T; error: { message: string } | null }) => {
    if (res.error) throw new Error(res.error.message);
    return res.data;
  };

  const toBranch = (r: Record<string, unknown>): Branch => ({
    id: r.id as string,
    name: r.name as string,
    city: r.city as string,
    address: r.address as string,
    hours: r.hours as string,
    phone: r.phone as string,
    whatsapp: r.whatsapp as string,
    lat: Number(r.lat),
    lng: Number(r.lng),
    active: r.active as boolean,
  });
  const toOffer = (r: Record<string, unknown>): Offer => ({
    id: r.id as string,
    title: r.title as string,
    category: r.category as Offer["category"],
    price: Number(r.price),
    condition: r.condition as string,
    description: r.description as string,
    imageUrl: (r.image_url as string) ?? null,
    active: r.active as boolean,
    createdAt: r.created_at as string,
  });
  const toRequest = (r: Record<string, unknown>): ValuationRequest => ({
    id: r.id as string,
    createdAt: r.created_at as string,
    category: r.category as ValuationRequest["category"],
    kind: r.kind as ValuationRequest["kind"],
    mode: r.mode as ValuationRequest["mode"],
    summary: r.summary as string,
    details: (r.details as Record<string, unknown>) ?? {},
    estimateMin: Number(r.estimate_min),
    estimateMax: Number(r.estimate_max),
    name: r.name as string,
    phone: r.phone as string,
    contact: r.contact as ValuationRequest["contact"],
    branchId: (r.branch_id as string) ?? null,
    photos: (r.photos as string[]) ?? [],
    status: r.status as ValuationRequest["status"],
    note: (r.note as string) ?? null,
  });

  return {
    async getSettings() {
      const { data } = await sb.from("settings").select("*").eq("id", 1).maybeSingle();
      if (!data) return defaultSettings;
      return {
        currency: data.currency,
        goldPricePerGram: Number(data.gold_price_per_gram),
        goldPledgeRate: Number(data.gold_pledge_rate),
        goldBuyoutRate: Number(data.gold_buyout_rate),
        devicePledgeRate: Number(data.device_pledge_rate),
        deviceBuyoutRate: Number(data.device_buyout_rate),
        monthlyFeePercent: Number(data.monthly_fee_percent),
        updatedAt: data.updated_at,
      } satisfies Settings;
    },
    async saveSettings(s) {
      const updatedAt = new Date().toISOString();
      check(
        await sb.from("settings").upsert({
          id: 1,
          currency: s.currency,
          gold_price_per_gram: s.goldPricePerGram,
          gold_pledge_rate: s.goldPledgeRate,
          gold_buyout_rate: s.goldBuyoutRate,
          device_pledge_rate: s.devicePledgeRate,
          device_buyout_rate: s.deviceBuyoutRate,
          monthly_fee_percent: s.monthlyFeePercent,
          updated_at: updatedAt,
        }),
      );
      return { ...s, updatedAt };
    },
    async listBranches(all) {
      let q = sb.from("branches").select("*").order("sort", { ascending: true });
      if (!all) q = q.eq("active", true);
      return (check(await q) ?? []).map(toBranch);
    },
    async upsertBranch(b) {
      check(await sb.from("branches").upsert({ ...b }));
    },
    async deleteBranch(id) {
      check(await sb.from("branches").delete().eq("id", id));
    },
    async listOffers(all) {
      let q = sb.from("offers").select("*").order("created_at", { ascending: false });
      if (!all) q = q.eq("active", true);
      return (check(await q) ?? []).map(toOffer);
    },
    async upsertOffer(o) {
      check(
        await sb.from("offers").upsert({
          id: o.id,
          title: o.title,
          category: o.category,
          price: o.price,
          condition: o.condition,
          description: o.description,
          image_url: o.imageUrl ?? null,
          active: o.active,
          created_at: o.createdAt,
        }),
      );
    },
    async deleteOffer(id) {
      check(await sb.from("offers").delete().eq("id", id));
    },
    async listRequests() {
      const rows = check(await sb.from("valuation_requests").select("*").order("created_at", { ascending: false }).limit(500));
      return (rows ?? []).map(toRequest);
    },
    async createRequest(r) {
      check(
        await sb.from("valuation_requests").insert({
          id: r.id,
          created_at: r.createdAt,
          category: r.category,
          kind: r.kind,
          mode: r.mode,
          summary: r.summary,
          details: r.details,
          estimate_min: Math.round(r.estimateMin),
          estimate_max: Math.round(r.estimateMax),
          name: r.name,
          phone: r.phone,
          contact: r.contact,
          branch_id: r.branchId ?? null,
          photos: r.photos,
          status: r.status,
        }),
      );
    },
    async updateRequest(id, patch) {
      check(await sb.from("valuation_requests").update(patch).eq("id", id));
    },
    async deleteRequest(id) {
      check(await sb.from("valuation_requests").delete().eq("id", id));
    },
    async uploadPhoto(name, data, contentType) {
      check(await sb.storage.from(bucket).upload(name, data, { contentType, upsert: false }));
      return name;
    },
    async uploadOfferImage(name, data, contentType) {
      check(await sb.storage.from("offer-images").upload(name, data, { contentType, upsert: true }));
      return sb.storage.from("offer-images").getPublicUrl(name).data.publicUrl;
    },
    async photoUrl(key) {
      const { data } = await sb.storage.from(bucket).createSignedUrl(key, 60 * 60);
      return data?.signedUrl ?? "";
    },
  };
}
