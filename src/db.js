/**
 * Trade Journal - D1 Database Schema & Helpers
 */

// === CONTRACT SIZE MAP ===
// Returns the contract size (units per 1 standard lot) for a given symbol
function getContractSize(symbol) {
  const s = (symbol || '').toUpperCase();
  // Precious metals
  if (s.includes('XAU')) return 100;       // Gold: 100 oz per lot
  if (s.includes('XAG')) return 5000;      // Silver: 5000 oz per lot
  if (s.includes('XPT')) return 100;       // Platinum
  if (s.includes('XPD')) return 100;       // Palladium
  // Crypto
  if (s.includes('BTC') || s.includes('ETH') || s.includes('SOL') ||
      s.includes('BNB') || s.includes('DOGE') || s.includes('ADA') ||
      s.includes('XRP') || s.includes('LINK') || s.includes('AVAX') ||
      s.includes('DOT') || s.includes('MATIC') || s.includes('UNI')) return 1;
  // Indices (common ones)
  if (s.includes('US30') || s.includes('DJ30') || s.includes('DJI')) return 1;
  if (s.includes('NAS') || s.includes('NQ') || s.includes('NDX')) return 1;
  if (s.includes('SPX') || s.includes('SP500') || s.includes('US500')) return 1;
  if (s.includes('DAX') || s.includes('GER')) return 1;
  if (s.includes('FTSE') || s.includes('UK100')) return 1;
  if (s.includes('NIK') || s.includes('JP225')) return 1;
  // Commodities (oil etc.)
  if (s.includes('OIL') || s.includes('CRUDE') || s.includes('WTI') || s.includes('BRENT')) return 1000;
  if (s.includes('NGAS') || s.includes('NATGAS')) return 10000;
  // Forex pairs (default): 100,000 units per lot
  return 100000;
}

// Calculate PnL for a trade.
// fees always reduce profit (abs) — never add, regardless of sign stored by import/UI.
function calcPnL(direction, entry_price, exit_price, lot_size, symbol, fees = 0) {
  const contractSize = getContractSize(symbol);
  const multiplier = (Number(lot_size) || 0.01) * contractSize;
  const feeCost = Math.abs(Number(fees) || 0);
  const raw = direction === 'long'
    ? (exit_price - entry_price) * multiplier - feeCost
    : (entry_price - exit_price) * multiplier - feeCost;
  const pnl = Math.round(raw * 100) / 100;
  const pnl_percent = Math.round((direction === 'long'
    ? ((exit_price - entry_price) / entry_price * 100)
    : ((entry_price - exit_price) / entry_price * 100)) * 100) / 100;
  return { pnl, pnl_percent };
}

export const SCHEMA_SQL = [
`CREATE TABLE IF NOT EXISTS trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL CHECK(direction IN ('long','short')),
  strategy_id INTEGER,
  account_id INTEGER,
  entry_price REAL NOT NULL,
  exit_price REAL,
  quantity REAL NOT NULL DEFAULT 1,
  lot_size REAL DEFAULT 0.01,
  stop_loss REAL,
  take_profit REAL,
  pnl REAL,
  pnl_percent REAL,
  fees REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed','cancelled')),
  entry_date TEXT NOT NULL,
  exit_date TEXT,
  timeframe TEXT,
  notes TEXT,
  tags TEXT DEFAULT '[]',
  screenshot_url TEXT,
  emotion TEXT,
  rating INTEGER DEFAULT 0 CHECK(rating BETWEEN 0 AND 5),
  mt5_ticket INTEGER,
  source TEXT DEFAULT 'manual',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
)`,
`CREATE TABLE IF NOT EXISTS strategies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT,
  color TEXT DEFAULT '#6366f1',
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
)`,
`CREATE TABLE IF NOT EXISTS accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  initial_balance REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  broker TEXT,
  leverage REAL DEFAULT 1,
  is_default INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
)`,
`CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
)`,
`CREATE TABLE IF NOT EXISTS daily_journal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  mood TEXT,
  notes TEXT,
  lessons TEXT,
  market_conditions TEXT,
  created_at TEXT DEFAULT (datetime('now'))
)`
];

export const DEFAULT_STRATEGIES = [
  { name: 'Breakout', description: 'شکست سطح کلیدی', color: '#6366f1' },
  { name: 'Pullback', description: 'بازگشت به سطح', color: '#8b5cf6' },
  { name: 'Trend Following', description: 'دنبال کردن روند', color: '#059669' },
  { name: 'Scalp', description: 'اسکالپینگ', color: '#ea580c' },
  { name: 'Swing', description: 'سوئینگ ترید', color: '#2563eb' },
];

export async function initDB(db) {
  // Create tables one by one
  await db.exec("CREATE TABLE IF NOT EXISTS trades (id INTEGER PRIMARY KEY AUTOINCREMENT, symbol TEXT NOT NULL, direction TEXT NOT NULL, strategy_id INTEGER, account_id INTEGER, entry_price REAL NOT NULL, exit_price REAL, quantity REAL NOT NULL DEFAULT 1, lot_size REAL DEFAULT 0.01, stop_loss REAL, take_profit REAL, pnl REAL, pnl_percent REAL, fees REAL DEFAULT 0, status TEXT NOT NULL DEFAULT 'open', entry_date TEXT NOT NULL, exit_date TEXT, timeframe TEXT, notes TEXT, tags TEXT DEFAULT '[]', screenshot_url TEXT, emotion TEXT, rating INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))");
  await db.exec("CREATE TABLE IF NOT EXISTS strategies (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, rules TEXT, color TEXT DEFAULT '#6366f1', active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')))");
  await db.exec("CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, balance REAL NOT NULL DEFAULT 0, initial_balance REAL DEFAULT 0, currency TEXT DEFAULT 'USD', broker TEXT, leverage REAL DEFAULT 1, is_default INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))");
  await db.exec("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT (datetime('now')))");
  await db.exec("CREATE TABLE IF NOT EXISTS daily_journal (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL UNIQUE, mood TEXT, notes TEXT, lessons TEXT, market_conditions TEXT, created_at TEXT DEFAULT (datetime('now')))");

  // Add missing columns if they don't exist
  try { await db.exec("ALTER TABLE trades ADD COLUMN account_id INTEGER"); } catch {}
  try { await db.exec("ALTER TABLE trades ADD COLUMN lot_size REAL DEFAULT 0.01"); } catch {}
  try { await db.exec("ALTER TABLE trades ADD COLUMN mt5_ticket INTEGER"); } catch {}
  try { await db.exec("ALTER TABLE trades ADD COLUMN source TEXT DEFAULT 'manual'"); } catch {}
  try { await db.exec("ALTER TABLE accounts ADD COLUMN leverage REAL DEFAULT 1"); } catch {}
  try { await db.exec("ALTER TABLE accounts ADD COLUMN initial_balance REAL DEFAULT 0"); } catch {}
  try { await db.exec("ALTER TABLE accounts ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))"); } catch {}
  try { await db.exec("ALTER TABLE trades ADD COLUMN timeframe TEXT"); } catch {}
  try { await db.exec("ALTER TABLE trades ADD COLUMN screenshot_url TEXT"); } catch {}
  try { await db.exec("ALTER TABLE trades ADD COLUMN tags TEXT DEFAULT '[]'"); } catch {}
  try { await db.exec("ALTER TABLE trades ADD COLUMN emotion TEXT"); } catch {}
  try { await db.exec("ALTER TABLE trades ADD COLUMN rating INTEGER DEFAULT 0"); } catch {}
  try { await db.exec("ALTER TABLE trades ADD COLUMN notes TEXT"); } catch {}
  try { await db.exec("ALTER TABLE trades ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))"); } catch {}
  try { await db.exec("ALTER TABLE trades ADD COLUMN deleted_at TEXT"); } catch {}
  // Default strategies
  const { count } = await db.prepare("SELECT COUNT(*) as count FROM strategies").first();
  if (count === 0) {
    for (const s of DEFAULT_STRATEGIES) {
      await db.prepare("INSERT INTO strategies (name, description, color) VALUES (?, ?, ?)").bind(s.name, s.description, s.color).run();
    }
  }
  // Default account
  const { count: ac } = await db.prepare("SELECT COUNT(*) as count FROM accounts").first();
  if (ac === 0) {
    await db.prepare("INSERT INTO accounts (name, balance, initial_balance, is_default) VALUES ('Main Account', 10000, 10000, 1)").run();
  }
}

// === TRADES ===
export async function getTrades(db, limit = 100, offset = 0, filters = {}) {
  let where = ["t.deleted_at IS NULL"];
  let params = [];
  if (filters.status) { where.push("t.status = ?"); params.push(filters.status); }
  if (filters.symbol) { where.push("t.symbol LIKE ?"); params.push('%' + filters.symbol + '%'); }
  if (filters.strategy_id) { where.push("t.strategy_id = ?"); params.push(filters.strategy_id); }
  if (filters.direction) { where.push("t.direction = ?"); params.push(filters.direction); }
  if (filters.account_id) { where.push("t.account_id = ?"); params.push(filters.account_id); }
  else { where.push("t.account_id IN (SELECT id FROM accounts)"); }

  let orderBy = 'entry_date DESC';
  if (filters.sort) {
    const sortMap = {
      'date_desc': 'entry_date DESC',
      'date_asc': 'entry_date ASC',
      'pnl_desc': 'pnl DESC',
      'pnl_asc': 'pnl ASC'
    };
    orderBy = sortMap[filters.sort] || orderBy;
  }

  const w = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const { results } = await db.prepare(`SELECT t.*, s.name as strategy_name, s.color as strategy_color FROM trades t LEFT JOIN strategies s ON t.strategy_id = s.id ${w} ORDER BY ${orderBy} LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();
  return results;
}

export async function getTrade(db, id) {
  return await db.prepare("SELECT t.*, s.name as strategy_name, s.color as strategy_color FROM trades t LEFT JOIN strategies s ON t.strategy_id = s.id WHERE t.id = ? AND t.deleted_at IS NULL").bind(id).first();
}

export async function createTrade(db, data) {
  // Validate required fields
  if (!data.symbol || !data.direction || !data.entry_price || data.entry_price <= 0) {
    throw new Error('Invalid trade data: symbol, direction, and entry_price > 0 are required');
  }
  if (data.direction !== 'long' && data.direction !== 'short') {
    throw new Error('Invalid trade data: direction must be long or short');
  }
  if (!data.entry_date) {
    throw new Error('entry_date is required');
  }

  // Prefer broker/import pnl when provided (incl. 0). Missing → calc from prices.
  // Import must omit pnl when Profit cell empty — never send fake 0 for pending/limit rows.
  let pnl = data.pnl != null && data.pnl !== '' ? Number(data.pnl) : null;
  let pnl_percent = data.pnl_percent != null && data.pnl_percent !== '' ? Number(data.pnl_percent) : null;
  const fees = data.fees != null && data.fees !== '' ? Number(data.fees) : 0;
  const qty = data.quantity || 1;
  let lotSize = data.lot_size || 0.01;

  const hasExit = data.exit_price != null && data.exit_price !== '' && data.entry_price;
  if (pnl == null && hasExit) {
    const result = calcPnL(data.direction, data.entry_price, data.exit_price, lotSize, data.symbol, fees);
    pnl = result.pnl;
    pnl_percent = result.pnl_percent;
  } else if (pnl != null && pnl_percent == null && hasExit) {
    pnl_percent = data.direction === 'short'
      ? ((data.entry_price - data.exit_price) / data.entry_price * 100)
      : ((data.exit_price - data.entry_price) / data.entry_price * 100);
  }

  const r = await db.prepare(`INSERT INTO trades (symbol, direction, strategy_id, account_id, entry_price, exit_price, quantity, lot_size, stop_loss, take_profit, pnl, pnl_percent, fees, status, entry_date, exit_date, timeframe, notes, tags, emotion, rating, screenshot_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
    data.symbol, data.direction, data.strategy_id || null, data.account_id || null,
    data.entry_price, data.exit_price != null ? data.exit_price : null, qty, lotSize,
    data.stop_loss || null, data.take_profit || null,
    pnl, pnl_percent, fees,
    data.status || (data.exit_price != null ? 'closed' : 'open'),
    data.entry_date, data.exit_date || null,
    data.timeframe || null, data.notes || null,
    JSON.stringify(data.tags || []), data.emotion || null, data.rating || 0,
    (data.screenshot_url && data.screenshot_url !== 'undefined') ? data.screenshot_url : (data.screenshot || null)
  ).run();
  const tradeId = r.meta.last_row_id;
  // If trade was created as closed (e.g. MT5 sync), adjust account balance
  const tradeStatus = data.status || (data.exit_price != null ? 'closed' : 'open');
  if (tradeStatus === 'closed' && data.account_id) {
    await _recalcBalance(db, data.account_id);
  }
  return { id: tradeId, lot_size: lotSize };
}

export async function updateTrade(db, id, data) {
  // Get current trade to recalculate PnL
  const current = await getTrade(db, id);
  if (!current) throw new Error('Trade not found');

  // Merge current data with updates
  const entry = data.entry_price !== undefined ? data.entry_price : current.entry_price;
  const exit = data.exit_price !== undefined ? data.exit_price : current.exit_price;
  const lot = data.lot_size !== undefined ? data.lot_size : current.lot_size;
  const symbol = data.symbol !== undefined ? data.symbol : current.symbol;
  const direction = data.direction !== undefined ? data.direction : current.direction;
  const fees = data.fees !== undefined ? data.fees : (current.fees || 0);

  // Prefer explicit pnl. Else recalc only if price-related fields changed.
  // Edit of strategy/notes/etc must NOT overwrite broker/import pnl.
  let pnl = current.pnl;
  let pnl_percent = current.pnl_percent;
  let status = data.status !== undefined ? data.status : current.status;
  const priceKeys = ['entry_price', 'exit_price', 'lot_size', 'symbol', 'direction', 'fees'];
  const priceChanged = priceKeys.some(k => {
    if (data[k] === undefined) return false;
    const a = data[k], b = current[k];
    if (a == null && (b == null || b === '')) return false;
    if (typeof a === 'number' || typeof b === 'number') return Number(a) !== Number(b);
    return String(a) !== String(b ?? '');
  });
  if (data.pnl != null && data.pnl !== '') {
    pnl = Number(data.pnl);
    pnl_percent = data.pnl_percent != null && data.pnl_percent !== ''
      ? Number(data.pnl_percent)
      : (exit != null && entry
          ? Math.round((direction === 'long'
              ? ((exit - entry) / entry * 100)
              : ((entry - exit) / entry * 100)) * 100) / 100
          : current.pnl_percent);
    if (exit != null && status !== 'cancelled') status = 'closed';
  } else if (priceChanged && exit !== null && exit !== undefined && entry) {
    const result = calcPnL(direction, entry, exit, lot || 0.01, symbol, fees);
    pnl = result.pnl;
    pnl_percent = result.pnl_percent;
    if (status !== 'cancelled') status = 'closed';
  } else if (priceChanged && (exit === null || exit === undefined) && status !== 'cancelled') {
    pnl = null;
    pnl_percent = null;
    status = 'open';
  }

  const TRADE_ALLOWED_FIELDS = new Set([
    'symbol', 'direction', 'strategy_id', 'account_id', 'entry_price', 'exit_price',
    'quantity', 'lot_size', 'stop_loss', 'take_profit', 'fees', 'entry_date',
    'exit_date', 'timeframe', 'notes', 'tags', 'screenshot_url', 'emotion', 'rating',
    'mt5_ticket', 'source'
  ]);
  const fields = [];
  const params = [];
  // null is intentional clear (strategy_id / stop_loss / exit_price etc.)
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && TRADE_ALLOWED_FIELDS.has(k)) {
      fields.push(`${k} = ?`);
      params.push(k === 'tags' ? JSON.stringify(v ?? []) : v);
    }
  }
  // Always set recalculated PnL and status
  fields.push('pnl = ?'); params.push(pnl);
  fields.push('pnl_percent = ?'); params.push(pnl_percent);
  fields.push('status = ?'); params.push(status);
  fields.push("updated_at = datetime('now')");
  params.push(id);
  await db.prepare(`UPDATE trades SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run();

  // Recalculate balance for affected accounts
  const newAccountId = data.account_id !== undefined ? data.account_id : current.account_id;
  const oldAccountId = current.account_id;
  if (oldAccountId) await _recalcBalance(db, oldAccountId);
  if (newAccountId && newAccountId !== oldAccountId) await _recalcBalance(db, newAccountId);

  return await getTrade(db, id);
}

async function _recalcBalance(db, accountId) {
  if (!accountId) return;
  const row = await db.prepare("SELECT initial_balance FROM accounts WHERE id = ?").bind(accountId).first();
  const initial = (row && row.initial_balance) || 0;
  const { total } = await db.prepare("SELECT COALESCE(SUM(pnl), 0) as total FROM trades WHERE account_id = ? AND status = 'closed'").bind(accountId).first();
  const newBal = Math.round((initial + (total || 0)) * 100) / 100;
  await db.prepare("UPDATE accounts SET balance = ? WHERE id = ?").bind(newBal, accountId).run();
}

export async function closeTrade(db, id, exit_price, exit_date, fees = 0) {
  const trade = await getTrade(db, id);
  if (!trade) throw new Error('Trade not found');
  const result = calcPnL(trade.direction, trade.entry_price, exit_price, trade.lot_size || 0.01, trade.symbol, fees);
  await db.prepare("UPDATE trades SET exit_price = ?, exit_date = ?, pnl = ?, pnl_percent = ?, fees = ?, status = 'closed', updated_at = datetime('now') WHERE id = ?").bind(exit_price, exit_date, result.pnl, result.pnl_percent, fees, id).run();
  await _recalcBalance(db, trade.account_id);
  return { pnl: result.pnl, pnl_percent: result.pnl_percent };
}

export async function recalculatePnL(db, opts = {}) {
  // onlyZero: null/0 closed only. Never invent PnL for pending/limit imports (notes).
  const onlyZero = !!opts.onlyZero;
  const sql = onlyZero
    ? "SELECT id, direction, entry_price, exit_price, lot_size, symbol, fees, account_id, notes FROM trades WHERE status = 'closed' AND exit_price IS NOT NULL AND (pnl IS NULL OR pnl = 0)"
    : "SELECT id, direction, entry_price, exit_price, lot_size, symbol, fees, account_id, notes FROM trades WHERE status = 'closed' AND exit_price IS NOT NULL";
  const { results } = await db.prepare(sql).all();
  let fixed = 0;
  const stmt = db.prepare("UPDATE trades SET pnl = ?, pnl_percent = ?, updated_at = datetime('now') WHERE id = ?");
  const accounts = new Set();
  for (const t of results) {
    const notes = String(t.notes || '').toLowerCase();
    // ponytail: skip pending-order imports — prices are not fills
    if (notes.includes('limit') || notes.includes('stop')) continue;
    const result = calcPnL(t.direction, t.entry_price, t.exit_price, t.lot_size || 0.01, t.symbol, t.fees || 0);
    await stmt.bind(result.pnl, result.pnl_percent, t.id).run();
    if (t.account_id) accounts.add(t.account_id);
    fixed++;
  }
  for (const aid of accounts) await _recalcBalance(db, aid);
  return { fixed, accounts: [...accounts] };
}

/** Delete open trades that match a closed trade (same acc/symbol/dir/entry/lot) — leftover pending rows after import. */
export async function cleanupOpenDupes(db) {
  const { results: opens } = await db.prepare(
    "SELECT id, account_id, symbol, direction, entry_price, lot_size FROM trades WHERE status = 'open'"
  ).all();
  let deleted = 0;
  for (const o of opens || []) {
    const closed = await db.prepare(
      "SELECT id FROM trades WHERE status = 'closed' AND account_id IS ? AND symbol = ? AND direction = ? AND ABS(entry_price - ?) < 1e-8 AND ABS(COALESCE(lot_size,0.01) - COALESCE(?,0.01)) < 1e-8 LIMIT 1"
    ).bind(o.account_id, o.symbol, o.direction, o.entry_price, o.lot_size).first();
    if (closed) {
      await db.prepare("DELETE FROM trades WHERE id = ?").bind(o.id).run();
      deleted++;
    }
  }
  return { deleted };
}

export async function deleteTrade(db, id) {
  const trade = await getTrade(db, id);
  if (!trade) return { ok: true, id, already: true };
  // ponytail: soft-delete with TTL; restore via /api/trades/:id/restore before cleanup
  await db.prepare("UPDATE trades SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL").bind(id).run();
  if (trade.status === 'closed' && trade.account_id) {
    try { await _recalcBalance(db, trade.account_id); } catch (_) { /* balance can resync later */ }
  }
  return { ok: true, id, soft: true };
}

export async function restoreTrade(db, id) {
  const r = await db.prepare("UPDATE trades SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL").bind(id).run();
  if (!r.meta || !r.meta.changes) return { ok: false, id };
  const trade = await getTrade(db, id);
  if (trade && trade.status === 'closed' && trade.account_id) {
    try { await _recalcBalance(db, trade.account_id); } catch (_) { /* balance can resync later */ }
  }
  return { ok: true, id };
}

export async function purgeSoftDeleted(db, daysOld = 7) {
  // ponytail: hard-delete anything soft-deleted more than N days ago.
  const r = await db.prepare(
    "DELETE FROM trades WHERE deleted_at IS NOT NULL AND deleted_at < datetime('now', '-' || ? || ' days')"
  ).bind(daysOld).run();
  return { purged: r.meta?.changes || 0 };
}

export { calcPnL, getContractSize, _recalcBalance };

export async function purgeOrphanTrades(db) {
  // Trades whose account was deleted (or never existed)
  const r = await db.prepare(
    "DELETE FROM trades WHERE account_id IS NOT NULL AND account_id NOT IN (SELECT id FROM accounts)"
  ).run();
  return r.meta?.changes || 0;
}

export async function syncBalances(db) {
  // Drop orphan trades first so totals match live accounts
  const purged = await purgeOrphanTrades(db);
  // Recalculate all balances from initial_balance + sum(pnl)
  // If initial_balance was never set: initial = current_balance - sum(pnl)
  const { results: accounts } = await db.prepare("SELECT id, balance, initial_balance FROM accounts").all();
  const results = [];
  for (const acc of accounts) {
    const { total } = await db.prepare("SELECT COALESCE(SUM(pnl), 0) as total FROM trades WHERE account_id = ? AND status = 'closed' AND deleted_at IS NULL").bind(acc.id).first();
    const pnlSum = total || 0;
    // If initial_balance was never set, derive it from current state
    const initial = (acc.initial_balance && acc.initial_balance !== 0) ? acc.initial_balance : Math.round(((acc.balance || 0) - pnlSum) * 100) / 100;
    const newBalance = Math.round((initial + pnlSum) * 100) / 100;
    await db.prepare("UPDATE accounts SET balance = ?, initial_balance = ? WHERE id = ?").bind(newBalance, initial, acc.id).run();
    results.push({ accountId: acc.id, balance: newBalance, initial });
  }
  const softPurged = await purgeSoftDeleted(db, 7);
  return { results, purged, softPurged: softPurged.purged };
}

// === MT5 SYNC ===
export async function syncMT5(db, accountId, positions, closedDeals, accountInfo) {
  const results = { created: 0, updated: 0, closed: 0, errors: [] };

  // Update account balance/info if provided
  if (accountInfo && accountId) {
    try {
      // Calculate initial_balance = mt5_balance - sum(pnl) to keep formula: balance = initial + sum(pnl)
      const { total } = await db.prepare("SELECT COALESCE(SUM(pnl), 0) as total FROM trades WHERE account_id = ? AND status = 'closed'").bind(accountId).first();
      const pnlSum = total || 0;
      const newInitial = Math.round(((accountInfo.balance || 0) - pnlSum) * 100) / 100;
      const newBalance = Math.round(((newInitial) + pnlSum) * 100) / 100;
      await db.prepare("UPDATE accounts SET balance=?, initial_balance=?, currency=?, leverage=?, broker=?, updated_at=datetime('now') WHERE id=?")
        .bind(newBalance, newInitial, accountInfo.currency || 'USD', accountInfo.leverage || 1, accountInfo.server || '', accountId).run();
    } catch (e) {
      results.errors.push(`account update: ${e.message}`);
    }
  } else if (accountInfo && !accountId) {
    // Try to find account by broker/server name
    try {
      const existing = await db.prepare("SELECT id FROM accounts WHERE broker = ?").bind(accountInfo.server || '').first();
      if (existing) {
        await db.prepare("UPDATE accounts SET balance=?, currency=?, leverage=?, updated_at=datetime('now') WHERE id=?")
          .bind(accountInfo.balance || 0, accountInfo.currency || 'USD', accountInfo.leverage || 1, existing.id).run();
      }
    } catch {}
  }

  // Upsert open positions
  for (const p of positions) {
    try {
      const existing = await db.prepare("SELECT id, status FROM trades WHERE mt5_ticket = ?").bind(p.ticket).first();
      const direction = p.type === 'buy' ? 'long' : 'short';
      const openTime = mt5TimeToISO(p.open_time);
      const fees = Math.abs(p.commission || 0) + Math.abs(p.swap || 0);

      if (existing) {
        // Update existing open trade (current price/profit)
        await db.prepare(`UPDATE trades SET stop_loss=?, take_profit=?, fees=?, updated_at=datetime('now') WHERE id=?`)
          .bind(p.sl || null, p.tp || null, fees, existing.id).run();
        results.updated++;
      } else {
        // Create new trade
        await db.prepare(`INSERT INTO trades (symbol, direction, entry_price, lot_size, stop_loss, take_profit, fees, status, entry_date, mt5_ticket, source, account_id, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
          .bind(p.symbol, direction, p.open_price, p.volume, p.sl || null, p.tp || null, fees, 'open', openTime, p.ticket, 'mt5', accountId, p.comment || null).run();
        results.created++;
      }
    } catch (e) {
      results.errors.push(`pos ${p.ticket}: ${e.message}`);
    }
  }

  // Process closed deals
  for (const d of closedDeals) {
    try {
      const existing = await db.prepare("SELECT id, status FROM trades WHERE mt5_ticket = ?").bind(d.ticket).first();
      const direction = d.type === 'buy' ? 'long' : 'short';
      const openTime = mt5TimeToISO(d.open_time);
      const closeTime = mt5TimeToISO(d.close_time);
      const fees = Math.abs(d.commission || 0) + Math.abs(d.swap || 0);

      if (existing && existing.status === 'open') {
        // Close existing trade — prefer broker profit when present (avoids fee double-count)
        if (d.profit != null && d.profit !== '') {
          await db.prepare("UPDATE trades SET exit_price=?, exit_date=?, pnl=?, pnl_percent=?, fees=?, status='closed', updated_at=datetime('now') WHERE id=?")
            .bind(d.close_price, closeTime, Number(d.profit) + (Number(d.commission)||0) + (Number(d.swap)||0), null, fees, existing.id).run();
          await _recalcBalance(db, accountId);
        } else {
          await closeTrade(db, existing.id, d.close_price, closeTime, fees);
        }
        results.closed++;
      } else if (!existing) {
        // Create as already closed trade — prefer broker net pnl
        let pnl, pnl_percent;
        if (d.profit != null && d.profit !== '') {
          pnl = Number(d.profit) + (Number(d.commission)||0) + (Number(d.swap)||0);
          pnl_percent = d.open_price
            ? (direction === 'long'
                ? ((d.close_price - d.open_price) / d.open_price * 100)
                : ((d.open_price - d.close_price) / d.open_price * 100))
            : null;
        } else {
          const result = calcPnL(direction, d.open_price, d.close_price, d.volume, d.symbol, fees);
          pnl = result.pnl; pnl_percent = result.pnl_percent;
        }
        await db.prepare(`INSERT INTO trades (symbol, direction, entry_price, exit_price, lot_size, stop_loss, take_profit, pnl, pnl_percent, fees, status, entry_date, exit_date, mt5_ticket, source, account_id, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
          .bind(d.symbol, direction, d.open_price, d.close_price, d.volume, d.sl || null, d.tp || null, pnl, pnl_percent, fees, 'closed', openTime, closeTime, d.ticket, 'mt5', accountId, d.comment || null).run();
        if (accountId) await _recalcBalance(db, accountId);
        results.closed++;
      }
    } catch (e) {
      results.errors.push(`deal ${d.ticket}: ${e.message}`);
    }
  }

  return results;
}

function mt5TimeToISO(mt5time) {
  // MT5 format: "2026.06.29 10:30:00" or Unix timestamp (sec or ms)
  if (!mt5time) return null;
  if (typeof mt5time === 'number') {
    // If too large, treat as milliseconds; otherwise seconds
    const ms = mt5time > 1e11 ? mt5time : mt5time * 1000;
    return new Date(ms).toISOString().replace('T', ' ').slice(0, 19);
  }
  return mt5time.replace(/\./g, '-').replace(' ', 'T').slice(0, 19);
}

// Get trades by mt5_ticket for sync dedup
export async function getTradeByMT5Ticket(db, ticket) {
  return await db.prepare("SELECT * FROM trades WHERE mt5_ticket = ?").bind(ticket).first();
}

// === STATS ===
// Build WHERE + params with account filter. All queries are parameterized (no string concat).
function _statsFilter(accountId, extraClauses = []) {
  const where = [`status = 'closed'`, `deleted_at IS NULL`, ...extraClauses];
  const params = [];
  if (accountId != null) {
    where.push('account_id = ?');
    params.push(accountId);
  } else {
    // "All accounts" = only existing accounts (ignore orphan trades of deleted accounts)
    where.push('account_id IN (SELECT id FROM accounts)');
  }
  return { clause: where.join(' AND '), params };
}

export async function getStats(db, accountId = null) {
  const w = _statsFilter(accountId);
  const ac = w.clause;
  const ap = w.params;
  const run = async (sql, extraParams = [], mode = 'first') => {
    const stmt = db.prepare(sql).bind(...ap, ...extraParams);
    return mode === 'all' ? (await stmt.all()).results : await stmt.first();
  };

  // All single-row aggregates in one query (sqlite can do this) — saves round-trips
  const agg = await run(`SELECT
    COUNT(*) as total,
    SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as wins,
    SUM(CASE WHEN pnl < 0 THEN 1 ELSE 0 END) as losses,
    SUM(CASE WHEN pnl = 0 THEN 1 ELSE 0 END) as breakeven,
    COALESCE(SUM(pnl), 0) as totalPnl,
    COALESCE(AVG(CASE WHEN pnl > 0 THEN pnl END), 0) as avgWin,
    COALESCE(AVG(CASE WHEN pnl < 0 THEN pnl END), 0) as avgLoss,
    MAX(pnl) as bestTrade,
    MIN(pnl) as worstTrade,
    COALESCE(SUM(fees), 0) as totalFees
  FROM trades WHERE ${ac}`);

  const total = { c: agg.total || 0 };
  const wins = { c: agg.wins || 0 };
  const losses = { c: agg.losses || 0 };
  const breakeven = { c: agg.breakeven || 0 };
  const totalPnl = { v: agg.totalPnl || 0 };
  const avgWin = { v: agg.avgWin || 0 };
  const avgLoss = { v: agg.avgLoss || 0 };
  const bestTrade = { v: agg.bestTrade || 0 };
  const worstTrade = { v: agg.worstTrade || 0 };
  const totalFees = { v: agg.totalFees || 0 };

  // Open trades (uses different status filter)
  const openW = accountId != null
    ? `status = 'open' AND account_id = ? AND deleted_at IS NULL`
    : `status = 'open' AND account_id IN (SELECT id FROM accounts) AND deleted_at IS NULL`;
  const openParams = accountId != null ? [accountId] : [];
  const openTrades = await db.prepare(`SELECT COUNT(*) as c FROM trades WHERE ${openW}`).bind(...openParams).first();

  // Average RR: actual risk = |entry - SL| / entry * 100, reward = pnl_percent
  const avgRR = await run(`SELECT COALESCE(AVG(
    CASE WHEN pnl > 0 AND stop_loss > 0 AND entry_price > 0
      THEN pnl_percent / (ABS(entry_price - stop_loss) / entry_price * 100.0)
      ELSE NULL END
  ), 0) as v FROM trades WHERE ${ac}`);

  const winRate = total.c > 0 ? (wins.c / total.c * 100) : 0;
  const profitFactor = (losses.c > 0 && avgLoss.v !== 0) ? Math.abs(avgWin.v * wins.c / (avgLoss.v * losses.c)) : (wins.c > 0 ? Infinity : 0);

  // Equity curve (last 30 closed trades)
  const equity = await run(`SELECT exit_date, pnl, SUM(pnl) OVER (ORDER BY exit_date) as cumulative FROM (SELECT exit_date, pnl FROM trades WHERE ${ac} ORDER BY exit_date DESC LIMIT 30) sub ORDER BY exit_date ASC`, [], 'all');

  // Monthly P&L
  const monthly = await run(`SELECT strftime('%Y-%m', exit_date) as month, SUM(pnl) as pnl, COUNT(*) as trades FROM trades WHERE ${ac} GROUP BY month ORDER BY month DESC LIMIT 12`, [], 'all');

  // Strategy breakdown
  const byStrategy = await run(`SELECT s.name, s.color, COUNT(*) as trades, SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) as wins, COALESCE(SUM(t.pnl), 0) as total_pnl, COALESCE(AVG(t.pnl), 0) as avg_pnl FROM trades t JOIN strategies s ON t.strategy_id = s.id WHERE ${ac} GROUP BY s.id ORDER BY total_pnl DESC`, [], 'all');

  // By symbol
  const bySymbol = await run(`SELECT symbol, COUNT(*) as trades, COALESCE(SUM(pnl), 0) as total_pnl FROM trades WHERE ${ac} GROUP BY symbol ORDER BY total_pnl DESC LIMIT 10`, [], 'all');

  // By direction (one query, two aggregates)
  const dirAgg = await run(`SELECT
    SUM(CASE WHEN direction = 'long' THEN 1 ELSE 0 END) as longCount,
    SUM(CASE WHEN direction = 'long' THEN pnl ELSE 0 END) as longPnl,
    SUM(CASE WHEN direction = 'short' THEN 1 ELSE 0 END) as shortCount,
    SUM(CASE WHEN direction = 'short' THEN pnl ELSE 0 END) as shortPnl
  FROM trades WHERE ${ac}`);
  const longStats = { c: dirAgg.longCount || 0, pnl: dirAgg.longPnl || 0 };
  const shortStats = { c: dirAgg.shortCount || 0, pnl: dirAgg.shortPnl || 0 };

  // Max Drawdown + streak (one query: ordered pnl list)
  const allPnl = await run(`SELECT pnl FROM trades WHERE ${ac} ORDER BY exit_date ASC`, [], 'all');
  let peak = 0, maxDD = 0, cumPnl = 0;
  for (const row of allPnl) {
    cumPnl += row.pnl || 0;
    if (cumPnl > peak) peak = cumPnl;
    const dd = peak - cumPnl;
    if (dd > maxDD) maxDD = dd;
  }

  // Current streak (reverse iterate)
  let streak = 0, streakType = '';
  for (let i = allPnl.length - 1; i >= 0; i--) {
    const row = allPnl[i];
    if (streak === 0) streakType = row.pnl >= 0 ? 'win' : 'loss';
    if ((streakType === 'win' && row.pnl >= 0) || (streakType === 'loss' && row.pnl < 0)) streak++;
    else break;
  }

  // Today's stats — parameterized
  const today = new Date().toISOString().slice(0, 10);
  const todayExtra = accountId != null
    ? ' AND account_id = ?'
    : ' AND account_id IN (SELECT id FROM accounts)';
  const todayParams = accountId != null ? [today, accountId] : [today];
  const todayTrades = await db.prepare(`SELECT COUNT(*) as c, COALESCE(SUM(pnl), 0) as pnl FROM trades WHERE status = 'closed' AND date(exit_date) = ?${todayExtra}`).bind(...todayParams).first();

  // Recent 5 closed trades
  const recentTrades = await run(`SELECT t.*, s.name as strategy_name, s.color as strategy_color FROM trades t LEFT JOIN strategies s ON t.strategy_id = s.id WHERE ${ac} ORDER BY t.exit_date DESC LIMIT 5`, [], 'all');

  return {
    total: total.c, wins: wins.c, losses: losses.c, breakeven: breakeven.c,
    winRate: Math.round(winRate * 10) / 10,
    totalPnl: Math.round(totalPnl.v * 100) / 100,
    avgWin: Math.round(avgWin.v * 100) / 100,
    avgLoss: Math.round(avgLoss.v * 100) / 100,
    bestTrade: Math.round(bestTrade.v * 100) / 100,
    worstTrade: Math.round(worstTrade.v * 100) / 100,
    totalFees: Math.round(totalFees.v * 100) / 100,
    openTrades: openTrades.c,
    profitFactor: profitFactor === Infinity ? Infinity : Math.round(profitFactor * 100) / 100,
    avgRR: Math.round(avgRR.v * 100) / 100,
    equity, monthly, byStrategy, bySymbol,
    long: { trades: longStats.c, pnl: Math.round(longStats.pnl * 100) / 100 },
    short: { trades: shortStats.c, pnl: Math.round(shortStats.pnl * 100) / 100 },
    maxDrawdown: Math.round(maxDD * 100) / 100,
    streak, streakType,
    todayPnl: Math.round(todayTrades.pnl * 100) / 100, todayTrades: todayTrades.c,
    recentTrades,
  };
}

// === STRATEGIES ===
export async function getStrategies(db) {
  // Include per-strategy trade stats so the Strategies tab can show real numbers
  const { results } = await db.prepare(`
    SELECT s.*,
      COALESCE(t.trade_count, 0) AS trade_count,
      COALESCE(t.total_pnl, 0) AS total_pnl,
      COALESCE(t.win_count, 0) AS win_count,
      CASE WHEN COALESCE(t.trade_count,0) > 0
        THEN ROUND(COALESCE(t.win_count,0) * 100.0 / t.trade_count, 1)
        ELSE 0 END AS win_rate
    FROM strategies s
    LEFT JOIN (
      SELECT strategy_id,
        COUNT(*) AS trade_count,
        COALESCE(SUM(pnl), 0) AS total_pnl,
        SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) AS win_count
      FROM trades WHERE status = 'closed' AND strategy_id IS NOT NULL
      GROUP BY strategy_id
    ) t ON t.strategy_id = s.id
    ORDER BY s.name
  `).all();
  return results;
}
export async function createStrategy(db, data) {
  const r = await db.prepare("INSERT INTO strategies (name, description, rules, color) VALUES (?, ?, ?, ?)").bind(data.name, data.description || '', data.rules || '', data.color || '#6366f1').run();
  return { id: r.meta.last_row_id };
}
export async function updateStrategy(db, id, data) {
  await db.prepare("UPDATE strategies SET name=?, description=?, rules=?, color=? WHERE id=?")
    .bind(data.name, data.description || '', data.rules || '', data.color || '#6366f1', id).run();
  return { ok: true, id };
}
export async function deleteStrategy(db, id) {
  await db.prepare("DELETE FROM strategies WHERE id = ?").bind(id).run();
}

// === ACCOUNTS ===
export async function getAccounts(db) {
  const { results } = await db.prepare("SELECT * FROM accounts ORDER BY is_default DESC").all();
  return results;
}
export async function createAccount(db, data) {
  const initialBalance = data.initial_balance ?? data.balance ?? 0;
  const r = await db.prepare("INSERT INTO accounts (name, balance, initial_balance, currency, broker, leverage) VALUES (?, ?, ?, ?, ?, ?)").bind(data.name, initialBalance, initialBalance, data.currency || 'USD', data.broker || '', data.leverage || 1).run();
  return { id: r.meta.last_row_id };
}
const ACCOUNT_ALLOWED_FIELDS = new Set(['name', 'initial_balance', 'currency', 'broker', 'leverage', 'is_default']);

export async function updateAccount(db, id, data) {
  const fields = [];
  const params = [];
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined && ACCOUNT_ALLOWED_FIELDS.has(k)) {
      fields.push(`${k} = ?`);
      params.push(v);
    }
  }
  if (fields.length === 0) return { ok: true, id };
  params.push(id);
  await db.prepare(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run();
  // If initial_balance changed, recalculate balance
  if (data.initial_balance !== undefined) {
    await _recalcBalance(db, id);
  }
  return { ok: true, id };
}
export async function deleteAccount(db, id) {
  await db.prepare("DELETE FROM trades WHERE account_id = ?").bind(id).run();
  await db.prepare("DELETE FROM accounts WHERE id = ?").bind(id).run();
}

// === DAILY JOURNAL ===
export async function getJournalEntries(db, limit = 30) {
  const { results } = await db.prepare("SELECT * FROM daily_journal ORDER BY date DESC LIMIT ?").bind(limit).all();
  return results;
}
export async function saveJournalEntry(db, data) {
  await db.prepare("INSERT OR REPLACE INTO daily_journal (date, mood, notes, lessons, market_conditions) VALUES (?, ?, ?, ?, ?)").bind(data.date, data.mood || '', data.notes || '', data.lessons || '', data.market_conditions || '').run();
  return { ok: true, date: data.date };
}

// === SETTINGS ===
export async function getSetting(db, key) {
  const r = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first();
  return r ? r.value : null;
}
export async function setSetting(db, key, value) {
  await db.prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))").bind(key, value).run();
}
