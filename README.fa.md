# ترید ژورنال

ژورنال معاملات روی Cloudflare Workers + D1 + React SPA.

## نصب و دیپلوی

```bash
# 1. نصب وابستگی‌ها
npm install
cd client && npm install && cd ..

# 2. ساخت دیتابیس D1
npx wrangler d1 create trade-journal-db
# → شناسه دیتابیس رو توی wrangler.toml بذار

# 3. تنظیم رمز عبور
echo "ADMIN_PASSWORD=رمز-شما" > .dev.vars

# 4. بیلد و دیپلوی
cd client && npm run build && cd ..
node scripts/gen-assets.mjs
CLOUDFLARE_API_TOKEN=<توکن-شما> npx wrangler deploy
```

## توسعه محلی

```bash
npx wrangler dev           # Worker + D1 محلی
cd client && npm run dev    # React dev server (پورت 5173)
```

## ساختار پروژه

```
wrangler.toml            # تنظیمات Worker + اتصال D1
src/index.js             # API با Hono (احراز هویت، ترید، حساب، استراتژی، ژورنال، آمار)
src/db.js                # ساختار دیتابیس D1 + توابع CRUD
src/static-assets.js     # ساخته‌شده توسط build — SPA داخل Worker
scripts/gen-assets.mjs   # ساخت static-assets.js از client/dist
client/                  # فرانت‌اند React + Vite + Tailwind
MT5-EA/                  # اکسپرت متاتریدر 5 برای سینک خودکار
```

## سینک متاتریدر

فایل `MT5-EA/TradeJournalSync.mq5` رو توی پوشه `Experts/` متاتریدر 5 کپی کن و به چارت بچسبون. هر 30 ثانیه پوزیشن‌های باز رو سینک میکنه.

## ایمپورت فایل

از صفحه تریدها → ایمپورت → انتخاب فایل.

فرمت‌های پشتیبانی‌شده:
- **گزارش HTML متاتریدر 4/5**
- **فایل CSV**
- **فایل اکسل (XLSX)**

ایمپورت خودکار نوع جدول رو تشخیص میده:
- **Positions** — جدول تاریخچه متاتریدر 5 (بهترین گزینه، شامل ورود+خروج+سود)
- **Deals** — جفت‌سازی ورود/خروج با شماره سفارش
- **MT4** — فرمت استاندارد با ستون Ticket/Item

## متغیرهای محیطی

| متغیر | توضیح |
|---|---|
| `ADMIN_PASSWORD` | رمز عبور ورود (در `.dev.vars` یا محیط Worker) |
| `CLOUDFLARE_API_TOKEN` | برای `wrangler deploy` |
