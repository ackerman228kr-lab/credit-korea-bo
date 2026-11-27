import type { Metadata } from "next";
import { db } from "@/lib/db";
import { OffersGrid } from "@/components/sections/offers-grid";
import { Footer } from "@/components/layout/footer";
import { SectionHeading } from "@/components/ui/motion";

export const revalidate = 60;
export const metadata: Metadata = { title: "Предложения", description: "Проверенные украшения, часы и техника с гарантией." };

export default async function OffersPage() {
  const repo = db();
  const [settings, offers] = await Promise.all([repo.getSettings(), repo.listOffers()]);
  return (
    <main id="main" className="relative pt-32">
      <div aria-hidden className="pointer-events-none absolute top-10 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-champagne/10 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5">
        <SectionHeading eyebrow="Витрина" title={<>Наши <span className="text-gold italic">предложения</span></>}>
          Каждая вещь проверена экспертом. Напишите нам — забронируем и подготовим к просмотру.
        </SectionHeading>
        <div className="mt-12">
          <OffersGrid offers={offers} settings={settings} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
