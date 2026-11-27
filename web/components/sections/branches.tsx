"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import type { Branch } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Reveal, SectionHeading } from "@/components/ui/motion";

/** Gold constellation of all branches — normalised lat/lng projection. */
function Constellation({ branches, active, onPick }: { branches: Branch[]; active: number; onPick: (i: number) => void }) {
  if (branches.length < 2) return null;
  const lats = branches.map((b) => b.lat);
  const lngs = branches.map((b) => b.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const pt = (b: Branch) => ({
    x: 30 + ((b.lng - minLng) / (maxLng - minLng || 1)) * 240,
    y: 20 + (1 - (b.lat - minLat) / (maxLat - minLat || 1)) * 80,
  });
  const pts = branches.map(pt);
  return (
    <svg viewBox="0 0 300 120" className="h-24 w-full" aria-hidden>
      <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="rgba(214,181,109,0.3)" strokeDasharray="3 4" />
      {pts.map((p, i) => (
        <g key={i} onClick={() => onPick(i)} className="cursor-pointer">
          {i === active && (
            <circle cx={p.x} cy={p.y} r="6" fill="none" stroke="#F3D58A">
              <animate attributeName="r" from="5" to="16" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.9" to="0" dur="1.8s" repeatCount="indefinite" />
            </circle>
          )}
          <circle cx={p.x} cy={p.y} r={i === active ? 5 : 3.5} fill={i === active ? "#F3D58A" : "#C9CED6"} />
          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fill={i === active ? "#F3D58A" : "rgba(201,206,214,0.6)"}>
            {branches[i].city}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** `embedMap={false}` swaps the Google Maps frame for a static panel (e.g. sandboxed previews). */
export function Branches({ branches, embedMap = true }: { branches: Branch[]; embedMap?: boolean }) {
  const [active, setActive] = useState(0);
  const b = branches[active];

  return (
    <section id="branches" className="relative scroll-mt-24 px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Отделения" title={<>Приватные зоны <span className="text-gold italic">оценки</span></>}>
          Выберите ближайшее отделение — проложим маршрут и ответим в WhatsApp.
        </SectionHeading>

        {branches.length === 0 ? (
          <p className="mt-10 text-platinum/50">Список отделений скоро появится.</p>
        ) : (
          <div className="mt-14 grid gap-6 lg:grid-cols-[400px_1fr]">
            <Reveal className="flex flex-col gap-3">
              <div className="glass rounded-3xl px-4 pt-3">
                <Constellation branches={branches} active={active} onPick={setActive} />
              </div>
              {branches.map((x, i) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                  className={cn(
                    "rounded-3xl border p-5 text-left transition-all duration-500",
                    i === active ? "border-liquid/50 bg-liquid/[0.07] shadow-[0_0_50px_-20px_rgba(243,213,138,0.6)]" : "glass hover:border-white/25",
                  )}
                >
                  <p className="text-[10px] font-semibold tracking-[0.25em] text-champagne uppercase">{x.city}</p>
                  <p className="mt-1 font-display text-2xl text-white">{x.name}</p>
                  <p className="mt-2 flex items-start gap-2 text-sm text-platinum/60">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {x.address}
                  </p>
                </button>
              ))}
            </Reveal>

            <Reveal delay={0.1} className="glass relative min-h-[460px] overflow-hidden rounded-[2rem]">
              {!embedMap ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(214,181,109,0.12),transparent_60%)]">
                  <div className="w-full max-w-md px-6 pb-40 opacity-80">
                    <Constellation branches={branches} active={active} onPick={setActive} />
                  </div>
                </div>
              ) : (
              <AnimatePresence mode="wait">
                <motion.iframe
                  key={b.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  title={`Карта: ${b.name}`}
                  src={`https://maps.google.com/maps?q=${b.lat},${b.lng}&z=15&hl=ru&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full [filter:invert(92%)_hue-rotate(180deg)_saturate(0.35)_brightness(0.85)_contrast(1.1)]"
                />
              </AnimatePresence>
              )}
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(8,9,12,0.65))]" />
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-champagne/10 mix-blend-color" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.5 }}
                  className="glass-strong absolute inset-x-4 bottom-4 rounded-3xl p-5 sm:right-auto sm:left-6 sm:bottom-6 sm:w-[360px]"
                >
                  <p className="font-display text-2xl text-white">{b.name}</p>
                  <div className="mt-3 space-y-2 text-sm text-platinum/70">
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-champagne" /> {b.hours}
                    </p>
                    <a href={`tel:${b.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2 hover:text-liquid">
                      <Phone className="h-4 w-4 text-champagne" /> {b.phone}
                    </a>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`} target="_blank" rel="noreferrer">
                        <Navigation className="h-3.5 w-3.5" /> Маршрут
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="glass">
                      <a href={`https://wa.me/${b.whatsapp}`} target="_blank" rel="noreferrer">
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <a href={`tel:${b.phone.replace(/[^+\d]/g, "")}`}>
                        <Phone className="h-3.5 w-3.5" /> Позвонить
                      </a>
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
