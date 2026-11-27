import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)} aria-label={`${site.name} — на главную`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={site.logo} alt="" width={40} height={40} className="h-10 w-10 transition-transform duration-700 group-hover:rotate-[30deg]" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-semibold tracking-[0.22em] text-white">{site.name}</span>
          <span className="mt-1 text-[9px] font-semibold tracking-[0.36em] text-champagne/80 uppercase">{site.descriptor}</span>
        </span>
      )}
    </Link>
  );
}
