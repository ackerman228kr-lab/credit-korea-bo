import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { db, usingSupabase } from "@/lib/db";
import { Dashboard } from "@/components/admin/dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const repo = db();
  const [settings, branches, offers, requests] = await Promise.all([
    repo.getSettings(),
    repo.listBranches(true),
    repo.listOffers(true),
    repo.listRequests(),
  ]);
  const withPhotos = await Promise.all(
    requests.map(async (r) => ({ ...r, photoUrls: await Promise.all(r.photos.map((p) => repo.photoUrl(p))) })),
  );
  return <Dashboard settings={settings} branches={branches} offers={offers} requests={withPhotos} backend={usingSupabase() ? "Supabase" : "Локальное хранилище (.data)"} />;
}
