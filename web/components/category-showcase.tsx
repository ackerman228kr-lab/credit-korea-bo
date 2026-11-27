"use client";

/* eslint-disable @next/next/no-img-element */
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Hand } from "lucide-react";
import { categories, type Category } from "@/lib/categories";
import { useReducedMotion, useWebGL } from "@/hooks/use-env";
import { ease } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

const ModelViewer = dynamic(() => import("@/components/three/model-viewer"), { ssr: false });

export function CategoryShowcase({ category }: { category: Category }) {
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const [ready, setReady] = useState(false);
  const idx = categories.findIndex((c) => c.id === category.id);
  const prev = categories[(idx - 1 + categories.length) % categories.length];
  const next = categories[(idx + 1) % categories.length];

  return (
    <section className="noise relative overflow-hidden pt-28 pb-10">
      <div aria-hidden className="pointer-events-none absolute top-20 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-champagne/10 blur-[140px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease }}>
          <Link href="/#showroom" className="inline-flex items-center gap-2 text-sm text-platinum/60 hover:text-liquid">
            <ArrowLeft className="h-4 w-4" /> Шоурум
          </Link>
          <p className="mt-8 text-[11px] font-semibold tracking-[0.35em] text-champagne uppercase">Категория {String(idx + 1).padStart(2, "0")}</p>
          <h1 className="mt-3 font-display text-6xl tracking-[0.08em] text-white sm:text-7xl">{category.title}</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-platinum/70">{category.long}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {category.accepts.map((a) => (
              <li key={a} className="glass flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-platinum/80">
                <Check className="h-4 w-4 shrink-0 text-liquid" /> {a}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex gap-6 text-sm">
            <Link href={`/categories/${prev.id}`} className="text-platinum/50 hover:text-liquid">
              ← {prev.label}
            </Link>
            <Link href={`/categories/${next.id}`} className="text-platinum/50 hover:text-liquid">
              {next.label} →
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease, delay: 0.1 }}
          className="relative aspect-square w-full lg:aspect-[4/5]"
        >
          <div className="glass absolute inset-0 overflow-hidden rounded-[2.5rem]">
            {webgl && <ModelViewer id={category.id} reducedMotion={reduced} onReady={() => setReady(true)} />}
            {(!webgl || !ready) && (
              <img
                src={`/fallback/${category.id}.png`}
                alt={category.description}
                className={cn("absolute inset-0 m-auto h-3/4 w-3/4 object-contain transition-opacity", webgl && "opacity-60")}
              />
            )}
          </div>
          {webgl && (
            <p className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-xs text-platinum/60 backdrop-blur">
              <Hand className="h-3.5 w-3.5" /> Вращайте модель
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
