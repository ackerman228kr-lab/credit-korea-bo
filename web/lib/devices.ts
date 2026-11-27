import type { CategoryId } from "./categories";

export interface DeviceModel {
  name: string;
  /** Typical resale value in good condition (KRW). */
  base: number;
  variants?: { label: string; factor: number }[];
}
export interface DeviceBrand {
  name: string;
  models: DeviceModel[];
}

const phoneStorage = [
  { label: "128 GB", factor: 1 },
  { label: "256 GB", factor: 1.1 },
  { label: "512 GB", factor: 1.22 },
  { label: "1 TB", factor: 1.35 },
];
const laptopSpec = [
  { label: "8–16 GB / 256–512 GB", factor: 1 },
  { label: "16–24 GB / 512 GB–1 TB", factor: 1.18 },
  { label: "32 GB+ / 1 TB+", factor: 1.4 },
];
const tabletStorage = [
  { label: "64–128 GB Wi‑Fi", factor: 1 },
  { label: "256 GB Wi‑Fi", factor: 1.12 },
  { label: "512 GB+ / Cellular", factor: 1.28 },
];

export const deviceCatalog: Record<Exclude<CategoryId, "gold">, DeviceBrand[]> = {
  smartphones: [
    {
      name: "Apple",
      models: [
        { name: "iPhone 17 Pro Max", base: 1_350_000, variants: phoneStorage.slice(1) },
        { name: "iPhone 17 Pro", base: 1_180_000, variants: phoneStorage.slice(1) },
        { name: "iPhone 17", base: 820_000, variants: phoneStorage.slice(1, 3) },
        { name: "iPhone 16 Pro Max", base: 1_020_000, variants: phoneStorage.slice(1) },
        { name: "iPhone 16 Pro", base: 880_000, variants: phoneStorage },
        { name: "iPhone 16", base: 640_000, variants: phoneStorage.slice(0, 3) },
        { name: "iPhone 15 Pro", base: 690_000, variants: phoneStorage },
        { name: "iPhone 15", base: 500_000, variants: phoneStorage.slice(0, 3) },
        { name: "iPhone 14", base: 380_000, variants: phoneStorage.slice(0, 3) },
        { name: "iPhone 13", base: 300_000, variants: phoneStorage.slice(0, 3) },
      ],
    },
    {
      name: "Samsung",
      models: [
        { name: "Galaxy S25 Ultra", base: 980_000, variants: phoneStorage.slice(1) },
        { name: "Galaxy S25", base: 620_000, variants: phoneStorage.slice(0, 3) },
        { name: "Galaxy Z Fold 7", base: 1_250_000, variants: phoneStorage.slice(1) },
        { name: "Galaxy Z Flip 7", base: 680_000, variants: phoneStorage.slice(1, 3) },
        { name: "Galaxy S24 Ultra", base: 720_000, variants: phoneStorage.slice(1) },
        { name: "Galaxy S24", base: 430_000, variants: phoneStorage.slice(0, 3) },
      ],
    },
    {
      name: "Google",
      models: [
        { name: "Pixel 10 Pro", base: 760_000, variants: phoneStorage.slice(0, 3) },
        { name: "Pixel 9 Pro", base: 560_000, variants: phoneStorage.slice(0, 3) },
      ],
    },
  ],
  laptops: [
    {
      name: "Apple",
      models: [
        { name: "MacBook Pro 16 (M4 Pro/Max)", base: 2_900_000, variants: laptopSpec },
        { name: "MacBook Pro 14 (M4)", base: 1_850_000, variants: laptopSpec },
        { name: "MacBook Air 15 (M4)", base: 1_300_000, variants: laptopSpec.slice(0, 2) },
        { name: "MacBook Air 13 (M3)", base: 980_000, variants: laptopSpec.slice(0, 2) },
        { name: "MacBook Air 13 (M2)", base: 780_000, variants: laptopSpec.slice(0, 2) },
      ],
    },
    {
      name: "ASUS ROG",
      models: [
        { name: "ROG Zephyrus G16 (RTX 4080)", base: 2_100_000, variants: laptopSpec },
        { name: "ROG Strix G16 (RTX 4070)", base: 1_450_000, variants: laptopSpec },
      ],
    },
    {
      name: "Lenovo",
      models: [
        { name: "Legion Pro 7i", base: 1_900_000, variants: laptopSpec },
        { name: "ThinkPad X1 Carbon", base: 1_050_000, variants: laptopSpec },
      ],
    },
    {
      name: "Samsung",
      models: [{ name: "Galaxy Book4 Pro", base: 950_000, variants: laptopSpec }],
    },
  ],
  tablets: [
    {
      name: "Apple",
      models: [
        { name: "iPad Pro 13 (M4)", base: 1_350_000, variants: tabletStorage },
        { name: "iPad Pro 11 (M4)", base: 1_000_000, variants: tabletStorage },
        { name: "iPad Air (M3)", base: 650_000, variants: tabletStorage },
        { name: "iPad (A16)", base: 380_000, variants: tabletStorage.slice(0, 2) },
        { name: "iPad mini (A17 Pro)", base: 480_000, variants: tabletStorage },
      ],
    },
    {
      name: "Samsung",
      models: [
        { name: "Galaxy Tab S10 Ultra", base: 980_000, variants: tabletStorage },
        { name: "Galaxy Tab S10+", base: 760_000, variants: tabletStorage },
      ],
    },
  ],
  watches: [
    {
      name: "Rolex",
      models: [
        { name: "Submariner Date", base: 14_500_000 },
        { name: "Datejust 41", base: 12_000_000 },
        { name: "GMT‑Master II", base: 19_000_000 },
        { name: "Daytona", base: 38_000_000 },
      ],
    },
    {
      name: "Omega",
      models: [
        { name: "Speedmaster Moonwatch", base: 6_200_000 },
        { name: "Seamaster Diver 300M", base: 4_600_000 },
        { name: "Constellation", base: 3_800_000 },
      ],
    },
    {
      name: "Cartier",
      models: [
        { name: "Santos de Cartier", base: 7_500_000 },
        { name: "Tank Must", base: 2_900_000 },
      ],
    },
    {
      name: "TAG Heuer",
      models: [
        { name: "Carrera Chronograph", base: 3_600_000 },
        { name: "Aquaracer", base: 1_900_000 },
      ],
    },
    {
      name: "Longines",
      models: [
        { name: "HydroConquest", base: 1_350_000 },
        { name: "Master Collection", base: 1_700_000 },
      ],
    },
    {
      name: "Seiko",
      models: [
        { name: "Grand Seiko (Spring Drive)", base: 4_200_000 },
        { name: "Prospex", base: 520_000 },
      ],
    },
  ],
  electronics: [
    {
      name: "Sony",
      models: [
        { name: "PlayStation 5 Pro", base: 720_000 },
        { name: "PlayStation 5 Slim", base: 430_000 },
        { name: "Alpha 7 IV (body)", base: 1_900_000 },
        { name: "WH‑1000XM6", base: 290_000 },
      ],
    },
    {
      name: "Microsoft",
      models: [{ name: "Xbox Series X", base: 380_000 }],
    },
    {
      name: "Nintendo",
      models: [
        { name: "Switch 2", base: 390_000 },
        { name: "Switch OLED", base: 230_000 },
      ],
    },
    {
      name: "Canon",
      models: [
        { name: "EOS R6 Mark II (body)", base: 1_800_000 },
        { name: "EOS R8 (body)", base: 1_050_000 },
      ],
    },
    {
      name: "Fujifilm",
      models: [{ name: "X100VI", base: 1_900_000 }],
    },
    {
      name: "DJI",
      models: [
        { name: "Mavic 3 Pro", base: 1_700_000 },
        { name: "Osmo Pocket 3", base: 420_000 },
      ],
    },
  ],
};

export const conditions = [
  { id: "mint", label: "Как новый", hint: "Без следов использования", factor: 1.0 },
  { id: "good", label: "Хорошее", hint: "Микроцарапины, всё работает", factor: 0.86 },
  { id: "fair", label: "Среднее", hint: "Заметные потёртости, сколы", factor: 0.68 },
  { id: "damaged", label: "Повреждено", hint: "Трещины или неисправности", factor: 0.38 },
] as const;

export const batteryLevels = [
  { id: "90", label: "90–100%", factor: 1 },
  { id: "80", label: "80–89%", factor: 0.93 },
  { id: "70", label: "< 80%", factor: 0.82 },
] as const;

export const accessoriesFor = (category: string) =>
  category === "watches"
    ? [
        { id: "box", label: "Оригинальная коробка", bonus: 0.04 },
        { id: "papers", label: "Документы / гарантия", bonus: 0.08 },
        { id: "service", label: "Чек сервисного обслуживания", bonus: 0.03 },
      ]
    : [
        { id: "box", label: "Оригинальная коробка", bonus: 0.03 },
        { id: "charger", label: "Зарядное устройство / кабель", bonus: 0.02 },
        { id: "receipt", label: "Чек о покупке", bonus: 0.03 },
        { id: "extras", label: "Чехол, стилус, геймпад и т.п.", bonus: 0.02 },
      ];

export const hasBattery = (category: string) =>
  category === "smartphones" || category === "laptops" || category === "tablets";
