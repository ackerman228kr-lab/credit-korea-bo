"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export const ease = [0.22, 1, 0.36, 1] as const;

/** Fade/slide-in on scroll. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  ...rest
}: { children: React.ReactNode; delay?: number; y?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease, delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Card with 3D tilt + specular glare following the pointer. */
export function TiltCard({ children, className, max = 8 }: { children: React.ReactNode; className?: string; max?: number }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 180, damping: 18 });
  const glare = useTransform([mx, my] as never, ([x, y]: number[]) =>
    `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, rgba(243,213,138,0.16), transparent 45%)`,
  );
  return (
    <motion.div
      className={cn("relative [transform-style:preserve-3d]", className)}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
    >
      {children}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: glare }} />
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className={cn("mb-5 flex items-center gap-3 text-[11px] font-semibold tracking-[0.32em] text-champagne uppercase", align === "center" && "justify-center")}>
        <span className="h-px w-8 bg-champagne/60" />
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl leading-[1.05] font-medium text-white sm:text-5xl md:text-6xl">{title}</h2>
      {children && <p className="mt-5 text-base leading-relaxed text-platinum/70 sm:text-lg">{children}</p>}
    </Reveal>
  );
}

/** Pill segmented control with an animated gold thumb. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  id,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  id: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" className={cn("relative flex rounded-full border border-white/12 bg-white/[0.04] p-1", className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative z-10 flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-300",
              on ? "text-obsidian" : "text-platinum/70 hover:text-white",
            )}
          >
            {on && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(110deg,#d6b56d,#f3d58a,#d6b56d)] shadow-[0_6px_24px_-6px_rgba(243,213,138,0.6)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Smoothly animated number. */
export function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 120, damping: 22 });
  const [text, setText] = React.useState(() => format(value));
  React.useEffect(() => {
    mv.set(value);
  }, [mv, value]);
  React.useEffect(() => spring.on("change", (v) => setText(format(v))), [spring, format]);
  return <span className="tabular-nums">{text}</span>;
}
