import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number, currency = "KRW") {
  const symbol = currency === "KRW" ? "₩" : currency === "USD" ? "$" : currency === "RUB" ? "₽" : currency;
  const rounded = currency === "KRW" ? Math.round(value / 100) * 100 : Math.round(value);
  return `${symbol}${rounded.toLocaleString("ru-RU")}`;
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export const TROY_OUNCE_GRAMS = 31.1034768;
