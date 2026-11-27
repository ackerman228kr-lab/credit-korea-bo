"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/lib/categories";
import { Reveal, SectionHeading, TiltCard } from "@/components/ui/motion";

export function CategoriesGrid() {
  return (
    <section id="categories" className="relative scroll-mt-24 px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Что мы принимаем" title={<>Шесть направлений — <span className="text-gold italic">один стандарт</span></>}>
          Эксперты по каждому типу ценностей. Нажмите на категорию, чтобы открыть 3D-витрину и оценку.
        </SectionHeading>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.06}>
              <Link href={`/categories/${c.id}`} className="group block h-full rounded-3xl focus-visible:outline-2 focus-visible:outline-liquid">
                <TiltCard className="glass h-full overflow-hidden rounded-3xl">
                  <div className="relative flex h-56 items-center justify-center overflow-hidden">
                    <div aria-hidden className="absolute bottom-6 h-10 w-48 rounded-[50%] bg-black/70 blur-xl" />
                    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(243,213,138,0.12),transparent_60%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                    <img
                      src={`/fallback/${c.id}.png`}
                      alt={c.description}
                      loading="lazy"
                      className="relative h-48 w-48 object-contain transition-transform duration-[900ms] ease-[var(--ease-lux)] [transform:translateZ(40px)] group-hover:scale-110 group-hover:-rotate-3"
                    />
                  </div>
                  <div className="flex items-end justify-between gap-4 border-t border-white/6 p-6">
                    <div>
                      <p className="font-display text-2xl tracking-[0.12em] text-white">{c.title}</p>
                      <p className="mt-1 text-sm text-platinum/60">{c.description}</p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 transition-all duration-500 group-hover:border-liquid group-hover:bg-liquid group-hover:text-obsidian">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </TiltCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
