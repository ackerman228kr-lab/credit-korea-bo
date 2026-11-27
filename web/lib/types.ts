import type { CategoryId } from "./categories";

export type Mode = "pledge" | "buyout";

export interface Settings {
  currency: string;
  /** Price for 1 gram of pure (999.9) gold. */
  goldPricePerGram: number;
  /** Share of melt value paid out as a loan when pledging gold. */
  goldPledgeRate: number;
  /** Share of melt value paid when buying gold outright. */
  goldBuyoutRate: number;
  /** Share of market value offered for devices. */
  devicePledgeRate: number;
  deviceBuyoutRate: number;
  /** Monthly fee for a pledge, percent. */
  monthlyFeePercent: number;
  updatedAt: string;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  hours: string;
  phone: string;
  whatsapp: string;
  lat: number;
  lng: number;
  active: boolean;
}

export interface Offer {
  id: string;
  title: string;
  category: CategoryId;
  price: number;
  condition: string;
  description: string;
  imageUrl?: string | null;
  active: boolean;
  createdAt: string;
}

export type RequestStatus = "new" | "contacted" | "done" | "rejected";

export interface ValuationRequest {
  id: string;
  createdAt: string;
  category: CategoryId;
  kind: "gold" | "device";
  mode: Mode;
  summary: string;
  details: Record<string, unknown>;
  estimateMin: number;
  estimateMax: number;
  name: string;
  phone: string;
  contact: "phone" | "whatsapp" | "telegram";
  branchId?: string | null;
  photos: string[];
  status: RequestStatus;
  note?: string | null;
}

export interface PublicData {
  settings: Settings;
  branches: Branch[];
  offers: Offer[];
}
