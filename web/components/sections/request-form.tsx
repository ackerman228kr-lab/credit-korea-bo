"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ImagePlus, Loader2, X } from "lucide-react";
import type { Branch, Mode } from "@/lib/types";
import type { CategoryId } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/motion";

export interface RequestPayload {
  category: CategoryId;
  kind: "gold" | "device";
  mode: Mode;
  summary: string;
  details: Record<string, unknown>;
  estimateMin: number;
  estimateMax: number;
}

const MAX_PHOTOS = 6;

/** Contact + photos step shared by both valuation tools. Posts to /api/requests. */
export function RequestForm({ payload, branches, withPhotos = true }: { payload: RequestPayload; branches: Branch[]; withPhotos?: boolean }) {
  const [contact, setContact] = useState<"phone" | "whatsapp" | "telegram">("whatsapp");
  const [photos, setPhotos] = useState<File[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/") && f.size < 10 * 1024 * 1024);
    setPhotos((p) => [...p, ...imgs].slice(0, MAX_PHOTOS));
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const phone = String(form.get("phone") || "").trim();
    if (phone.replace(/\D/g, "").length < 7) {
      setError("Укажите корректный номер телефона");
      return;
    }
    form.set("payload", JSON.stringify({ ...payload, contact }));
    form.delete("photos");
    photos.forEach((p) => form.append("photos", p));
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/requests", { method: "POST", body: form });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Ошибка отправки");
      setState("done");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Ошибка отправки");
    }
  }

  if (state === "done")
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-liquid/15 text-liquid ring-1 ring-liquid/40">
          <Check className="h-6 w-6" />
        </div>
        <p className="mt-5 font-display text-2xl text-white">Заявка принята</p>
        <p className="mt-2 max-w-xs text-sm text-platinum/60">Эксперт свяжется с вами в течение 15 минут в рабочее время.</p>
      </motion.div>
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="rf-name">Имя</label>
          <input id="rf-name" name="name" required maxLength={80} autoComplete="name" className="field" placeholder="Как к вам обращаться" />
        </div>
        <div>
          <label className="label" htmlFor="rf-phone">Телефон</label>
          <input id="rf-phone" name="phone" required maxLength={30} type="tel" autoComplete="tel" inputMode="tel" className="field" placeholder="+82 10 …" />
        </div>
      </div>
      <div>
        <span className="label">Связаться через</span>
        <Segmented
          id={`contact-${payload.kind}`}
          value={contact}
          onChange={setContact}
          options={[
            { value: "whatsapp", label: "WhatsApp" },
            { value: "telegram", label: "Telegram" },
            { value: "phone", label: "Звонок" },
          ]}
        />
      </div>
      {branches.length > 0 && (
        <div>
          <label className="label" htmlFor="rf-branch">Удобное отделение</label>
          <select id="rf-branch" name="branchId" className="field appearance-none" defaultValue="">
            <option value="">Любое</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.city} — {b.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {withPhotos && (
        <div>
          <span className="label">Фото (до {MAX_PHOTOS})</span>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
            className="flex flex-wrap gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-3"
          >
            <AnimatePresence>
              {photos.map((f, i) => (
                <motion.div
                  key={`${f.name}-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative h-20 w-20 overflow-hidden rounded-xl ring-1 ring-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Удалить фото"
                    onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-white/10 text-platinum/50 transition hover:border-liquid/50 hover:text-liquid"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px]">Добавить</span>
              </button>
            )}
            <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
          </div>
        </div>
      )}
      <label className="flex items-start gap-3 text-xs leading-relaxed text-platinum/50">
        <input type="checkbox" required className="mt-0.5 accent-[#D6B56D]" />
        Согласен на обработку персональных данных для связи по заявке.
      </label>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={state === "sending"}>
        {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Отправить на оценку
      </Button>
    </form>
  );
}
