import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { Hero } from "@/components/hero/hero";
import { CategoriesGrid } from "@/components/sections/categories-grid";
import { GoldCalculator } from "@/components/sections/gold-calculator";
import { DeviceValuation } from "@/components/sections/device-valuation";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Branches } from "@/components/sections/branches";
import { OffersGrid } from "@/components/sections/offers-grid";
import { Cta } from "@/components/sections/cta";
import { Footer } from "@/components/layout/footer";
import { SectionHeading } from "@/components/ui/motion";

export const revalidate = 60;

export default async function Home() {
  const repo = db();
  const [settings, branches, offers] = await Promise.all([repo.getSettings(), repo.listBranches(), repo.listOffers()]);

  return (
    <main id="main">
      <Hero settings={settings} />
      <CategoriesGrid />
      <GoldCalculator settings={settings} branches={branches} />
      <DeviceValuation settings={settings} branches={branches} />
      <HowItWorks />
      <section className="px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="Витрина" title={<>Наши <span className="text-gold italic">предложения</span></>}>
              Проверенные вещи с гарантией — по цене ниже рыночной.
            </SectionHeading>
            <Link href="/offers" className="flex items-center gap-2 text-sm text-champagne hover:text-liquid">
              Вся витрина <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <OffersGrid offers={offers} settings={settings} filterable={false} limit={4} />
        </div>
      </section>
      <Branches branches={branches} />
      <Cta />
      <Footer />
    </main>
  );
}
