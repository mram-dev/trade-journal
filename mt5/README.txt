=== Trade Journal - MT5 Auto Sync ===

== روش 1: اسکریپت پایتون (توصیه شده) ==

پیش نیازها:
  - Python 3.8+
  - MetaTrader 5 نصب و لاگین شده
  - pip install MetaTrader5 requests

نصب:
  1. MT5 رو باز کن و لاگین کن به حساب Metagold-Server
  2. ترمینال پایتون رو باز کن:
     pip install MetaTrader5 requests

اجرا:
  # یک بار سینک:
  python mt5_sync.py

  # سینک هر 30 ثانیه (لوپ):
  python mt5_sync.py --loop 30

  # سینک با تنظیمات سفارشی:
  python mt5_sync.py --loop 60 --history 30 --account 1

  # با متغیرهای محیطی (امن‌تر):
  set TJ_API_PASSWORD=trader2026
  set TJ_API_URL=https://trade-journal.mramdev.workers.dev/api/sync
  python mt5_sync.py --loop 30

اجرا خودکار با Windows Task Scheduler:
  1. فایل mt5_sync.bat رو بساز:
     @echo off
     cd /d C:\path\to\trade-journal\mt5
     python mt5_sync.py --loop 30
  2. Task Scheduler > Create Task
  3. Trigger: At startup (یا هر ساعت)
  4. Action: Start program > mt5_sync.bat

== روش 2: Expert Advisor (جایگزین) ==

اگه نمیخوای پایتون نصب کنی، میتونی از EA استفاده کنی:
  1. فایل TradeJournalSync.mq5 رو کپی کن به MQL5/Experts/
  2. در MetaEditor کامپایل کن (F5)
  3. Tools > Options > Expert Advisors:
     - تیک "Allow WebRequest for listed URL"
     - آدرس: https://trade-journal.mramdev.workers.dev
  4. EA رو روی هر چارتی بذار

== تنظیمات ==

متغیرهای محیطی (پایتون):
  TJ_API_URL      آدرس API (پیشفرض: trade-journal.mramdev.workers.dev)
  TJ_API_PASSWORD رمز عبور ژورنال (پیشفرض: trader2026)
  TJ_ACCOUNT_ID   شماره حساب در ژورنال (0=اتوماتیک)

پارامترهای خط فرمان:
  --loop N        سینک هر N ثانیه (0=یکبار)
  --history N     روزهای هیستوری (پیشفرض: 7)
  --url URL       آدرس API
  --password PW   رمز عبور
  --account ID    شماره حساب

== نحوه کار ==

هر بار سینک:
  1. اطلاعات حساب (بالانس، اکویتی، لوریج) ارسال میشه
  2. تمام پوزیشن‌های باز ارسال میشن
  3. تریدهای بسته شده از آخرین سینک ارسال میشن
  4. تریدهای تکراری (بر اساس شماره تیکت MT5) آپدیت میشن
