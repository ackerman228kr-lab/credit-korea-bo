"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/lib/site";

/** Minimal brand intro, shown once per session. */
export function Loader() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (/^\/(admin|render)/.test(window.location.pathname)) return;
    try {
      if (sessionStorage.getItem("intro")) return;
      sessionStorage.setItem("intro", "1");
    } catch {}
    setShow(true);
    const t = setTimeout(() => setShow(false), 1900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-obsidian"
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
          aria-hidden
        >
          <div className="flex flex-col items-center">
            <motion.img
              src={site.logo}
              alt=""
              className="h-28 w-28 rounded-full shadow-[0_0_60px_-10px_rgba(225,20,28,0.6)]"
              initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="mt-8 h-px w-40 origin-left bg-gradient-to-r from-transparent via-liquid to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />
            <motion.p
              className="mt-5 text-xs font-semibold tracking-[0.5em] text-champagne uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {site.name} · {site.descriptor}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
