import type { Mode, Settings } from "./types";
import { TROY_OUNCE_GRAMS } from "./utils";

export const purities = [
  { id: "999", label: "999.9", fineness: 0.9999, hint: "Слитки, инвестиционное" },
  { id: "958", label: "958", fineness: 0.958, hint: "23K" },
  { id: "916", label: "916", fineness: 0.916, hint: "22K" },
  { id: "750", label: "750", fineness: 0.75, hint: "18K" },
  { id: "585", label: "585", fineness: 0.585, hint: "14K — самая частая" },
  { id: "375", label: "375", fineness: 0.375, hint: "9K" },
] as const;

export function goldQuote(settings: Settings, purityId: string, grams: number, mode: Mode) {
  const purity = purities.find((p) => p.id === purityId) ?? purities[4];
  const pricePerGram = settings.goldPricePerGram * purity.fineness;
  const melt = pricePerGram * Math.max(0, grams);
  const rate = mode === "pledge" ? settings.goldPledgeRate : settings.goldBuyoutRate;
  const payout = melt * rate;
  const monthlyFee = mode === "pledge" ? payout * (settings.monthlyFeePercent / 100) : 0;
  return {
    purity,
    pricePerGram,
    pricePerOunce: settings.goldPricePerGram * TROY_OUNCE_GRAMS,
    melt,
    payout,
    monthlyFee,
    min: payout * 0.97,
    max: payout * 1.02,
  };
}

export interface DeviceQuoteInput {
  base: number;
  variantFactor: number;
  conditionFactor: number;
  batteryFactor: number;
  accessoryBonus: number;
  mode: Mode;
}

export function deviceQuote(settings: Settings, i: DeviceQuoteInput) {
  const market = i.base * i.variantFactor * i.conditionFactor * i.batteryFactor * (1 + i.accessoryBonus);
  const rate = i.mode === "pledge" ? settings.devicePledgeRate : settings.deviceBuyoutRate;
  const mid = market * rate;
  return {
    market,
    min: mid * 0.9,
    max: mid * 1.08,
    monthlyFee: i.mode === "pledge" ? mid * (settings.monthlyFeePercent / 100) : 0,
  };
}
