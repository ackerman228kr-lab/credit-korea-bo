# Передача работы (сводка для новой сессии Claude)

Ветка: `ccr-d84baaa0-kfdryo`. Сайт — в папке `web/` (подробности в `web/README.md`).

## Что это
Премиальный 3D-сайт ломбарда **MilArt Consulting** (Next.js 16, TypeScript, Tailwind v4, Framer Motion,
Three.js / React Three Fiber / Drei, Supabase). Язык сайта — русский, валюта по умолчанию — KRW (₩).

## Что готово
- Главная: 3D-карусель 6 категорий (золото, часы, смартфоны, ноутбуки, планшеты, техника) —
  перетаскивание, свайп, колесо, стрелки, автопрокрутка; клик по предмету открывает категорию.
- Калькулятор золота, оценка техники (с загрузкой фото), «Как это работает», витрина, отделения.
- Страницы категорий `/categories/[id]`, витрина `/offers`.
- Админка `/admin` (вход по паролю `ADMIN_PASSWORD`; в dev — `admin`): заявки, цены и ставки,
  отделения, предложения **с загрузкой фото товара**.
- Хранилище: Supabase (если заданы `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), иначе `web/.data/db.json`.
  Схема БД: `web/supabase/migrations/0001_init.sql`.
- Логотип клиента: `web/public/brand/logo.png` (оригинал `logo-original.jpg`); бренд в `web/lib/site.ts`.
- Netlify: `netlify.toml` в корне (base = web). На Netlify ещё не публиковалось — сборку не проверяли.

## Что осталось / ждём от владельца
- Настоящие телефоны, WhatsApp, адреса отделений (сейчас демо-данные в `web/lib/db/seed.ts` и SQL).
- Публикация: Supabase (выполнить SQL) + Netlify (ветка `ccr-d84baaa0-kfdryo`, 4 переменные окружения:
  ADMIN_PASSWORD, ADMIN_SESSION_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).
- Возможно: отдельные логины для сотрудников в админке.
- Безопасность: в репозитории `credit-korea-bot` (`bot.py`) открыто лежит токен Telegram-бота — отозвать в @BotFather.

## Запуск локально
```bash
cd web
npm install
npm run dev        # http://localhost:3000 , админка: /admin (пароль admin)
```
После изменения 3D-моделей: при запущенном dev-сервере `npm run fallbacks` (нужен Playwright).
