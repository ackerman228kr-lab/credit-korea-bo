import Link from "next/link";
import { categories } from "@/lib/categories";
import { nav, site } from "@/lib/site";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/8 bg-graphite/40">
      <div className="hairline absolute inset-x-0 top-0" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-platinum/60">{site.description}</p>
        </div>
        <div>
          <p className="label">Категории</p>
          <ul className="space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/categories/${c.id}`} className="text-platinum/70 transition hover:text-liquid">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label">Навигация</p>
          <ul className="space-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-platinum/70 transition hover:text-liquid">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className="text-platinum/70 transition hover:text-liquid">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/6">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-platinum/40 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {site.name}. Все права защищены.</span>
          <span>Оценка на сайте предварительная. Итоговое предложение — после осмотра в отделении.</span>
        </div>
      </div>
    </footer>
  );
}
