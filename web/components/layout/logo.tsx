import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** "MilArt" wordmark with the red "A" from the logo. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-sans font-semibold tracking-[0.04em] text-white", className)}>
      Mil<span className="text-ruby">A</span>rt
    </span>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)} aria-label={`${site.name} ${site.descriptor} — на главную`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={site.logo}
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 rounded-full shadow-[0_0_24px_-6px_rgba(225,20,28,0.55)] transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-110"
      />
      {!compact && (
        <span className="flex flex-col leading-none">
          <Wordmark className="text-xl" />
          <span className="mt-1 text-[9px] font-semibold tracking-[0.42em] text-champagne uppercase">{site.descriptor}</span>
        </span>
      )}
    </Link>
  );
}
