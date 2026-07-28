راهنمای نصب EA - Trade Journal Auto Sync
═══════════════════════════════════════════

۱. WebRequest مجاز کن (مهم!)
─────────────────────────────
  Tools → Options → Expert Advisors
  ☑ Allow WebRequest for listed URL
  URL: https://trade-journal.mramdev.workers.dev

۲. EA رو نصب کن
─────────────────
  File → Open Data Folder
  MQL5/Experts/TradeJournalSync.mq5 کپی کن
  MetaEditor با F5 کامپایل کن

۳. EA رو روی چارت بکش
───────────────────────
  Navigator → Expert Advisors → TradeJournalSync
  روی چارت EUR/USD درگ کن
  در پنجره Inputs:
    • InpAccountId = ID حسابت (در سایت ببین)
    • InpPassword  = trader2026
  ☑ Allow Algo Trading

۴. تست
───────
  Experts tab → "Trade Journal Sync started" باید ببینی
  هر ۳۰ ثانیه sync میشه
  در سایت: https://trade-journal.mramdev.workers.dev

═══════════════════════════════════════════
نکته: account_id رو از سایت بردار
(صفحه Accounts → ID هر حساب)
═══════════════════════════════════════════
