"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { categories } from "@/lib/categories";
import { site } from "@/lib/site";
import type { Offer, Settings } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/ui/motion";

export function OffersGrid({ offers, settings, filterable = true, limit }: { offers: Offer[]; settings: Settings; filterable?: boolean; limit?: number }) {
  const [filter, setFilter] = useState<string>("all");
  const list = useMemo(() => {
    const l = filter === "all" ? offers : offers.filter((o) => o.category === filter);
    return limit ? l.slice(0, limit) : l;
  }, [offers, filter, limit]);

  return (
    <div>
      {filterable && (
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
          {[{ id: "all", label: "Все" }, ...categories].map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm transition",
                filter === c.id ? "border-liquid/70 bg-liquid/10 text-liquid" : "border-white/10 text-platinum/70 hover:text-white",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      {list.length === 0 && <p className="py-16 text-center text-platinum/50">В этой категории пока нет предложений.</p>}
      <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((o) => {
            const msg = encodeURIComponent(`Здравствуйте! Интересует: ${o.title}`);
            return (
              <motion.div key={o.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <TiltCard className="glass flex h-full flex-col overflow-hidden rounded-3xl">
                  <div className="relative flex h-48 items-center justify-center bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.06),transparent_70%)]">
                    <img src={o.imageUrl || `/fallback/${o.category}.png`} alt={o.title} loading="lazy" className="h-40 w-40 object-contain" />
                    <span className="absolute top-4 left-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] tracking-[0.18em] text-platinum/70 uppercase">
                      {categories.find((c) => c.id === o.category)?.label}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="font-semibold text-white">{o.title}</p>
                    <p className="mt-1 text-xs text-champagne/80">{o.condition}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-platinum/55">{o.description}</p>
                    <div className="mt-auto flex items-center justify-between pt-5">
                      <p className="font-display text-2xl text-gold">{formatMoney(o.price, settings.currency)}</p>
                      <Button asChild size="icon" variant="glass" aria-label="Написать в WhatsApp">
                        <a href={`https://wa.me/${site.whatsapp}?text=${msg}`} target="_blank" rel="noreferrer">
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
