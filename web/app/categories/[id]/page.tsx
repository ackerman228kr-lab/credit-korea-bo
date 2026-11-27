import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, categoryById } from "@/lib/categories";
import { db } from "@/lib/db";
import { CategoryShowcase } from "@/components/category-showcase";
import { GoldCalculator } from "@/components/sections/gold-calculator";
import { DeviceValuation } from "@/components/sections/device-valuation";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Branches } from "@/components/sections/branches";
import { Footer } from "@/components/layout/footer";

export const revalidate = 60;

export function generateStaticParams() {
  return categories.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = categoryById((await params).id);
  return c ? { title: `${c.label} — оценка`, description: c.long } : {};
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const category = categoryById((await params).id);
  if (!category) notFound();
  const repo = db();
  const [settings, branches] = await Promise.all([repo.getSettings(), repo.listBranches()]);

  return (
    <main id="main">
      <CategoryShowcase category={category} />
      {category.id === "gold" ? (
        <GoldCalculator settings={settings} branches={branches} />
      ) : (
        <DeviceValuation settings={settings} branches={branches} initialCategory={category.id} lockCategory />
      )}
      <HowItWorks />
      <Branches branches={branches} />
      <Footer />
    </main>
  );
}
