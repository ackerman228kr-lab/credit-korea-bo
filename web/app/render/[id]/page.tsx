import { notFound } from "next/navigation";
import { categoryById } from "@/lib/categories";
import { RenderStage } from "./stage";

/** Internal page used by `npm run fallbacks` to export static product images. */
export const metadata = { robots: { index: false } };

export default async function RenderPage({ params }: { params: Promise<{ id: string }> }) {
  const c = categoryById((await params).id);
  if (!c) notFound();
  return <RenderStage id={c.id} />;
}
