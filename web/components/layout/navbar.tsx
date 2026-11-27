"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/render")) return null;

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4"
      >
        <nav
          aria-label="Основная навигация"
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between rounded-full px-3 py-2 transition-all duration-500 sm:px-5",
            scrolled ? "glass-strong" : "border border-transparent",
          )}
        >
          <Logo />
          <ul className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative rounded-full px-4 py-2 text-[13px] font-medium text-platinum/75 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-[13px] text-platinum/80 transition hover:text-liquid md:flex"
            >
              <Phone className="h-4 w-4" />
              {site.phone}
            </a>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/#gold">Оценить</Link>
            </Button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              className="glass flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-obsidian/80 backdrop-blur-2xl lg:hidden"
          >
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
              className="flex h-full flex-col justify-center gap-2 px-8"
            >
              {nav.map((item) => (
                <motion.li key={item.href} variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 font-display text-4xl text-white transition hover:text-liquid"
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="mt-8">
                <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} className="text-lg text-champagne">
                  {site.phone}
                </a>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
