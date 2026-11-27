"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-semibold tracking-wide transition-[background,color,box-shadow,border-color] duration-300 ease-[var(--ease-lux)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-liquid/60 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        gold: "text-obsidian bg-[linear-gradient(110deg,#c9a35a,#f3d58a_45%,#fff1c9_55%,#d6b56d)] bg-[length:220%_100%] bg-[position:0%_0] hover:bg-[position:100%_0] shadow-[0_10px_40px_-10px_rgba(243,213,138,0.55),inset_0_1px_0_rgba(255,255,255,0.6)]",
        glass:
          "glass text-white hover:border-liquid/50 hover:text-liquid hover:shadow-[0_0_0_1px_rgba(243,213,138,0.25),0_20px_50px_-20px_rgba(243,213,138,0.35)]",
        ghost: "text-platinum/80 hover:text-white hover:bg-white/5",
        outline: "border border-white/15 text-white hover:border-liquid/60 hover:text-liquid",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-[15px]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "gold", size: "md" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Magnetic hover (pointer devices only). */
  magnetic?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, magnetic = false, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  const inner = (
    <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </Comp>
  );
  if (!magnetic) return inner;
  return <Magnetic>{inner}</Magnetic>;
});

export function Magnetic({ children, strength = 0.28 }: { children: React.ReactNode; strength?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  return (
    <motion.span
      className="inline-flex"
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

export { buttonVariants };
