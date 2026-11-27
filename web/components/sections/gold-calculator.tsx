"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Info } from "lucide-react";
import type { Branch, Mode, Settings } from "@/lib/types";
import { goldQuote, purities } from "@/lib/pricing";
import { cn, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedNumber, Reveal, SectionHeading, Segmented } from "@/components/ui/motion";
import { RequestForm } from "./request-form";

export function GoldCalculator({ settings, branches, heading = true }: { settings: Settings; branches: Branch[]; heading?: boolean }) {
  const [purity, setPurity] = useState("585");
  const [grams, setGrams] = useState(10);
  const [mode, setMode] = useState<Mode>("pledge");
  const [step, setStep] = useState<"calc" | "form">("calc");

  const q = useMemo(() => goldQuote(settings, purity, grams, mode), [settings, purity, grams, mode]);
  const fmt = useCallback((n: number) => formatMoney(n, settings.currency), [settings.currency]);
  const pct = Math.min(100, (grams / 200) * 100);

  return (
    <section id="gold" className="relative scroll-mt-24 px-5 py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute top-1/3 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-champagne/10 blur-[140px]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div>
          {heading && (
            <SectionHeading eyebrow="Оценка золота" title={<>Калькулятор <span className="text-gold italic">золота</span></>}>
              Цена рассчитывается от актуальной стоимости чистого золота с учётом пробы. Выберите режим — залог с возможностью выкупа или продажа.
            </SectionHeading>
          )}
          <Reveal delay={0.15} className="mt-10 grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-5">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-platinum/50 uppercase">999.9 · грамм</p>
              <p className="mt-2 font-display text-2xl text-white sm:text-3xl">{fmt(settings.goldPricePerGram)}</p>
            </div>
            <div className="glass rounded-2xl p-5">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-platinum/50 uppercase">Тройская унция</p>
              <p className="mt-2 font-display text-2xl text-white sm:text-3xl">{fmt(q.pricePerOunce)}</p>
            </div>
          </Reveal>
          <p className="mt-4 text-xs text-platinum/40">
            Курс обновлён {new Date(settings.updatedAt).getTime() > 0 ? new Date(settings.updatedAt).toLocaleDateString("ru-RU") : "администратором"}. 1 тройская унция = 31,1035 г.
          </p>
        </div>

        <Reveal delay={0.1}>
          <div className="glass-strong relative overflow-hidden rounded-[2rem] p-6 sm:p-9">
            <div aria-hidden className="hairline absolute inset-x-10 top-0" />
            <AnimatePresence mode="wait" initial={false}>
              {step === "calc" ? (
                <motion.div key="calc" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}>
                  <Segmented
                    id="gold-mode"
                    value={mode}
                    onChange={setMode}
                    options={[
                      { value: "pledge", label: "Залог" },
                      { value: "buyout", label: "Выкуп" },
                    ]}
                  />

                  <p className="label mt-8">Проба</p>
                  <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Проба золота">
                    {purities.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        role="radio"
                        aria-checked={purity === p.id}
                        onClick={() => setPurity(p.id)}
                        className={cn(
                          "rounded-xl border px-2 py-3 text-center transition-all duration-300",
                          purity === p.id
                            ? "border-liquid/70 bg-liquid/10 shadow-[0_0_30px_-8px_rgba(243,213,138,0.5)]"
                            : "border-white/10 bg-white/[0.03] hover:border-white/25",
                        )}
                      >
                        <span className={cn("block font-display text-xl", purity === p.id ? "text-liquid" : "text-white")}>{p.label}</span>
                        <span className="mt-0.5 block truncate text-[10px] text-platinum/45">{p.hint}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 flex items-end justify-between">
                    <label className="label mb-0" htmlFor="gold-weight">Вес изделия</label>
                    <div className="flex items-baseline gap-1">
                      <input
                        id="gold-weight-num"
                        aria-label="Вес в граммах"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={5000}
                        step={0.1}
                        value={grams}
                        onChange={(e) => setGrams(Math.max(0, Math.min(5000, Number(e.target.value) || 0)))}
                        className="w-24 bg-transparent text-right font-display text-3xl text-white outline-none"
                      />
                      <span className="text-sm text-platinum/50">г</span>
                    </div>
                  </div>
                  <input
                    id="gold-weight"
                    type="range"
                    min={0.5}
                    max={200}
                    step={0.5}
                    value={Math.min(grams, 200)}
                    onChange={(e) => setGrams(Number(e.target.value))}
                    className="mt-4 w-full"
                    style={{ ["--p" as string]: `${pct}%` }}
                  />

                  <div className="mt-8 rounded-2xl border border-white/8 bg-black/30 p-5">
                    <div className="flex items-center justify-between text-sm text-platinum/60">
                      <span>Цена за грамм {q.purity.label}</span>
                      <span className="tabular-nums text-white">{fmt(q.pricePerGram)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-platinum/60">
                      <span>Стоимость металла</span>
                      <span className="tabular-nums text-white">{fmt(q.melt)}</span>
                    </div>
                    <div className="hairline my-4" />
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-champagne uppercase">
                      {mode === "pledge" ? "Сумма займа" : "Вы получите"}
                    </p>
                    <p className="mt-1 font-display text-4xl text-gold sm:text-5xl">
                      <AnimatedNumber value={q.payout} format={fmt} />
                    </p>
                    {mode === "pledge" && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-platinum/50">
                        <Info className="h-3.5 w-3.5" /> Плата за пользование ≈ {fmt(q.monthlyFee)} / месяц ({settings.monthlyFeePercent}%)
                      </p>
                    )}
                  </div>

                  <Button size="lg" className="mt-6 w-full" onClick={() => setStep("form")} disabled={grams <= 0}>
                    Зафиксировать оценку <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.35 }}>
                  <button type="button" onClick={() => setStep("calc")} className="mb-6 text-xs text-platinum/50 hover:text-liquid">
                    ← Назад к расчёту
                  </button>
                  <p className="font-display text-2xl text-white">
                    {q.purity.label} · {grams} г · {mode === "pledge" ? "залог" : "выкуп"}
                  </p>
                  <p className="mb-6 text-sm text-platinum/60">
                    Предварительно: <span className="text-liquid">{fmt(q.min)} – {fmt(q.max)}</span>
                  </p>
                  <RequestForm
                    branches={branches}
                    payload={{
                      category: "gold",
                      kind: "gold",
                      mode,
                      summary: `Золото ${q.purity.label}, ${grams} г`,
                      details: { purity: q.purity.label, grams, pricePerGram: Math.round(q.pricePerGram) },
                      estimateMin: q.min,
                      estimateMax: q.max,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
