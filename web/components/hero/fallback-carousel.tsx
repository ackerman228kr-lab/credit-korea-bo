"use client";

/* eslint-disable @next/next/no-img-element */
import type { Category } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * CSS-3D ring of pre-rendered product images. Used when WebGL is unavailable
 * and as a first paint while the 3D scene boots. Same interactions as the 3D ring.
 */
export function FallbackCarousel({
  items,
  target,
  onSelect,
  onOpen,
  className,
}: {
  items: Category[];
  target: number;
  onSelect: (i: number) => void;
  onOpen: (i: number) => void;
  className?: string;
}) {
  const n = items.length;
  const step = 360 / n;
  const active = ((Math.round(target) % n) + n) % n;
  return (
    <div className={cn("absolute inset-0 flex items-center justify-center [perspective:1400px]", className)}>
      <div
        className="relative h-[42vmin] w-[42vmin] transition-transform duration-[900ms] ease-[var(--ease-lux)] [transform-style:preserve-3d]"
        style={{ transform: `translateZ(-46vmin) rotateY(${-target * step}deg)` }}
      >
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            onClick={() => (i === active ? onOpen(i) : onSelect(i))}
            aria-label={it.label}
            className="absolute inset-0 [backface-visibility:hidden]"
            style={{ transform: `rotateY(${i * step}deg) translateZ(46vmin) scale(${i === active ? 1.25 : 0.85})`, opacity: i === active ? 1 : 0.8 }}
          >
            <img src={`/fallback/${it.id}.png`} alt={it.description} className="h-full w-full object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.7)]" />
          </button>
        ))}
      </div>
    </div>
  );
}
