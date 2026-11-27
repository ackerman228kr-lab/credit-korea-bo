import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { site } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/motion";

export function Cta() {
  return (
    <section className="px-5 py-16">
      <Reveal className="glass-strong noise relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] px-6 py-16 text-center sm:px-16">
        <div aria-hidden className="absolute -top-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-liquid/20 blur-[100px]" />
        <p className="relative text-[11px] font-semibold tracking-[0.35em] text-champagne uppercase">Конфиденциально · Быстро · Честно</p>
        <h2 className="relative mt-5 font-display text-4xl leading-tight text-white sm:text-6xl">
          Узнайте стоимость <span className="text-gold italic">прямо сейчас</span>
        </h2>
        <div className="relative mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" magnetic>
            <Link href="/#gold">Рассчитать онлайн</Link>
          </Button>
          <Button asChild size="lg" variant="glass" magnetic>
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> Написать в WhatsApp
            </a>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
