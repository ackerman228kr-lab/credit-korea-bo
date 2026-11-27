import type { Branch, Offer, Settings } from "../types";

export const defaultSettings: Settings = {
  currency: "KRW",
  goldPricePerGram: 152_000,
  goldPledgeRate: 0.85,
  goldBuyoutRate: 0.92,
  devicePledgeRate: 0.6,
  deviceBuyoutRate: 0.7,
  monthlyFeePercent: 3,
  updatedAt: new Date(0).toISOString(),
};

// Demo branches — replace in /admin → «Отделения».
export const seedBranches: Branch[] = [
  {
    id: "seoul-gangnam",
    name: "Gangnam Flagship",
    city: "Сеул",
    address: "Seoul, Gangnam-gu, Teheran-ro 152",
    hours: "Пн–Сб 10:00–21:00, Вс 11:00–19:00",
    phone: "+82 2-000-0001",
    whatsapp: "82200000001",
    lat: 37.5005,
    lng: 127.0365,
    active: true,
  },
  {
    id: "ansan",
    name: "Ansan Station",
    city: "Ансан",
    address: "Ansan-si, Danwon-gu, Wongok-dong 790",
    hours: "Ежедневно 10:00–22:00",
    phone: "+82 31-000-0002",
    whatsapp: "82310000002",
    lat: 37.3311,
    lng: 126.7889,
    active: true,
  },
  {
    id: "incheon",
    name: "Incheon Bupyeong",
    city: "Инчхон",
    address: "Incheon, Bupyeong-gu, Bupyeong-daero 1",
    hours: "Пн–Сб 10:00–20:00",
    phone: "+82 32-000-0003",
    whatsapp: "82320000003",
    lat: 37.4894,
    lng: 126.7245,
    active: true,
  },
];

const now = new Date().toISOString();
export const seedOffers: Offer[] = [
  { id: "o1", title: "Кольцо 585, 4.2 г, бриллиант 0.15 ct", category: "gold", price: 690_000, condition: "Отличное", description: "Белое золото, сертификат на камень.", active: true, createdAt: now },
  { id: "o2", title: "Omega Seamaster Diver 300M", category: "watches", price: 5_200_000, condition: "Отличное, полный комплект", description: "2022 г., коробка и документы.", active: true, createdAt: now },
  { id: "o3", title: "iPhone 16 Pro 256 GB", category: "smartphones", price: 1_090_000, condition: "Как новый, АКБ 98%", description: "Natural Titanium, без ремонтов.", active: true, createdAt: now },
  { id: "o4", title: "MacBook Pro 14 M4, 16/512", category: "laptops", price: 2_150_000, condition: "Хорошее, 41 цикл", description: "Space Black, зарядка в комплекте.", active: true, createdAt: now },
  { id: "o5", title: "iPad Pro 11 M4 256 GB + Pencil Pro", category: "tablets", price: 1_250_000, condition: "Отличное", description: "Wi‑Fi, стилус в комплекте.", active: true, createdAt: now },
  { id: "o6", title: "PlayStation 5 Pro + 2 геймпада", category: "electronics", price: 820_000, condition: "Отличное", description: "Гарантия магазина 3 месяца.", active: true, createdAt: now },
  { id: "o7", title: "Цепь 750, 18.6 г", category: "gold", price: 2_380_000, condition: "Отличное", description: "Плетение «бисмарк», 55 см.", active: true, createdAt: now },
  { id: "o8", title: "Sony Alpha 7 IV + 28‑70", category: "electronics", price: 2_250_000, condition: "Хорошее, 12k кадров", description: "Две батареи, ремень.", active: true, createdAt: now },
];
