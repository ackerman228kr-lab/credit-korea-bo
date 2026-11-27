"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, ExternalLink, Inbox, LogOut, Pencil, Plus, Settings2, Store, Trash2, X } from "lucide-react";
import type { Branch, Offer, RequestStatus, Settings, ValuationRequest } from "@/lib/types";
import { categories } from "@/lib/categories";
import { site } from "@/lib/site";
import { cn, formatMoney, TROY_OUNCE_GRAMS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { deleteBranch, deleteOffer, deleteRequest, logout, saveBranch, saveOffer, saveSettings, updateRequest } from "@/app/admin/actions";

type Req = ValuationRequest & { photoUrls: string[] };
type Tab = "requests" | "prices" | "branches" | "offers";

const detailLabels: Record<string, string> = {
  brand: "Бренд",
  model: "Модель",
  variant: "Характеристики",
  condition: "Состояние",
  battery: "Аккумулятор",
  accessories: "Комплект",
  purity: "Проба",
  grams: "Вес, г",
  pricePerGram: "Цена за грамм",
};
const contactLabels = { phone: "Звонок", whatsapp: "WhatsApp", telegram: "Telegram" } as const;

const statusMeta: Record<RequestStatus, { label: string; cls: string }> = {
  new: { label: "Новая", cls: "bg-liquid/15 text-liquid ring-liquid/40" },
  contacted: { label: "Связались", cls: "bg-sky-400/10 text-sky-300 ring-sky-400/30" },
  done: { label: "Завершена", cls: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30" },
  rejected: { label: "Отклонена", cls: "bg-white/5 text-platinum/50 ring-white/15" },
};

function useAction() {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const run = (fn: () => Promise<unknown>, after?: () => void) =>
    start(async () => {
      setError("");
      try {
        await fn();
        after?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка");
      }
    });
  return { pending, error, run };
}

export function Dashboard({
  settings,
  branches,
  offers,
  requests,
  backend,
}: {
  settings: Settings;
  branches: Branch[];
  offers: Offer[];
  requests: Req[];
  backend: string;
}) {
  const [tab, setTab] = useState<Tab>("requests");
  const fresh = requests.filter((r) => r.status === "new").length;
  const tabs = [
    { id: "requests" as const, label: "Заявки", icon: Inbox, badge: fresh },
    { id: "prices" as const, label: "Цены и ставки", icon: Settings2 },
    { id: "branches" as const, label: "Отделения", icon: Building2 },
    { id: "offers" as const, label: "Предложения", icon: Store },
  ];

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-4 lg:flex-row lg:p-8">
      <aside className="glass-strong flex shrink-0 flex-col rounded-3xl p-4 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:w-64">
        <div className="flex items-center gap-3 px-2 py-2">
          <img src={site.logo} alt="" className="h-10 w-10 rounded-full" />
          <div>
            <p className="text-base font-semibold text-white">
              Mil<span className="text-ruby">A</span>rt
            </p>
            <p className="text-[10px] tracking-[0.2em] text-champagne uppercase">Admin</p>
          </div>
        </div>
        <nav className="mt-6 flex gap-1 overflow-x-auto lg:flex-col">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                tab === t.id ? "bg-liquid/10 text-liquid" : "text-platinum/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              {!!t.badge && <span className="ml-auto rounded-full bg-ruby px-2 text-[11px] font-bold text-white">{t.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto hidden space-y-2 pt-6 lg:block">
          <p className="px-3 text-[11px] text-platinum/40">Хранилище: {backend}</p>
          <Link href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-platinum/60 hover:text-white">
            <ExternalLink className="h-4 w-4" /> Открыть сайт
          </Link>
          <form action={logout}>
            <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-platinum/60 hover:text-white">
              <LogOut className="h-4 w-4" /> Выйти
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            {tab === "requests" && <Requests requests={requests} settings={settings} branches={branches} />}
            {tab === "prices" && <Prices settings={settings} />}
            {tab === "branches" && <Branches branches={branches} />}
            {tab === "offers" && <Offers offers={offers} settings={settings} />}
          </motion.div>
        </AnimatePresence>
        <form action={logout} className="mt-8 lg:hidden">
          <Button variant="outline" size="sm">
            <LogOut className="h-4 w-4" /> Выйти
          </Button>
        </form>
      </main>
    </div>
  );
}

function Header({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <h1 className="font-display text-4xl text-white">{title}</h1>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-[10px] font-semibold tracking-[0.2em] text-platinum/50 uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl text-white">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------ requests */

function Requests({ requests, settings, branches }: { requests: Req[]; settings: Settings; branches: Branch[] }) {
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const { pending, error, run } = useAction();
  const list = useMemo(() => (filter === "all" ? requests : requests.filter((r) => r.status === filter)), [requests, filter]);
  const week = requests.filter((r) => Date.now() - new Date(r.createdAt).getTime() < 7 * 864e5).length;
  const pipeline = requests.filter((r) => r.status !== "rejected" && r.status !== "done").reduce((s, r) => s + (r.estimateMin + r.estimateMax) / 2, 0);
  const fmt = (n: number) => formatMoney(n, settings.currency);

  return (
    <>
      <Header title="Заявки на оценку" />
      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Новые" value={String(requests.filter((r) => r.status === "new").length)} />
        <Stat label="За 7 дней" value={String(week)} />
        <Stat label="Всего" value={String(requests.length)} />
        <Stat label="В работе (оценка)" value={fmt(pipeline)} />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "new", "contacted", "done", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn("rounded-full border px-4 py-1.5 text-sm", filter === f ? "border-liquid/60 bg-liquid/10 text-liquid" : "border-white/10 text-platinum/60")}
          >
            {f === "all" ? "Все" : statusMeta[f].label}
          </button>
        ))}
      </div>
      {error && <p className="mb-3 text-sm text-red-300">{error}</p>}
      <div className="glass overflow-hidden rounded-3xl">
        {list.length === 0 && <p className="p-10 text-center text-platinum/50">Заявок пока нет.</p>}
        {list.map((r) => {
          const isOpen = open === r.id;
          const branch = branches.find((b) => b.id === r.branchId);
          return (
            <div key={r.id} className={cn("border-b border-white/6 last:border-0", pending && "opacity-70")}>
              <button onClick={() => setOpen(isOpen ? null : r.id)} className="grid w-full grid-cols-[1fr_auto] gap-3 p-4 text-left hover:bg-white/[0.02] md:grid-cols-[150px_1fr_200px_120px] md:items-center">
                <span className="text-xs text-platinum/50">{new Date(r.createdAt).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}</span>
                <span className={cn("justify-self-end rounded-full px-2.5 py-1 text-[11px] ring-1 md:order-last", statusMeta[r.status].cls)}>{statusMeta[r.status].label}</span>
                <span className="col-span-2 md:col-span-1">
                  <span className="block font-medium text-white">{r.summary}</span>
                  <span className="text-xs text-platinum/50">
                    {categories.find((c) => c.id === r.category)?.label} · {r.mode === "pledge" ? "Залог" : "Выкуп"} · {r.name} · {r.phone}
                  </span>
                </span>
                <span className="col-span-2 text-sm text-liquid tabular-nums md:col-span-1">
                  {fmt(r.estimateMin)} – {fmt(r.estimateMax)}
                </span>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid gap-6 border-t border-white/6 bg-black/20 p-5 md:grid-cols-2">
                      <div className="space-y-2 text-sm">
                        {Object.entries(r.details).map(([k, v]) =>
                          v === null || v === "" || (Array.isArray(v) && !v.length) ? null : (
                            <p key={k} className="flex justify-between gap-4">
                              <span className="text-platinum/50">{detailLabels[k] ?? k}</span>
                              <span className="text-right text-white">{Array.isArray(v) ? v.join(", ") : String(v)}</span>
                            </p>
                          ),
                        )}
                        <p className="flex justify-between gap-4">
                          <span className="text-platinum/50">Связь</span>
                          <span className="text-white">{contactLabels[r.contact] ?? r.contact}</span>
                        </p>
                        {branch && (
                          <p className="flex justify-between gap-4">
                            <span className="text-platinum/50">Отделение</span>
                            <span className="text-white">{branch.name}</span>
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 pt-3">
                          <Button asChild size="sm" variant="glass">
                            <a href={`tel:${r.phone.replace(/[^+\d]/g, "")}`}>Позвонить</a>
                          </Button>
                          <Button asChild size="sm" variant="glass">
                            <a href={`https://wa.me/${r.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                              WhatsApp
                            </a>
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {r.photoUrls.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {r.photoUrls.map((u, i) => (
                              <a key={i} href={u} target="_blank" rel="noreferrer">
                                <img src={u} alt="" className="h-20 w-20 rounded-lg object-cover ring-1 ring-white/10" />
                              </a>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {(Object.keys(statusMeta) as RequestStatus[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => run(() => updateRequest(r.id, { status: s }))}
                              className={cn("rounded-full px-3 py-1 text-xs ring-1", r.status === s ? statusMeta[s].cls : "text-platinum/50 ring-white/10 hover:text-white")}
                            >
                              {statusMeta[s].label}
                            </button>
                          ))}
                        </div>
                        <textarea
                          defaultValue={r.note ?? ""}
                          placeholder="Заметка менеджера…"
                          className="field min-h-20"
                          onBlur={(e) => e.target.value !== (r.note ?? "") && run(() => updateRequest(r.id, { note: e.target.value }))}
                        />
                        <button
                          onClick={() => confirm("Удалить заявку?") && run(() => deleteRequest(r.id))}
                          className="flex items-center gap-2 text-xs text-red-300/70 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Удалить
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* --------------------------------------------------------------- prices */

function Field({ label, name, defaultValue, suffix, step = "any" }: { label: string; name: string; defaultValue: string | number; suffix?: string; step?: string }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <div className="relative">
        <input id={name} name={name} defaultValue={defaultValue} type="number" step={step} required className="field pr-12" />
        {suffix && <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-platinum/40">{suffix}</span>}
      </div>
    </div>
  );
}

function Prices({ settings }: { settings: Settings }) {
  const { pending, error, run } = useAction();
  const [saved, setSaved] = useState(false);
  const [gpg, setGpg] = useState(settings.goldPricePerGram);
  return (
    <>
      <Header title="Цены и ставки" />
      <form
        action={(fd) => run(() => saveSettings(fd), () => (setSaved(true), setTimeout(() => setSaved(false), 2500)))}
        className="glass max-w-3xl space-y-8 rounded-3xl p-6 sm:p-8"
      >
        <div>
          <p className="mb-4 font-display text-2xl text-white">Золото</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="goldPricePerGram">Цена 999.9 за грамм</label>
              <input id="goldPricePerGram" name="goldPricePerGram" type="number" step="any" required value={gpg} onChange={(e) => setGpg(Number(e.target.value))} className="field" />
              <p className="mt-2 text-xs text-platinum/40">≈ {formatMoney(gpg * TROY_OUNCE_GRAMS, settings.currency)} за тройскую унцию</p>
            </div>
            <div>
              <label className="label" htmlFor="currency">Валюта</label>
              <select id="currency" name="currency" defaultValue={settings.currency} className="field">
                <option value="KRW">KRW ₩</option>
                <option value="USD">USD $</option>
                <option value="RUB">RUB ₽</option>
              </select>
            </div>
            <Field label="Залог: доля от стоимости металла" name="goldPledgeRate" defaultValue={Math.round(settings.goldPledgeRate * 100)} suffix="%" />
            <Field label="Выкуп: доля от стоимости металла" name="goldBuyoutRate" defaultValue={Math.round(settings.goldBuyoutRate * 100)} suffix="%" />
          </div>
        </div>
        <div className="hairline" />
        <div>
          <p className="mb-4 font-display text-2xl text-white">Техника и часы</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Залог: доля рынка" name="devicePledgeRate" defaultValue={Math.round(settings.devicePledgeRate * 100)} suffix="%" />
            <Field label="Выкуп: доля рынка" name="deviceBuyoutRate" defaultValue={Math.round(settings.deviceBuyoutRate * 100)} suffix="%" />
            <Field label="Плата за залог / месяц" name="monthlyFeePercent" defaultValue={settings.monthlyFeePercent} suffix="%" />
          </div>
        </div>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={pending}>
            Сохранить
          </Button>
          {saved && <span className="text-sm text-emerald-300">Сохранено — сайт обновлён</span>}
        </div>
      </form>
    </>
  );
}

/* -------------------------------------------------------------- editors */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur sm:items-center" onClick={onClose}>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="font-display text-2xl text-white">{title}</p>
          <button onClick={onClose} aria-label="Закрыть" className="rounded-full p-2 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Text({ label, name, defaultValue, required, type = "text" }: { label: string; name: string; defaultValue?: string | number | null; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="label" htmlFor={`f-${name}`}>{label}</label>
      <input id={`f-${name}`} name={name} type={type} step="any" defaultValue={defaultValue ?? ""} required={required} className="field" />
    </div>
  );
}

function Branches({ branches }: { branches: Branch[] }) {
  const [edit, setEdit] = useState<Partial<Branch> | null>(null);
  const { pending, error, run } = useAction();
  return (
    <>
      <Header title="Отделения">
        <Button size="sm" onClick={() => setEdit({ active: true })}>
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </Header>
      {error && !edit && <p className="mb-3 text-sm text-red-300">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {branches.map((b) => (
          <div key={b.id} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-champagne uppercase">{b.city}</p>
                <p className="font-display text-2xl text-white">{b.name}</p>
              </div>
              {!b.active && <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-platinum/50">Скрыто</span>}
            </div>
            <p className="mt-2 text-sm text-platinum/60">{b.address}</p>
            <p className="text-sm text-platinum/60">{b.hours} · {b.phone}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="glass" onClick={() => setEdit(b)}>
                <Pencil className="h-3.5 w-3.5" /> Изменить
              </Button>
              <Button size="sm" variant="ghost" onClick={() => confirm(`Удалить «${b.name}»?`) && run(() => deleteBranch(b.id))}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {edit && (
          <Modal title={edit.id ? "Редактировать отделение" : "Новое отделение"} onClose={() => setEdit(null)}>
            <form action={(fd) => run(() => saveBranch(fd), () => setEdit(null))} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" defaultValue={edit.id} />
              <Text label="Название" name="name" defaultValue={edit.name} required />
              <Text label="Город" name="city" defaultValue={edit.city} required />
              <div className="sm:col-span-2">
                <Text label="Адрес" name="address" defaultValue={edit.address} required />
              </div>
              <div className="sm:col-span-2">
                <Text label="Часы работы" name="hours" defaultValue={edit.hours} />
              </div>
              <Text label="Телефон" name="phone" defaultValue={edit.phone} />
              <Text label="WhatsApp (цифры)" name="whatsapp" defaultValue={edit.whatsapp} />
              <Text label="Широта" name="lat" type="number" defaultValue={edit.lat} required />
              <Text label="Долгота" name="lng" type="number" defaultValue={edit.lng} required />
              <label className="flex items-center gap-2 text-sm text-platinum/70 sm:col-span-2">
                <input type="checkbox" name="active" defaultChecked={edit.active ?? true} className="accent-[#D6B56D]" /> Показывать на сайте
              </label>
              <p className="text-xs text-platinum/40 sm:col-span-2">Координаты: правый клик по точке в Google Maps → скопировать.</p>
              {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
              <Button type="submit" disabled={pending} className="sm:col-span-2">
                Сохранить
              </Button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

function Offers({ offers, settings }: { offers: Offer[]; settings: Settings }) {
  const [edit, setEdit] = useState<Partial<Offer> | null>(null);
  const { pending, error, run } = useAction();
  return (
    <>
      <Header title="Предложения">
        <Button size="sm" onClick={() => setEdit({ active: true, category: "gold" })}>
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </Header>
      {error && !edit && <p className="mb-3 text-sm text-red-300">{error}</p>}
      <div className="glass overflow-hidden rounded-3xl">
        {offers.length === 0 && <p className="p-10 text-center text-platinum/50">Нет предложений.</p>}
        {offers.map((o) => (
          <div key={o.id} className="flex items-center gap-4 border-b border-white/6 p-4 last:border-0">
            <img src={o.imageUrl || `/fallback/${o.category}.png`} alt="" className="h-14 w-14 shrink-0 object-contain" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-white">{o.title}</p>
              <p className="text-xs text-platinum/50">
                {categories.find((c) => c.id === o.category)?.label} · {o.condition} {!o.active && "· скрыто"}
              </p>
            </div>
            <p className="hidden font-display text-xl text-liquid sm:block">{formatMoney(o.price, settings.currency)}</p>
            <Button size="icon" variant="ghost" aria-label="Изменить" onClick={() => setEdit(o)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" aria-label="Удалить" onClick={() => confirm(`Удалить «${o.title}»?`) && run(() => deleteOffer(o.id))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {edit && (
          <Modal title={edit.id ? "Редактировать предложение" : "Новое предложение"} onClose={() => setEdit(null)}>
            <form action={(fd) => run(() => saveOffer(fd), () => setEdit(null))} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" defaultValue={edit.id} />
              <input type="hidden" name="createdAt" defaultValue={edit.createdAt} />
              <div className="sm:col-span-2">
                <Text label="Название" name="title" defaultValue={edit.title} required />
              </div>
              <div>
                <label className="label" htmlFor="f-category">Категория</label>
                <select id="f-category" name="category" defaultValue={edit.category} className="field">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <Text label={`Цена (${settings.currency})`} name="price" type="number" defaultValue={edit.price} required />
              <div className="sm:col-span-2">
                <Text label="Состояние" name="condition" defaultValue={edit.condition} />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="f-description">Описание</label>
                <textarea id="f-description" name="description" defaultValue={edit.description} className="field min-h-24" />
              </div>
              <div className="sm:col-span-2">
                <Text label="URL изображения (необязательно)" name="imageUrl" defaultValue={edit.imageUrl} />
              </div>
              <label className="flex items-center gap-2 text-sm text-platinum/70 sm:col-span-2">
                <input type="checkbox" name="active" defaultChecked={edit.active ?? true} className="accent-[#D6B56D]" /> Показывать на сайте
              </label>
              {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
              <Button type="submit" disabled={pending} className="sm:col-span-2">
                Сохранить
              </Button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
