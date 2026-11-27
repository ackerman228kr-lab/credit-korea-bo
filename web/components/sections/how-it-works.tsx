"use client";

import { motion } from "framer-motion";
import { Building2, ClipboardList, Gem, HandCoins, Sparkles } from "lucide-react";
import { SectionHeading, TiltCard, ease } from "@/components/ui/motion";

const steps = [
  { icon: Gem, title: "Выберите имущество", text: "Золото, часы, смартфон, ноутбук, планшет или другая техника." },
  { icon: ClipboardList, title: "Заполните характеристики", text: "Проба и вес или модель, память, состояние и комплект." },
  { icon: Sparkles, title: "Получите предварительную оценку", text: "Мгновенный расчёт по актуальным ценам — без звонков." },
  { icon: Building2, title: "Посетите отделение", text: "Эксперт проверит вещь за 15 минут в приватной зоне." },
  { icon: HandCoins, title: "Получите предложение", text: "Деньги сразу — займ под залог или выкуп." },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading eyebrow="Процесс" title={<>Пять шагов до <span className="text-gold italic">решения</span></>}>
          Прозрачно, конфиденциально и без лишних визитов.
        </SectionHeading>
      </div>
      <div className="relative mt-14">
        <div aria-hidden className="hairline absolute top-[52px] right-0 left-0 hidden lg:block" />
        <ol className="mx-auto flex max-w-7xl snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 [scrollbar-width:none] lg:grid lg:grid-cols-5 lg:overflow-visible">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 40, rotateX: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.9, ease, delay: i * 0.1 }}
              className="w-[78%] shrink-0 snap-center sm:w-[44%] lg:w-auto"
            >
              <TiltCard className="glass h-full rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-liquid/25 to-champagne/5 ring-1 ring-liquid/30">
                    <s.icon className="h-5 w-5 text-liquid" />
                  </span>
                  <span className="font-display text-4xl text-white/10">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className="mt-6 text-lg font-semibold text-white">{s.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-platinum/60">{s.text}</p>
              </TiltCard>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
