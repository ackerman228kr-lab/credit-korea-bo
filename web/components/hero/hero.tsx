"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, ShieldCheck, Timer } from "lucide-react";
import { categories } from "@/lib/categories";
import type { Settings } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { useInView, useQuality, useReducedMotion, useWebGL } from "@/hooks/use-env";
import { Button } from "@/components/ui/button";
import { ease } from "@/components/ui/motion";
import type { DragState } from "@/components/three/carousel-scene";
import { FallbackCarousel } from "./fallback-carousel";

const CarouselScene = dynamic(() => import("@/components/three/carousel-scene"), { ssr: false });

const N = categories.length;
const mod = (a: number) => ((a % N) + N) % N;

export function goToTool(categoryId: string) {
  window.dispatchEvent(new CustomEvent("valuate", { detail: categoryId }));
  document.getElementById(categoryId === "gold" ? "gold" : "devices")?.scrollIntoView({ behavior: "smooth" });
}

export function Hero({ settings }: { settings: Settings }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const quality = useQuality();
  const section = useRef<HTMLElement>(null);
  const inView = useInView(section);

  const [target, setTarget] = useState(0);
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState(false);
  const [focusing, setFocusing] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const live = useRef(0);
  const drag = useRef<DragState>({ active: false, offset: 0, moved: 0 });
  const lastWheel = useRef(0);

  const active = mod(Math.round(target));
  const cat = categories[active];

  const select = useCallback((i: number) => {
    setTarget((t) => {
      let d = mod(i - mod(Math.round(t)));
      if (d > N / 2) d -= N;
      return Math.round(t) + d;
    });
  }, []);
  const next = useCallback(() => setTarget((t) => Math.round(t) + 1), []);
  const prev = useCallback(() => setTarget((t) => Math.round(t) - 1), []);

  const open = useCallback(
    (i: number) => {
      const id = categories[i].id;
      if (reduced) return router.push(`/categories/${id}`);
      setFocusing(true);
      setTimeout(() => router.push(`/categories/${id}`), 650);
    },
    [reduced, router],
  );

  // slow, elegant auto-advance with hover / interaction / visibility pause
  useEffect(() => {
    if (reduced || hover || interacting || focusing || !inView) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") setTarget((t) => Math.round(t) + 1);
    }, 4800);
    return () => clearInterval(id);
  }, [reduced, hover, interacting, focusing, inView]);

  // resume autoplay a while after the last manual interaction
  useEffect(() => {
    if (!interacting) return;
    const t = setTimeout(() => setInteracting(false), 7000);
    return () => clearTimeout(t);
  }, [interacting, target]);

  // drag / swipe (window listeners so R3F click events keep working)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startOffset = live.current;
    const width = e.currentTarget.getBoundingClientRect().width;
    const perItem = Math.max(160, width / 4.5);
    let lastX = startX;
    let lastT = performance.now();
    let vx = 0;
    drag.current = { active: false, offset: startOffset, moved: 0 };

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
      if (drag.current.moved > 6) {
        drag.current.active = true;
        drag.current.offset = startOffset - dx / perItem;
        const now = performance.now();
        const dt = now - lastT;
        if (dt > 8) {
          vx = vx * 0.5 + ((ev.clientX - lastX) / dt) * 0.5;
          lastX = ev.clientX;
          lastT = now;
        }
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (drag.current.active) {
        const stale = performance.now() - lastT > 120; // finger stopped before release
        const fling = stale ? 0 : Math.max(-1.5, Math.min(1.5, ((-vx * 1000) / perItem) * 0.15));
        setTarget(Math.round(drag.current.offset + fling));
        setInteracting(true);
      }
      drag.current.active = false;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  // mouse-wheel navigation over the stage (vertical only when the page is at the top,
  // so scrolling back up through the hero is never hijacked)
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horizontal && window.scrollY > 40) return;
      const delta = horizontal ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 4) return;
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel.current < 550) return;
      lastWheel.current = now;
      setInteracting(true);
      setTarget((t) => Math.round(t) + (delta > 0 ? 1 : -1));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") (next(), setInteracting(true));
    else if (e.key === "ArrowLeft") (prev(), setInteracting(true));
    else if (e.key === "Enter") open(active);
    else return;
    e.preventDefault();
  };

  const use3d = webgl === true;

  return (
    <section ref={section} id="showroom" className="noise relative h-[max(100svh,820px)] w-full overflow-hidden bg-obsidian lg:h-[100svh] lg:min-h-[720px]" aria-label="3D шоурум">
      {/* stage */}
      <div
        ref={stage}
        className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerLeave={() => setHover(false)}
        role="region"
        aria-roledescription="карусель"
        aria-label="Категории имущества — перетаскивайте, листайте колесом или используйте стрелки"
        tabIndex={0}
        onKeyDown={onKey}
      >
        {use3d && (
          <CarouselScene
            items={categories}
            target={target}
            drag={drag}
            live={live}
            focusing={focusing}
            reducedMotion={reduced}
            quality={quality}
            onSelect={(i) => (select(i), setInteracting(true))}
            onOpen={open}
            onReady={() => setTimeout(() => setReady(true), 250)}
            active={inView}
          />
        )}
        {(webgl === false || (use3d && !ready)) && (
          <FallbackCarousel
            items={categories}
            target={target}
            onSelect={select}
            onOpen={open}
            className={use3d ? "pointer-events-none opacity-60 blur-[1px]" : ""}
          />
        )}
      </div>

      {/* vignette + light */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_30%,rgba(8,9,12,0.55)_70%,#08090C_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-obsidian via-obsidian/70 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />

      {/* headline */}
      <div className="pointer-events-none relative z-10 mx-auto flex max-w-7xl flex-col items-center px-5 pt-24 text-center sm:pt-32 lg:items-start lg:px-8 lg:text-left">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.5 }}
          className="mb-4 hidden items-center gap-3 text-[10px] sm:flex font-semibold tracking-[0.4em] text-champagne uppercase sm:text-[11px]"
        >
          <span className="h-px w-8 bg-champagne/60" /> Ломбард нового поколения
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.3, ease, delay: 0.6 }}
          className="font-display text-[2.5rem] leading-[0.98] font-medium text-white sm:text-6xl lg:max-w-[12ch] lg:text-7xl xl:text-[5.4rem]"
        >
          Ваши ценности. <span className="text-gold animate-shimmer italic">Ваши возможности.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.85 }}
          className="mt-4 max-w-md text-sm leading-relaxed text-platinum/70 sm:mt-5 sm:text-base"
        >
          Оценка золота, техники и ценных вещей в одном пространстве.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 1 }}
          className="pointer-events-auto mt-6 flex w-full max-w-sm flex-col gap-2.5 sm:mt-7 sm:w-auto sm:max-w-none sm:flex-row sm:gap-3"
        >
          <Button size="lg" magnetic className="h-12 w-full sm:h-14 sm:w-auto" onClick={() => goToTool(cat.id)}>
            Оценить имущество <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
          <Button asChild size="lg" variant="glass" magnetic className="h-12 w-full sm:h-14 sm:w-auto">
            <Link href="/offers">Посмотреть наши предложения</Link>
          </Button>
        </motion.div>
      </div>

      {/* floating glass panels (desktop) */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, ease, delay: 1.2 }}
        className="glass pointer-events-auto absolute top-32 right-8 z-10 hidden w-60 animate-float rounded-2xl p-5 2xl:block"
      >
        <p className="text-[10px] font-semibold tracking-[0.25em] text-platinum/50 uppercase">Золото 999.9 · за грамм</p>
        <p className="mt-2 font-display text-3xl text-gold">{formatMoney(settings.goldPricePerGram, settings.currency)}</p>
        <svg viewBox="0 0 200 40" className="mt-3 h-10 w-full" aria-hidden>
          <defs>
            <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#F3D58A" stopOpacity=".35" />
              <stop offset="1" stopColor="#F3D58A" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 32 L20 28 L40 30 L60 22 L80 24 L100 16 L120 19 L140 12 L160 14 L180 7 L200 9 L200 40 L0 40Z" fill="url(#spark)" />
          <path d="M0 32 L20 28 L40 30 L60 22 L80 24 L100 16 L120 19 L140 12 L160 14 L180 7 L200 9" stroke="#F3D58A" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="mt-3 space-y-2 border-t border-white/8 pt-3 text-xs text-platinum/70">
          <p className="flex items-center gap-2"><Timer className="h-3.5 w-3.5 text-champagne" /> Оценка за 15 минут</p>
          <p className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-champagne" /> Хранение в сейфе</p>
        </div>
        <Link href="/#gold" className="mt-3 inline-flex items-center gap-1 text-xs text-champagne hover:text-liquid">
          Калькулятор золота <ArrowRight className="h-3 w-3" />
        </Link>
      </motion.div>
      {/* active category + controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-7xl flex-col items-stretch gap-3 px-4 pb-4 sm:px-8 sm:pb-8 md:flex-row md:items-end md:justify-between">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            transition={{ duration: 0.55, ease }}
            className="glass pointer-events-auto rounded-3xl p-4 sm:p-5 md:w-[380px]"
            aria-live="polite"
          >
            <div className="flex items-baseline justify-between">
              <p className="font-display text-2xl tracking-[0.12em] text-white sm:text-3xl">{cat.title}</p>
              <p className="text-xs tabular-nums text-platinum/40">
                {String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
              </p>
            </div>
            <p className="mt-1.5 text-sm text-platinum/70">{cat.description}</p>
            <div className="mt-3 flex gap-2 sm:mt-4">
              <Button size="sm" onClick={() => open(active)}>
                Открыть <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => goToTool(cat.id)}>
                Рассчитать
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-auto flex items-center justify-between gap-3 md:flex-col md:items-end">
          <div className="flex gap-1.5" role="tablist" aria-label="Категории">
            {categories.map((c, i) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={i === active}
                aria-label={c.label}
                onClick={() => (select(i), setInteracting(true))}
                className="group relative h-8 px-1"
              >
                <span className={`block h-[3px] rounded-full transition-all duration-500 ${i === active ? "w-9 bg-liquid" : "w-4 bg-white/25 group-hover:bg-white/50"}`} />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="glass" size="icon" aria-label="Предыдущая категория" onClick={() => (prev(), setInteracting(true))}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="glass" size="icon" aria-label="Следующая категория" onClick={() => (next(), setInteracting(true))}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <a
        href="#categories"
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] tracking-[0.3em] text-platinum/40 uppercase transition hover:text-liquid lg:flex"
      >
        Листайте
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}
