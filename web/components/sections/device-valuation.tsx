"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BatteryFull, BatteryLow, BatteryMedium, Check } from "lucide-react";
import { categories, type CategoryId } from "@/lib/categories";
import { accessoriesFor, batteryLevels, conditions, deviceCatalog, hasBattery } from "@/lib/devices";
import { deviceQuote } from "@/lib/pricing";
import type { Branch, Mode, Settings } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AnimatedNumber, Reveal, SectionHeading, Segmented } from "@/components/ui/motion";
import { RequestForm } from "./request-form";

type DeviceCat = Exclude<CategoryId, "gold">;
const deviceCats = categories.filter((c) => c.id !== "gold");

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-all duration-300",
        on ? "border-liquid/70 bg-liquid/10 text-liquid" : "border-white/10 bg-white/[0.03] text-platinum/75 hover:border-white/25 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/6 pt-6 first:border-0 first:pt-0">
      <p className="mb-4 flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-platinum/60 uppercase">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-champagne/40 text-[10px] text-champagne">{n}</span>
        {title}
      </p>
      {children}
    </div>
  );
}

export function DeviceValuation({
  settings,
  branches,
  initialCategory = "smartphones",
  lockCategory = false,
  heading = true,
}: {
  settings: Settings;
  branches: Branch[];
  initialCategory?: DeviceCat;
  lockCategory?: boolean;
  heading?: boolean;
}) {
  const [cat, setCat] = useState<DeviceCat>(initialCategory);
  const [brand, setBrand] = useState(0);
  const [model, setModel] = useState(0);
  const [variant, setVariant] = useState(0);
  const [condition, setCondition] = useState<string>("good");
  const [battery, setBattery] = useState<string>("90");
  const [acc, setAcc] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>("pledge");
  const [step, setStep] = useState<"calc" | "form">("calc");

  useEffect(() => {
    if (lockCategory) return;
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id && id !== "gold") pickCat(id as DeviceCat);
    };
    window.addEventListener("valuate", on);
    return () => window.removeEventListener("valuate", on);
  }, [lockCategory]);

  const pickCat = (c: DeviceCat) => {
    setCat(c);
    setBrand(0);
    setModel(0);
    setVariant(0);
    setAcc([]);
    setStep("calc");
  };

  const brands = deviceCatalog[cat];
  const b = brands[brand] ?? brands[0];
  const m = b.models[model] ?? b.models[0];
  const v = m.variants?.[variant];
  const accessories = accessoriesFor(cat);
  const cond = conditions.find((c) => c.id === condition)!;
  const bat = batteryLevels.find((x) => x.id === battery)!;

  const q = useMemo(
    () =>
      deviceQuote(settings, {
        base: m.base,
        variantFactor: v?.factor ?? 1,
        conditionFactor: cond.factor,
        batteryFactor: hasBattery(cat) ? bat.factor : 1,
        accessoryBonus: accessories.filter((a) => acc.includes(a.id)).reduce((s, a) => s + a.bonus, 0),
        mode,
      }),
    [settings, m, v, cond, bat, cat, accessories, acc, mode],
  );
  const fmt = useCallback((n: number) => formatMoney(n, settings.currency), [settings.currency]);
  const summary = `${b.name} ${m.name}${v ? `, ${v.label}` : ""}`;

  return (
    <section id="devices" className="relative scroll-mt-24 px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        {heading && (
          <SectionHeading eyebrow="Оценка техники и часов" title={<>Подберите модель — <span className="text-gold italic">узнайте цену</span></>}>
            Выберите устройство, укажите характеристики и состояние. Диапазон обновляется мгновенно.
          </SectionHeading>
        )}

        {!lockCategory && (
          <Reveal className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {deviceCats.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pickCat(c.id as DeviceCat)}
                aria-pressed={cat === c.id}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-500",
                  cat === c.id ? "border-liquid/60 bg-liquid/[0.07] shadow-[0_0_40px_-12px_rgba(243,213,138,0.5)]" : "glass hover:border-white/30",
                )}
              >
                <img src={`/fallback/${c.id}.png`} alt="" className="mx-auto h-20 w-20 object-contain transition-transform duration-700 group-hover:scale-110 sm:h-24 sm:w-24" />
                <p className={cn("mt-3 text-sm font-semibold tracking-[0.14em]", cat === c.id ? "text-liquid" : "text-white")}>{c.title}</p>
              </button>
            ))}
          </Reveal>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <Reveal className="glass-strong space-y-6 rounded-[2rem] p-6 sm:p-8">
            <Step n={1} title="Бренд">
              <div className="flex flex-wrap gap-2">
                {brands.map((x, i) => (
                  <Chip key={x.name} on={i === brand} onClick={() => (setBrand(i), setModel(0), setVariant(0))}>
                    {x.name}
                  </Chip>
                ))}
              </div>
            </Step>
            <Step n={2} title="Модель">
              <div className="grid gap-2 sm:grid-cols-2">
                {b.models.map((x, i) => (
                  <button
                    key={x.name}
                    type="button"
                    onClick={() => (setModel(i), setVariant(0))}
                    aria-pressed={i === model}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all",
                      i === model ? "border-liquid/60 bg-liquid/10 text-white" : "border-white/8 bg-white/[0.02] text-platinum/75 hover:border-white/20",
                    )}
                  >
                    {x.name}
                    {i === model && <Check className="h-4 w-4 text-liquid" />}
                  </button>
                ))}
              </div>
            </Step>
            {m.variants && (
              <Step n={3} title="Характеристики">
                <div className="flex flex-wrap gap-2">
                  {m.variants.map((x, i) => (
                    <Chip key={x.label} on={i === variant} onClick={() => setVariant(i)}>
                      {x.label}
                    </Chip>
                  ))}
                </div>
              </Step>
            )}
            <Step n={m.variants ? 4 : 3} title="Состояние">
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                {conditions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCondition(c.id)}
                    aria-pressed={condition === c.id}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      condition === c.id ? "border-liquid/60 bg-liquid/10" : "border-white/8 bg-white/[0.02] hover:border-white/20",
                    )}
                  >
                    <span className={cn("block text-sm font-semibold", condition === c.id ? "text-liquid" : "text-white")}>{c.label}</span>
                    <span className="mt-1 block text-[11px] leading-snug text-platinum/45">{c.hint}</span>
                  </button>
                ))}
              </div>
            </Step>
            {hasBattery(cat) && (
              <Step n={m.variants ? 5 : 4} title="Ёмкость аккумулятора">
                <div className="flex flex-wrap gap-2">
                  {batteryLevels.map((x) => {
                    const Icon = x.id === "90" ? BatteryFull : x.id === "80" ? BatteryMedium : BatteryLow;
                    return (
                      <Chip key={x.id} on={battery === x.id} onClick={() => setBattery(x.id)}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" /> {x.label}
                        </span>
                      </Chip>
                    );
                  })}
                </div>
              </Step>
            )}
            <Step n={(m.variants ? 5 : 4) + (hasBattery(cat) ? 1 : 0)} title="Комплектность">
              <div className="flex flex-wrap gap-2">
                {accessories.map((a) => (
                  <Chip key={a.id} on={acc.includes(a.id)} onClick={() => setAcc((s) => (s.includes(a.id) ? s.filter((x) => x !== a.id) : [...s, a.id]))}>
                    {a.label}
                  </Chip>
                ))}
              </div>
            </Step>
          </Reveal>

          <Reveal delay={0.1} className="lg:sticky lg:top-28">
            <div className="glass-strong relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
              <div aria-hidden className="hairline absolute inset-x-10 top-0" />
              <AnimatePresence mode="wait" initial={false}>
                {step === "calc" ? (
                  <motion.div key="calc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className="flex items-center gap-4">
                      <img src={`/fallback/${cat}.png`} alt="" className="h-16 w-16 object-contain" />
                      <div>
                        <p className="text-xs text-platinum/50">{b.name}</p>
                        <p className="font-display text-2xl leading-tight text-white">{m.name}</p>
                        {v && <p className="text-xs text-platinum/50">{v.label}</p>}
                      </div>
                    </div>
                    <Segmented
                      id="device-mode"
                      className="mt-6"
                      value={mode}
                      onChange={setMode}
                      options={[
                        { value: "pledge", label: "Залог" },
                        { value: "buyout", label: "Выкуп" },
                      ]}
                    />
                    <p className="mt-7 text-[10px] font-semibold tracking-[0.22em] text-champagne uppercase">Предварительная оценка</p>
                    <p className="mt-2 font-display text-[2.1rem] leading-tight text-gold sm:text-4xl">
                      <AnimatedNumber value={q.min} format={fmt} />
                      <span className="mx-2 text-platinum/30">—</span>
                      <AnimatedNumber value={q.max} format={fmt} />
                    </p>
                    <div className="mt-5 space-y-2 text-sm text-platinum/60">
                      <div className="flex justify-between">
                        <span>Рыночная стоимость</span>
                        <span className="tabular-nums text-white">{fmt(q.market)}</span>
                      </div>
                      {mode === "pledge" && (
                        <div className="flex justify-between">
                          <span>Плата / месяц</span>
                          <span className="tabular-nums text-white">≈ {fmt(q.monthlyFee)}</span>
                        </div>
                      )}
                    </div>
                    <Button size="lg" className="mt-7 w-full" onClick={() => setStep("form")}>
                      Получить предложение <ArrowRight className="h-4 w-4" />
                    </Button>
                    <p className="mt-3 text-center text-[11px] text-platinum/40">Итоговая цена — после проверки устройства</p>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <button type="button" onClick={() => setStep("calc")} className="mb-5 text-xs text-platinum/50 hover:text-liquid">
                      ← Изменить параметры
                    </button>
                    <p className="font-display text-xl text-white">{summary}</p>
                    <p className="mb-6 text-sm text-platinum/60">
                      {cond.label} · <span className="text-liquid">{fmt(q.min)} – {fmt(q.max)}</span>
                    </p>
                    <RequestForm
                      branches={branches}
                      payload={{
                        category: cat,
                        kind: "device",
                        mode,
                        summary,
                        details: {
                          brand: b.name,
                          model: m.name,
                          variant: v?.label ?? null,
                          condition: cond.label,
                          battery: hasBattery(cat) ? bat.label : null,
                          accessories: accessories.filter((a) => acc.includes(a.id)).map((a) => a.label),
                        },
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
      </div>
    </section>
  );
}
