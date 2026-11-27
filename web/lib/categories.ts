export type CategoryId = "gold" | "watches" | "smartphones" | "laptops" | "tablets" | "electronics";

export interface Category {
  id: CategoryId;
  title: string;
  label: string;
  description: string;
  long: string;
  accepts: string[];
  tool: "gold" | "device";
  accent: string;
}

export const categories: Category[] = [
  {
    id: "gold",
    title: "ЗОЛОТО",
    label: "Золото",
    description: "Ювелирные украшения и изделия из золота",
    long: "Кольца, цепи, серьги, браслеты, слитки и лом любой пробы. Проверяем пробу на месте и считаем по актуальной цене за грамм — без скрытых удержаний.",
    accepts: ["Украшения 375–999 пробы", "Слитки и монеты", "Лом и повреждённые изделия", "Изделия с камнями"],
    tool: "gold",
    accent: "#F3D58A",
  },
  {
    id: "watches",
    title: "ЧАСЫ",
    label: "Часы",
    description: "Оценка наручных часов",
    long: "Механические и кварцевые часы швейцарских и японских марок. Эксперт проверяет механизм, подлинность и комплектность.",
    accepts: ["Rolex, Omega, Cartier, TAG Heuer", "Longines, Tissot, Seiko", "С коробкой и документами — дороже", "Часы после обслуживания"],
    tool: "device",
    accent: "#C9CED6",
  },
  {
    id: "smartphones",
    title: "СМАРТФОНЫ",
    label: "Смартфоны",
    description: "iPhone, Samsung и другие смартфоны",
    long: "Актуальные флагманы и модели прошлых лет. Учитываем память, состояние корпуса и экрана, ёмкость аккумулятора.",
    accepts: ["iPhone 12 и новее", "Samsung Galaxy S / Z", "Google Pixel", "Разблокированные устройства"],
    tool: "device",
    accent: "#D6B56D",
  },
  {
    id: "laptops",
    title: "НОУТБУКИ",
    label: "Ноутбуки",
    description: "MacBook, игровые ноутбуки и компьютеры",
    long: "MacBook Air и Pro, игровые и рабочие ноутбуки. Проверяем процессор, память, накопитель и циклы батареи.",
    accepts: ["MacBook на Apple Silicon", "Игровые ноутбуки RTX", "Ультрабуки", "С зарядным устройством"],
    tool: "device",
    accent: "#C9CED6",
  },
  {
    id: "tablets",
    title: "ПЛАНШЕТЫ",
    label: "Планшеты",
    description: "Планшеты и мобильные устройства",
    long: "iPad Pro, iPad Air, Galaxy Tab. Стилусы и клавиатуры увеличивают оценку.",
    accepts: ["iPad Pro / Air / mini", "Samsung Galaxy Tab S", "Apple Pencil и клавиатуры", "Wi‑Fi и Cellular версии"],
    tool: "device",
    accent: "#D6B56D",
  },
  {
    id: "electronics",
    title: "ТЕХНИКА",
    label: "Техника",
    description: "Игровые консоли, камеры и электроника",
    long: "Игровые консоли, фотокамеры и объективы, наушники и другая техника премиального сегмента.",
    accepts: ["PlayStation, Xbox, Nintendo", "Камеры Sony, Canon, Fujifilm", "Объективы", "Наушники и аудио"],
    tool: "device",
    accent: "#C9CED6",
  },
];

export const categoryById = (id: string) => categories.find((c) => c.id === id);
