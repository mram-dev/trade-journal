/**
 * Trade Journal — Hono on Cloudflare Workers
 * Auth is inline (hash-based). All DB calls go to db.js. React SPA served from static-assets.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  initDB, getTrades, getTrade, createTrade, updateTrade, closeTrade, deleteTrade, restoreTrade, recalculatePnL,
  cleanupOpenDupes, syncBalances, getStats, getStrategies, createStrategy, updateStrategy, deleteStrategy,
  getAccounts, createAccount, updateAccount, deleteAccount, getJournalEntries, saveJournalEntry,
  getSetting, setSetting, syncMT5, getTradeByMT5Ticket, calcPnL, getContractSize, _recalcBalance,
} from "./db.js";
import { ASSET_HTML, ASSET_CSS, ASSET_JS } from "./static-assets.js";

const app = new Hono();

// ─── DB init ────────────────────────────────────────────────────────────────
let _dbReady = null;
async function ensureDB(db) {
  if (_dbReady) return _dbReady;
  _dbReady = (async () => { await initDB(db); return true; })();
  return _dbReady;
}

// ─── Auth helpers (hash-based, same as original) ────────────────────────────
function hashPw(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) { h = ((h << 5) - h) + pw.charCodeAt(i); h = h & h; }
  return h;
}
async function checkAuth(c) {
  const stored = await getSetting(c.env.DB, "admin_password");
  const pw = stored || c.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const token = "tj_" + Math.abs(hashPw(pw)).toString(36);
  const cookie = c.req.header("Cookie") || "";
  if (cookie.includes("session=" + token)) return true;
  const url = new URL(c.req.url);
  if (url.searchParams.get("token") === token) return true;
  return false;
}
function authCookie(pw) {
  return `session=tj_${Math.abs(hashPw(pw)).toString(36)}; Path=/; SameSite=Lax; Max-Age=86400`;
}

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use("*", cors({ origin: "*", allowMethods: ["GET","POST","PUT","DELETE","OPTIONS"], allowHeaders: ["Content-Type","X-Journal-Password"] }));

// ─── Public routes ──────────────────────────────────────────────────────────
app.get("/health", (c) => c.json({ ok: true, t: Date.now() }));

app.get("/login", (c) => c.html(ASSET_HTML)); // SPA handles login page

app.post("/login", async (c) => {
  await ensureDB(c.env.DB);
  const { password } = await c.req.json();
  const stored = await getSetting(c.env.DB, "admin_password");
  const pw = stored || c.env.ADMIN_PASSWORD;
  if (password === pw) {
    const token = "tj_" + Math.abs(hashPw(pw)).toString(36);
    return c.json({ ok: true, token }, 200, { "Set-Cookie": authCookie(password) });
  }
  return c.json({ ok: false, error: "Wrong password" }, 401);
});

app.get("/logout", (c) => {
  return c.redirect("/login", 302, { "Set-Cookie": "session=; Path=/; Max-Age=0" });
});

// ─── Protected: API routes ──────────────────────────────────────────────────
app.use("/api/*", async (c, next) => {
  await ensureDB(c.env.DB);
  // /api/sync handles its own auth
  if (c.req.path === "/api/sync" || c.req.path === "/api/sync/status") return next();
  if (!(await checkAuth(c))) return c.json({ error: "Unauthorized" }, 401);
  return next();
});

// ─── Trades ─────────────────────────────────────────────────────────────────
app.get("/api/trades", async (c) => {
  const p = Object.fromEntries(new URL(c.req.url).searchParams);
  const limit = Math.min(parseInt(p.limit || "200", 10) || 200, 1000);
  const filters = {
    limit, offset: parseInt(p.offset || "0", 10) || 0,
    account_id: p.account_id ? parseInt(p.account_id, 10) : undefined,
    strategy_id: (p.strategy_id || p.strategy) ? parseInt(p.strategy_id || p.strategy, 10) : undefined,
    symbol: p.symbol, direction: p.direction, status: p.status,
    sort: p.sort || "date_desc",
  };
  const trades = await getTrades(c.env.DB, limit, filters.offset, filters);
  return c.json({ trades, count: trades.length });
});

app.get("/api/trades/bulk", async (c) => {
  const trades = await getTrades(c.env.DB, 10000, 0, {});
  return c.json({ trades: trades.map(t => ({ id: t.id, symbol: t.symbol })) });
});

app.get("/api/trades/:id", async (c) => {
  const trade = await getTrade(c.env.DB, parseInt(c.req.param("id"), 10));
  if (!trade) return c.json({ error: "Not found" }, 404);
  return c.json(trade);
});

app.post("/api/trades", async (c) => {
  const body = await c.req.json();
  const trade = await createTrade(c.env.DB, {
    symbol: body.symbol, direction: body.direction, entry_price: body.entry_price,
    exit_price: body.exit_price, lot_size: body.lot_size, stop_loss: body.stop_loss,
    take_profit: body.take_profit, fees: body.fees, strategy_id: body.strategy_id,
    account_id: body.account_id, timeframe: body.timeframe, entry_date: body.entry_date,
    exit_date: body.exit_date, emotion: body.emotion, rating: body.rating,
    notes: body.notes, screenshot_url: body.screenshot_url,
    // broker/import net profit — must pass through or calc overwrites & can double-count fees
    pnl: body.pnl, pnl_percent: body.pnl_percent, status: body.status,
  });
  return c.json(trade);
});

app.put("/api/trades/:id", async (c) => {
  const body = await c.req.json();
  const trade = await updateTrade(c.env.DB, parseInt(c.req.param("id"), 10), body);
  return c.json(trade);
});

app.delete("/api/trades/:id", async (c) => {
  const result = await deleteTrade(c.env.DB, parseInt(c.req.param("id"), 10));
  return c.json(result || { success: true });
});

app.put("/api/trades/:id/restore", async (c) => {
  const result = await restoreTrade(c.env.DB, parseInt(c.req.param("id"), 10));
  return c.json(result, result.ok ? 200 : 404);
});

app.put("/api/trades/:id/close", async (c) => {
  const body = await c.req.json();
  const trade = await closeTrade(c.env.DB, parseInt(c.req.param("id"), 10), body.exit_price, body.exit_date, body.fees || 0);
  return c.json(trade);
});

app.put("/api/trades/bulk", async (c) => {
  const body = await c.req.json();
  const ids = body.ids || [];
  const updates = body.updates || {};
  for (const id of ids) {
    await updateTrade(c.env.DB, id, updates);
  }
  await recalculatePnL(c.env.DB);
  return c.json({ success: true, updated: ids.length });
});

// Fix closed trades stuck at pnl=0/null (empty import Profit) + delete open orphans of closed
app.post("/api/fix-zero-pnl", async (c) => {
  const fixed = await recalculatePnL(c.env.DB, { onlyZero: true });
  const opens = await cleanupOpenDupes(c.env.DB);
  await syncBalances(c.env.DB);
  return c.json({ success: true, ...fixed, open_orphans_deleted: opens.deleted });
});

// ─── Strategies ─────────────────────────────────────────────────────────────
app.get("/api/strategies", async (c) => {
  const strategies = await getStrategies(c.env.DB);
  return c.json({ strategies });
});

app.post("/api/strategies", async (c) => {
  const body = await c.req.json();
  const strategy = await createStrategy(c.env.DB, body);
  return c.json(strategy);
});

app.put("/api/strategies/:id", async (c) => {
  const body = await c.req.json();
  const strategy = await updateStrategy(c.env.DB, parseInt(c.req.param("id"), 10), body);
  return c.json(strategy);
});

app.delete("/api/strategies/:id", async (c) => {
  await deleteStrategy(c.env.DB, parseInt(c.req.param("id"), 10));
  return c.json({ success: true });
});

// ─── Accounts ───────────────────────────────────────────────────────────────
app.get("/api/accounts", async (c) => {
  const accounts = await getAccounts(c.env.DB);
  return c.json({ accounts });
});

app.post("/api/accounts", async (c) => {
  const body = await c.req.json();
  const account = await createAccount(c.env.DB, body);
  return c.json(account);
});

app.put("/api/accounts/:id", async (c) => {
  const body = await c.req.json();
  const account = await updateAccount(c.env.DB, parseInt(c.req.param("id"), 10), body);
  return c.json(account);
});

app.delete("/api/accounts/:id", async (c) => {
  await deleteAccount(c.env.DB, parseInt(c.req.param("id"), 10));
  return c.json({ success: true });
});

app.put("/api/accounts/default/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const accounts = await getAccounts(c.env.DB);
  for (const a of accounts) {
    await updateAccount(c.env.DB, a.id, { is_default: a.id === id ? 1 : 0 });
  }
  return c.json({ success: true });
});

// ─── Journal ────────────────────────────────────────────────────────────────
app.get("/api/journal", async (c) => {
  const entries = await getJournalEntries(c.env.DB);
  return c.json({ entries });
});

app.put("/api/journal", async (c) => {
  const body = await c.req.json();
  const entry = await saveJournalEntry(c.env.DB, body);
  return c.json(entry);
});

// ─── Stats ──────────────────────────────────────────────────────────────────
app.get("/api/stats", async (c) => {
  const url = new URL(c.req.url);
  const accountId = url.searchParams.get("account_id") ? parseInt(url.searchParams.get("account_id"), 10) : null;
  const stats = await getStats(c.env.DB, accountId);
  return c.json(stats);
});

app.get("/api/stats/strategies", async (c) => {
  const rows = await c.env.DB.prepare(`
    SELECT s.id, s.name, s.color, COUNT(t.id) as trades, COALESCE(SUM(t.pnl),0) as total_pnl,
      ROUND(CASE WHEN COUNT(CASE WHEN t.pnl > 0 THEN 1 END)*100.0/COUNT(t.id),1) as win_rate
    FROM strategies s LEFT JOIN trades t ON t.strategy_id=s.id GROUP BY s.id
  `).all();
  return c.json({ strategies: rows.results || [] });
});

app.get("/api/stats/symbols", async (c) => {
  const rows = await c.env.DB.prepare(`
    SELECT symbol, COUNT(*) as trades, COALESCE(SUM(pnl),0) as total_pnl,
      ROUND(CASE WHEN COUNT(CASE WHEN pnl>0 THEN 1 END)*100.0/COUNT(*),1) as win_rate
    FROM trades WHERE status='closed' GROUP BY symbol ORDER BY total_pnl DESC
  `).all();
  return c.json({ symbols: rows.results || [] });
});

app.get("/api/stats/equity", async (c) => {
  const rows = await c.env.DB.prepare(`
    SELECT id, symbol, exit_date, pnl, fees, direction, account_id,
      (SELECT COALESCE(SUM(pnl),0) FROM trades t2 WHERE t2.status='closed' AND t2.exit_date<=t1.exit_date AND t2.id<=t1.id AND (t1.account_id IS NULL OR t2.account_id=t1.account_id)) as cumulative
    FROM trades t1 WHERE status='closed' ORDER BY exit_date ASC, id ASC
  `).all();
  return c.json({ equity: rows.results || [] });
});

app.get("/api/stats/journal", async (c) => {
  const days = await c.env.DB.prepare(`SELECT COUNT(*) as total FROM journal_entries`).get();
  const streak = await c.env.DB.prepare(`SELECT date FROM journal_entries ORDER BY date DESC LIMIT 30`).all();
  return c.json({ totalDays: days?.total || 0, entries: streak.results || [] });
});

// ─── Admin: Backup / Restore ────────────────────────────────────────────────
app.get("/api/admin/export", async (c) => {
  await ensureDB(c.env.DB);
  const tables = ["trades", "strategies", "accounts", "settings", "daily_journal"];
  const data = {};
  for (const t of tables) {
    const { results } = await c.env.DB.prepare(`SELECT * FROM ${t}`).all();
    data[t] = results || [];
  }
  return c.json(data, 200, {
    "Content-Disposition": `attachment; filename="trade-journal-backup-${new Date().toISOString().slice(0,10)}.json"`,
    "Content-Type": "application/json",
  });
});

app.post("/api/admin/import", async (c) => {
  await ensureDB(c.env.DB);
  const body = await c.req.json();
  const tables = ["daily_journal", "settings", "accounts", "strategies", "trades"]; // order: deps first
  for (const t of tables) {
    if (!body[t] || !Array.isArray(body[t])) continue;
    await c.env.DB.prepare(`DELETE FROM ${t}`).run();
    if (body[t].length) {
      const cols = Object.keys(body[t][0]).join(", ");
      const placeholders = Object.keys(body[t][0]).map(() => "?").join(", ");
      const stmt = c.env.DB.prepare(`INSERT INTO ${t} (${cols}) VALUES (${placeholders})`);
      for (const row of body[t]) {
        await stmt.bind(...Object.values(row)).run();
      }
    }
  }
  return c.json({ ok: true, message: "Imported successfully" });
});

// ─── Settings ───────────────────────────────────────────────────────────────
app.get("/api/settings", async (c) => {
  // ponytail: never expose admin_password over GET
  const keys = ["mt5_account","mt5_server","default_symbol","risk_per_trade","profile_name","profile_avatar"];
  const settings = {};
  for (const k of keys) {
    const v = await getSetting(c.env.DB, k);
    if (v !== undefined && v !== null) settings[k] = v;
  }
  return c.json(settings);
});

app.put("/api/settings", async (c) => {
  const body = await c.req.json();
  const allowed = new Set(["admin_password","mt5_account","mt5_server","default_symbol","risk_per_trade","profile_name","profile_avatar"]);
  if (!body.key || !allowed.has(body.key)) return c.json({ error: "Invalid key" }, 400);
  if (body.key === "admin_password") {
    const current = body.current_password;
    const stored = await getSetting(c.env.DB, "admin_password");
    if (current !== (stored || c.env.ADMIN_PASSWORD)) {
      return c.json({ error: "Current password wrong" }, 403);
    }
  }
  await setSetting(c.env.DB, body.key, body.value ?? "");
  return c.json({ ok: true });
});

app.post("/api/admin/reset-cache", async (c) => {
  // ponytail: trivial — no real cache exists, the only state is browser localStorage
  return c.json({ ok: true, hint: 'browser storage is locally cleared; refresh + hard reload' });
});

app.post("/api/admin/sync-balances", async (c) => {
  const r = await syncBalances(c.env.DB);
  const accs = await getAccounts(c.env.DB);
  return c.json({ ok: true, accounts: accs, purged: r.purged || 0 });
});

app.post("/api/admin/clear-trades", async (c) => {
  const r = await c.env.DB.prepare("DELETE FROM trades").run();
  await syncBalances(c.env.DB);
  return c.json({ ok: true, deleted: r.meta?.changes || 0 });
});

// ─── Price proxy ────────────────────────────────────────────────────────────
app.get("/api/prices", async (c) => {
  const ids = (new URL(c.req.url).searchParams.get("ids") || "").split(",").filter(Boolean);
  if (!ids.length) return c.json({ prices: {} });
  try {
    const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`);
    return c.json({ prices: await resp.json() });
  } catch { return c.json({ prices: {} }); }
});

// ─── Image proxy (Google Drive only) ────────────────────────────────────────
app.get("/api/proxy-image", async (c) => {
  const url = new URL(c.req.url).searchParams.get("url");
  if (!url) return c.text("Missing url param", 400);
  try {
    const parsedUrl = new URL(url);
    const allowed = ["drive.google.com","docs.google.com","lh3.googleusercontent.com","ogs.googleusercontent.com"];
    if (!allowed.some(d => parsedUrl.hostname.endsWith(d))) return c.text("Only Google Drive URLs allowed", 403);
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow" });
    if (!resp.ok) return c.text("Failed", 502);
    return new Response(await resp.arrayBuffer(), {
      headers: { "Content-Type": resp.headers.get("content-type") || "image/jpeg", "Cache-Control": "public, max-age=86400", "Access-Control-Allow-Origin": "*" },
    });
  } catch { return c.text("Invalid URL", 400); }
});

// ─── MT5 Sync ───────────────────────────────────────────────────────────────
app.post("/api/sync", async (c) => {
  const body = await c.req.json();
  const authHeader = c.req.header("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const cookie = c.req.header("Cookie") || "";
  const cookieMatch = cookie.match(/session=([^;]+)/);
  const sessionToken = token || cookieMatch?.[1];

  let authorized = false;
  if (sessionToken) {
    const stored = await getSetting(c.env.DB, "admin_password");
    const pw = stored || c.env.ADMIN_PASSWORD;
    if (pw) {
      const expected = "tj_" + Math.abs(hashPw(pw)).toString(36);
      if (sessionToken === expected) authorized = true;
    }
  }
  if (!authorized) {
    const password = body.password || c.req.header("X-Journal-Password");
    const stored = await getSetting(c.env.DB, "admin_password");
    const pw = stored || c.env.ADMIN_PASSWORD;
    if (password !== pw) return c.json({ error: "Unauthorized" }, 401);
  }

  const result = await syncMT5(c.env.DB, body.account_id, body.positions, body.closed_deals, body.account_info);
  return c.json(result);
});

app.get("/api/sync/status", async (c) => {
  const trades = await getTrades(c.env.DB, 10000, 0, {});
  return c.json({ trade_count: trades.length, last_sync: new Date().toISOString() });
});

// ─── Assets: Serve CSS/JS from inline strings (streaming for large files) ──
app.get("/assets/:file", (c) => {
  const file = c.req.param("file");
  const assets = { "index.css": ASSET_CSS, "index.js": ASSET_JS };
  const content = assets[file];
  if (!content) return c.text("Not found", 404);
  const mime = file.endsWith(".css") ? "text/css" : "application/javascript";
  return new Response(content, {
    headers: { "Content-Type": mime, "Cache-Control": "public, max-age=31536000", "Access-Control-Allow-Origin": "*" },
  });
});

// ─── SPA: Serve React app for all non-API routes ───────────────────────────
app.get("*", (c) => {
  const path = new URL(c.req.url).pathname;
  if (path.startsWith("/api/")) return c.json({ error: "Not found" }, 404);
  return c.html(ASSET_HTML);
});

export default app;
