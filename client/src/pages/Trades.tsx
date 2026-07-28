import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../App';
import { api } from '../lib/api';
import { askConfirm } from '../lib/confirm';
import { toast } from '../lib/toast';
import { Search, Plus, Edit, Trash2, X, Download, Upload, FileSpreadsheet, FileText, RotateCcw, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

interface TradesProps { accountId: number | null }

export function Trades({ accountId }: TradesProps) {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [trades, setTrades] = useState<any[]>([]);
  const [_loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
    direction: '', status: '', strategy: '',
    pnl: '',  // '' | 'winners' | 'losers' | 'breakeven'
    dateFrom: '', dateTo: '',
    sort: 'date_desc',
  });
  const [strategies, setStrategies] = useState<any[]>([]);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeId, setCloseId] = useState<number | null>(null);
  const [closeForm, setCloseForm] = useState({ exit_price: '', exit_date: new Date().toISOString().slice(0, 16), fees: '0' });
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [imgScale, setImgScale] = useState(1);
  const [imgPos, setImgPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const lastTap = useRef(0);
  const pinchDist = useRef(0);

  useEffect(() => { if (lightboxUrl) { setImgScale(1); setImgPos({ x: 0, y: 0 }); } }, [lightboxUrl]);
  useEffect(() => { if (imgScale <= 1) setImgPos({ x: 0, y: 0 }); }, [imgScale]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, ox: imgPos.x, oy: imgPos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || imgScale <= 1) return;
    setImgPos({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  };
  const onPointerUp = () => { dragging.current = false; };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setImgScale(s => Math.min(5, Math.max(0.5, s + (e.deltaY < 0 ? 0.25 : -0.25))));
  };

  // Touch: double-tap + pinch
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0 && e.changedTouches.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        setImgScale(s => s > 1 ? 1 : 2);
        setImgPos({ x: 0, y: 0 });
        lastTap.current = 0;
        return;
      }
      lastTap.current = now;
    }
    if (e.touches.length < 2) pinchDist.current = 0;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (pinchDist.current) {
        const ratio = d / pinchDist.current;
        setImgScale(s => Math.min(5, Math.max(0.5, s * ratio)));
      }
      pinchDist.current = d;
    }
  };

  const loadTrades = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '500' };
      if (accountId) params.account_id = String(accountId);
      if (search) params.symbol = search;
      if (filters.direction) params.direction = filters.direction;
      if (filters.status) params.status = filters.status;
      if (filters.strategy) params.strategy_id = filters.strategy;
      if (filters.sort) params.sort = filters.sort;
      const r = await api.getTrades(params);
      setTrades(r.trades || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [accountId, search, filters.direction, filters.status, filters.strategy, filters.sort]);

  useEffect(() => { loadTrades(); }, [loadTrades]);
  // ponytail: load strategies list once for the filter dropdown
  useEffect(() => { api.getStrategies().then(r => setStrategies(r.strategies || [])).catch(() => {}); }, []);

  // ponytail: outside click closes filter popover
  useEffect(() => {
    if (!showFilter) return;
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFilter]);

  // ponytail: apply leftover cheap filters client-side (pnl category + date range) over already-fetched trades
  const visibleTrades = trades.filter(tr => {
    if (filters.pnl === 'winners' && !(tr.pnl > 0)) return false;
    if (filters.pnl === 'losers' && !(tr.pnl < 0)) return false;
    if (filters.pnl === 'breakeven' && !(tr.pnl === 0)) return false;
    if (filters.dateFrom && (tr.entry_date?.slice(0, 10) || '') < filters.dateFrom) return false;
    if (filters.dateTo && (tr.entry_date?.slice(0, 10) || '') > filters.dateTo) return false;
    return true;
  });
  const closedTrades = visibleTrades.filter(t => t.status === 'closed');
  const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  const openCount = visibleTrades.filter(t => t.status === 'open').length;

  const activeFilterCount = (['direction','status','strategy','pnl','dateFrom','dateTo']).filter(k => filters[k as keyof typeof filters]).length;
  const resetFilters = () => setFilters({ direction: '', status: '', strategy: '', pnl: '', dateFrom: '', dateTo: '', sort: filters.sort });

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selectedIds.size === visibleTrades.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(visibleTrades.map(t => t.id)));
  };
  const handleBulkDelete = async () => {
    if (!(await askConfirm(`${selectedIds.size} ${t('delete')}?`))) return;
    const ids = [...selectedIds];
    setTrades(prev => prev.filter(t => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
    try {
      for (const id of ids) await api.deleteTrade(id);
      toast(t('deleted'), 'ok', 7000, {
        label: t('undo'),
        onClick: async () => {
          try {
            for (const id of ids) await api.restoreTrade(id);
            window.dispatchEvent(new Event('tj-data-changed'));
          } catch (e: any) { toast(e?.message || t('error'), 'err'); }
          finally { loadTrades(); }
        },
      });
      window.dispatchEvent(new Event('tj-data-changed'));
    } catch (e: any) { toast(e?.message || t('error'), 'err'); }
    finally { loadTrades(); }
  };

  const handleDelete = async (id: number) => {
    if (!(await askConfirm(t('confirmDelete')))) return;
    setTrades(prev => prev.filter(t => t.id !== id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    try {
      await api.deleteTrade(id);
      toast(t('deleted'), 'ok', 7000, {
        label: t('undo'),
        onClick: async () => {
          try {
            await api.restoreTrade(id);
            window.dispatchEvent(new Event('tj-data-changed'));
          } catch (e: any) { toast(e?.message || t('error'), 'err'); }
          finally { loadTrades(); }
        },
      });
      window.dispatchEvent(new Event('tj-data-changed'));
    } catch (e: any) { toast(e?.message || t('error'), 'err'); }
    finally { loadTrades(); }
  };

  const handleClose = async () => {
    if (!closeId || !closeForm.exit_price) { toast(t('error'), 'err'); return; }
    try {
      await api.closeTrade(closeId, { exit_price: Number(closeForm.exit_price), exit_date: closeForm.exit_date, fees: Number(closeForm.fees) || 0 });
      setShowCloseModal(false);
      toast(t('saved'));
      window.dispatchEvent(new Event('tj-data-changed'));
    } catch (e: any) { toast(e?.message || t('error'), 'err'); }
    finally { loadTrades(); }
  };

  const exportExcel = () => {
    const rows = visibleTrades.map(tr => ({
      [t('symbol')]: tr.symbol, [t('direction')]: tr.direction, [t('entryPrice')]: tr.entry_price, [t('exitPrice')]: tr.exit_price || '',
      [t('pnl')]: tr.pnl ?? '', 'PnL%': tr.pnl_percent ?? '', [t('fees')]: tr.fees || 0,
      [t('strategy')]: tr.strategy_name || '', [t('account')]: tr.account_name || '',
      [t('entryDate')]: tr.entry_date?.slice(0, 10) || '', [t('exitDate')]: tr.exit_date?.slice(0, 10) || '',
      [t('status')]: tr.status, [t('notes')]: tr.notes || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trades');
    const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], { type: 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `trades_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportPDF = () => {
    const rows = visibleTrades.map(tr => [
      tr.symbol, tr.direction === 'long' ? t('long') : t('short'),
      tr.entry_price, tr.exit_price ?? '-', tr.pnl?.toFixed(2) ?? '-', tr.strategy_name || '-',
      tr.entry_date?.slice(0, 10) || '-', tr.status === 'closed' ? t('closed') : t('open'),
    ]);
    const html = `<!DOCTYPE html><html dir="${lang === 'fa' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8">
<title>Trade Journal</title><style>
  body{font-family:system-ui,sans-serif;margin:20px;direction:${lang === 'fa' ? 'rtl' : 'ltr'}}
  h2{margin-bottom:8px} table{width:100%;border-collapse:collapse;font-size:12px}
  th,td{border:1px solid #ccc;padding:6px 8px;text-align:inherit} th{background:#f5f5f5;font-weight:600}
  tr:nth-child(even){background:#fafafa} @media print{body{margin:0} th{background:#eee!important;-webkit-print-color-adjust:exact}}
</style></head><body>
<h2>Trade Journal — ${new Date().toLocaleDateString()}</h2>
<table><thead><tr>
  <th>${t('symbol')}</th><th>${t('direction')}</th><th>${t('entryPrice')}</th>
  <th>${t('exitPrice')}</th><th>${t('pnl')}</th><th>${t('strategy')}</th>
  <th>${t('date')}</th><th>${t('status')}</th>
</tr></thead><tbody>${rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('')}</tbody></table>
<script>window.onload=()=>window.print();</script></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  const importFileRef = useRef<HTMLInputElement>(null);
  const [importAccountId, setImportAccountId] = useState<number | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => { api.getAccounts().then(r => setAccounts(r.accounts || [])); }, []);

  // Ponytail: handles MT4/MT5 HTML reports + CSV + XLSX
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { await doImport(file); }
    catch (err: any) { console.error(err); toast(err?.message || t('error'), 'err'); }
    e.target.value = '';
  };

  const doImport = async (file: File) => {
    const name = file.name.toLowerCase();
    const isHtml = name.endsWith('.html') || name.endsWith('.htm') || file.type.includes('html');
    let allRows: string[][];
    if (isHtml) {
      const html = await file.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const tables = doc.querySelectorAll('table');
      if (!tables.length) throw new Error('No <table> found in HTML');
      // pick largest table
      let best = tables[0];
      for (const t of tables) { if (t.rows.length > best.rows.length) best = t; }
      allRows = Array.from(best.querySelectorAll('tr')).map(tr =>
        Array.from(tr.querySelectorAll('th,td')).map(c => c.textContent || '')
      );
    } else {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      allRows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });
    }

    // Scan ALL headers, prefer Positions (all-in-one row) > Deals (needs in+out pairing) > MT4
    const detectKind = (r: string[]): 'positions' | 'deals' | 'mt4' | null => {
      const set = new Set(r.map(c => String(c).trim().toLowerCase()));
      if (set.has('position')) return 'positions';
      if (set.has('deal')) return 'deals';
      if (set.has('item') || set.has('ticket')) return 'mt4';
      return null;
    };
    let hdrIdx = -1, kind: 'positions' | 'deals' | 'mt4' | null = null;
    for (let i = 0; i < allRows.length; i++) {
      const k = detectKind(allRows[i]);
      if (k === 'positions') { hdrIdx = i; kind = k; break; } // best — stop immediately
      if (k && hdrIdx < 0) { hdrIdx = i; kind = k; }          // first fallback
    }
    if (hdrIdx < 0 || !kind) throw new Error('Header row not found (expected "Deal", "Position", "Item", or "Ticket")');
    let headers = allRows[hdrIdx].map(h => String(h).trim());
    // Stop at next section title — filter() doesn't stop, use takeWhile
    const sectionTitles = new Set(['orders','deals','positions','working orders','results','open trades','closed trades','summary']);
    const initialRows: string[][] = [];
    for (const r of allRows.slice(hdrIdx + 1)) {
      const c0 = String(r[0] || '').trim().toLowerCase();
      if (sectionTitles.has(c0)) break;
      if (r.length > 2 && String(r[2]).trim()) initialRows.push(r);
    }

    // For Deals table: pair in+out rows by Order → one synthetic row per trade
    let dataRows = initialRows;
    if (kind === 'deals') {
      const hdrLower = headers.map(h => h.toLowerCase());
      const iDir = hdrLower.indexOf('direction');
      const iOrd = hdrLower.indexOf('order');
      if (iDir < 0 || iOrd < 0) throw new Error('Deals table missing Direction/Order columns');
      const trading = initialRows.filter(r => {
        const t = String(r[3] || '').trim().toLowerCase();
        return t === 'buy' || t === 'sell';
      });
      const inRows = new Map<string, string[]>();
      for (const r of trading) {
        if (String(r[iDir] || '').trim().toLowerCase() === 'in') inRows.set(String(r[iOrd] || '').trim(), r);
      }
      // Build synthetic rows: [openTime, dealId, symbol, type, volume, entryPrice, sl, closePrice, closeTime, commission, fee, swap, profit, ticket]
      const merged: string[][] = [];
      for (const r of trading) {
        if (String(r[iDir] || '').trim().toLowerCase() !== 'out') continue;
        const order = String(r[iOrd] || '').trim();
        const inR = inRows.get(order);
        if (!inR) continue;
        merged.push([
          inR[0],   // openTime
          inR[1],   // dealId → ticket
          inR[2],   // symbol
          inR[3],   // type (buy/sell)
          inR[5],   // volume
          inR[6],   // entry price
          inR[7] || '', // SL (order# in deals, but reuse for dedup)
          r[6],     // exit price
          r[0],     // close time
          String(Number(inR[8] || 0) + Number(r[8] || 0)),   // commission
          String(Number(inR[9] || 0) + Number(r[9] || 0)),   // fee
          String(Number(inR[10] || 0) + Number(r[10] || 0)), // swap
          r[11],    // profit (from out row)
          order,    // ticket = order#
        ]);
      }
      dataRows = merged;
      headers = ['Time','Deal','Symbol','Type','Volume','Price','S/L','Close Price','Close Time','Commission','Fee','Swap','Profit','Order'];
    }

    const col = (names: string[]) => {
      for (const n of names) {
        const i = headers.findIndex(h => h.toLowerCase().replace(/\s/g, '') === n.toLowerCase().replace(/\s/g, ''));
        if (i >= 0) return i;
      }
      return -1;
    };
    const iType = col(['type']);
    const iItem = col(['item', 'symbol', 'pair']);
    const iSize = col(['size', 'lots', 'volume']);
    const iSL = col(['s/l', 'sl', 'stop_loss']);
    const iTp = col(['t/p', 'tp', 'take_profit']);
    const iOpenTime = col(['open time', 'time']);
    let iCloseTime = col(['close time']);
    // ponytail: if no explicit "Close Time", second "Time" column is close time (Positions table)
    if (iCloseTime < 0) {
      const timeCols = headers.reduce<number[]>((a, h, i) => h.toLowerCase().trim() === 'time' ? [...a, i] : a, []);
      if (timeCols.length >= 2) iCloseTime = timeCols[1];
    }
    const iCommission = col(['commission']);
    const iTaxes = col(['taxes']);
    const iSwap = col(['swap']);
    const iProfit = col(['profit']);
    const iTicket = col(['ticket', 'order', 'position', 'deal']);

    // Two 'Price' columns → second is close price; single 'Close Price' column → explicit
    const priceIndices = headers.reduce<number[]>((a, h, i) => h.toLowerCase().replace(/\s/g, '') === 'price' ? [...a, i] : a, []);
    const iEntryPrice = priceIndices[0] ?? -1;
    const iClosePrice = col(['close price']) >= 0 ? col(['close price']) : (priceIndices[1] ?? -1);

    // Dedup against DB (and within this file) so re-import only adds new rows
    const normSym = (s: string) => String(s || '').replace(/[\/.\s]/g, '').toUpperCase();
    const normDate = (d: string) => String(d || '').replace(/[./]/g, '-').replace('T', ' ').trim().slice(0, 16);
    const tradeKey = (o: { account_id?: any; symbol: string; direction: string; entry_price: any; exit_price?: any; lot_size?: any; entry_date?: any; ticket?: any }) => {
      if (o.ticket != null && String(o.ticket).trim() !== '') {
        return `t|${o.account_id ?? ''}|${String(o.ticket).trim()}`;
      }
      return [
        o.account_id ?? '',
        normSym(o.symbol),
        o.direction,
        Number(o.entry_price).toFixed(5),
        o.exit_price != null && o.exit_price !== '' ? Number(o.exit_price).toFixed(5) : 'open',
        Number(o.lot_size || 0.01).toFixed(4),
        normDate(String(o.entry_date || '')),
      ].join('|');
    };
    const q: Record<string, string> = { limit: '1000' };
    if (importAccountId) q.account_id = String(importAccountId);
    const existing = (await api.getTrades(q)).trades || [];
    // fingerprint only (no ticket) — matches past re-imports that lacked ticket in notes
    const fpOf = (t: any) => tradeKey({
      account_id: t.account_id, symbol: t.symbol, direction: t.direction,
      entry_price: t.entry_price, exit_price: t.exit_price, lot_size: t.lot_size,
      entry_date: t.entry_date,
    });
    const byFp = new Map<string, any[]>();
    for (const t of existing) {
      const k = fpOf(t);
      if (!byFp.has(k)) byFp.set(k, []);
      byFp.get(k)!.push(t);
    }
    let deleted = 0;
    const seen = new Set<string>();
    for (const [k, list] of byFp) {
      list.sort((a, b) => a.id - b.id);
      seen.add(k);
      // also mark ticket keys of keepers so file rows with ticket still skip
      for (const t of list) {
        const m = String(t.notes || '').match(/#(\d+)/);
        const tk = t.mt5_ticket || m?.[1];
        if (tk) seen.add(tradeKey({ account_id: t.account_id, symbol: t.symbol, direction: t.direction, entry_price: t.entry_price, ticket: tk }));
      }
      for (const extra of list.slice(1)) {
        try { await api.deleteTrade(extra.id); deleted++; }
        catch (err) { console.error('dedupe delete failed', extra.id, err); }
      }
    }

    let imported = 0;
    let skipped = 0;
    let dupes = 0;
    for (const row of dataRows) {
      const type = String(row[iType] || '').trim().toLowerCase();
      // Skip deposits, cancelled, balance, and pending orders (limit/stop — not real fills)
      if (!type || type === 'balance' || type.includes('cancelled') || type === 'credit') { skipped++; continue; }
      if (type.includes('limit') || type.includes('stop')) { skipped++; continue; }
      const sym = String(row[iItem] || '').trim().toUpperCase();
      const entry = parseFloat(String(row[iEntryPrice] || '0'));
      if (!sym || !entry || isNaN(entry)) { skipped++; continue; }
      // empty Profit cell must NOT become 0 — that blocked server calc and left closed trades at pnl=0
      const profitCell = iProfit >= 0 ? String(row[iProfit] ?? '').trim() : '';
      const profitParsed = profitCell === '' ? null : parseFloat(profitCell);
      const hasBrokerPnl = profitParsed != null && !Number.isNaN(profitParsed);
      const profit = hasBrokerPnl ? profitParsed : 0;
      const closePrice = iClosePrice >= 0 ? parseFloat(String(row[iClosePrice] || '0')) || null : null;
      const commission = (parseFloat(String(row[iCommission] || '0')) || 0);
      const taxes = (parseFloat(String(row[iTaxes] || '0')) || 0);
      const swap = (parseFloat(String(row[iSwap] || '0')) || 0);
      // MT Profit column is usually pure price PnL; net = profit + commission + swap + taxes
      const feeAbs = Math.abs(commission) + Math.abs(taxes) + Math.abs(swap);
      const netPnl = hasBrokerPnl ? (profit + commission + taxes + swap) : null;
      const sl = iSL >= 0 ? parseFloat(String(row[iSL] || '0')) || null : null;
      const tp = iTp >= 0 ? parseFloat(String(row[iTp] || '0')) || null : null;
      const size = iSize >= 0 ? parseFloat(String(row[iSize] || '0.01')) || 0.01 : 0.01;
      const openTime = iOpenTime >= 0 ? String(row[iOpenTime] || '') : '';
      const closeTime = iCloseTime >= 0 ? String(row[iCloseTime] || '') : '';
      const dir = type.startsWith('buy') ? 'long' : 'short';
      const isClosed = closePrice != null && closePrice !== 0;
      const ticket = iTicket >= 0 ? String(row[iTicket] || '').trim() : '';
      const base = {
        account_id: importAccountId || null,
        symbol: sym, direction: dir, entry_price: entry,
        exit_price: isClosed ? closePrice : null, lot_size: size, entry_date: openTime,
      };
      const fp = tradeKey(base);
      const key = ticket ? tradeKey({ ...base, ticket }) : fp;
      if (seen.has(key) || seen.has(fp)) { dupes++; continue; }
      seen.add(key);
      seen.add(fp);
      try {
        await api.createTrade({
          symbol: sym, direction: dir, entry_price: entry,
          exit_price: isClosed ? closePrice : null,
          lot_size: size, stop_loss: sl, take_profit: tp,
          account_id: importAccountId || null,
          fees: feeAbs,
          // only send broker pnl when Profit cell was present; else server calcPnL from prices
          pnl: isClosed && netPnl != null ? netPnl : undefined,
          entry_date: openTime || new Date().toISOString(),
          exit_date: isClosed && closeTime ? closeTime : undefined,
          status: isClosed ? 'closed' : 'open',
          notes: ticket ? `Imported ${type} #${ticket}` : `Imported ${type}`,
        });
        imported++;
      } catch (err) { console.error('Import row failed:', sym, err); skipped++; }
    }
    toast(`${imported} جدید · ${deleted} تکراری حذف · ${dupes} رد (موجود) · ${skipped} رد دیگر`, skipped ? 'info' : 'ok', 4000);
    window.dispatchEvent(new Event('tj-data-changed'));
    loadTrades();
    setShowImportModal(false);
  };

  const fmt = (n: number | null) => n != null ? (n >= 0 ? '+' : '') + n.toFixed(2) : '-';
  const pnlClass = (n: number) => n > 0 ? 'badge-success' : n < 0 ? 'badge-danger' : 'badge-warning';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">{t('trades')}</h1>
        <span className="badge badge-warning">{visibleTrades.length}</span>
        {trades.length !== visibleTrades.length && (
          <span className="text-[10px] text-text-muted">از {trades.length}</span>
        )}
        {selectedIds.size > 0 && (
          <button onClick={handleBulkDelete} className="btn-danger text-xs flex items-center gap-1">
            <Trash2 size={14} /> {selectedIds.size} {t('delete')}
          </button>
        )}
      </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowImportModal(true)} className="btn-secondary text-xs flex items-center gap-1.5">
            <Upload size={14} /> {t('import')}
          </button>
          <button onClick={exportExcel} className="btn-secondary text-xs flex items-center gap-1.5">
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button onClick={exportPDF} className="btn-secondary text-xs flex items-center gap-1.5">
            <FileText size={14} /> PDF
          </button>
          <button onClick={() => navigate('/add')} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> {t('addTrade')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="text-2xl font-bold">{trades.length}</div>
          <div className="text-sm text-text-muted">{t('totalTrades')}</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary">{openCount}</div>
          <div className="text-sm text-text-muted">{t('openTrades')}</div>
        </div>
        <div className="card text-center">
          <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(totalPnl)}</div>
          <div className="text-sm text-text-muted">{t('totalPnl')}</div>
        </div>
      </div>

      {/* Filters — ponytail: one row of high-frequency chips, "more" popover for the rest → mobile doesn't drown */}
      <div className="card !p-2 sm:!p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search size={15} className="absolute start-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              className="input ps-8 py-1.5 text-sm"
              placeholder={t('search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {activeFilterCount > 0 && (
            <span className="chip-on px-2 py-1 text-[10px] font-bold rounded-full tabular-nums whitespace-nowrap">
              {activeFilterCount}
            </span>
          )}

          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setShowFilter(p => !p)}
              className={`btn-secondary text-xs flex items-center gap-1 ${showFilter ? 'ring-2 ring-primary/50' : ''}`}
            >
              <Filter size={13} />
              <span className="hidden sm:inline">{t('filter')}</span>
            </button>
            {showFilter && (
              <div className="absolute end-0 mt-1 z-40 w-72 max-w-[90vw] card !p-3 shadow-xl space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  <span className="chip-label">{t('strategy')}</span>
                  <select
                    className="input text-xs py-1 flex-1 min-w-[10rem]"
                    value={filters.strategy}
                    onChange={e => setFilters({ ...filters, strategy: e.target.value })}
                  >
                    <option value="">{t('any')}</option>
                    {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip-label">{t('date')}</span>
                  <input type="date" className="input text-xs py-1 w-auto" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} />
                  <span className="text-text-muted">—</span>
                  <input type="date" className="input text-xs py-1 w-auto" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })} />
                  {(filters.dateFrom || filters.dateTo) && (
                    <button onClick={() => setFilters(f => ({ ...f, dateFrom: '', dateTo: '' }))} className="text-text-muted hover:text-text" title={t('reset')}>
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip-label">{t('sort')}</span>
                  <select className="input text-xs py-1 flex-1 min-w-[10rem]" value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })}>
                    <option value="date_desc">{t('date')} ↓</option>
                    <option value="date_asc">{t('date')} ↑</option>
                    <option value="pnl_desc">{t('pnl')} ↓</option>
                    <option value="pnl_asc">{t('pnl')} ↑</option>
                  </select>
                </div>
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className="btn-danger text-xs w-full flex items-center justify-center gap-1.5">
                    <RotateCcw size={12} /> {t('reset')} ({activeFilterCount})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ponytail: high-frequency chips stay visible on mobile — direction + status + pnl in a tight single line */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs">
          <span className="chip-label">{t('direction')}</span>
          {([['', t('any')], ['long', t('long')], ['short', t('short')]] as const).map(([d, label]) => (
            <button
              key={d || 'all'}
              type="button"
              onClick={() => setFilters(f => ({ ...f, direction: d }))}
              className={`chip-toggle ${filters.direction === d ? 'chip-on' : ''} ${d === 'long' ? 'chip-pos' : d === 'short' ? 'chip-neg' : ''}`}
            >
              {label}
            </button>
          ))}

          <span className="w-px h-5 bg-border mx-0.5" />

          <span className="chip-label">{t('pnl')}</span>
          {([
            ['', t('any')],
            ['winners', t('winners')],
            ['losers', t('losers')],
            ['breakeven', t('breakeven')],
          ] as const).map(([p, label]) => (
            <button
              key={p || 'all'}
              type="button"
              onClick={() => setFilters(f => ({ ...f, pnl: p }))}
              className={`chip-toggle ${filters.pnl === p ? 'chip-on' : ''} ${p === 'winners' ? 'chip-pos' : p === 'losers' ? 'chip-neg' : p === 'breakeven' ? 'chip-flat' : ''}`}
            >
              {label}
            </button>
          ))}

          <span className="w-px h-5 bg-border mx-0.5" />

          <span className="chip-label">{t('status')}</span>
          {([['', t('any')], ['closed', t('closed')], ['open', t('open')]] as const).map(([s, label]) => (
            <button
              key={s || 'all'}
              type="button"
              onClick={() => setFilters(f => ({ ...f, status: s }))}
              className={`chip-toggle ${filters.status === s ? 'chip-on' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block table-wrap">
        <table>
          <thead>
            <tr className="border-b border-border">
              <th className="w-8"><input type="checkbox" checked={selectedIds.size === visibleTrades.length && visibleTrades.length > 0} onChange={toggleAll} /></th>
              <th>{t('symbol')}</th>
              <th>{t('direction')}</th>
              <th>{t('entryPrice')}</th>
              <th>{t('exitPrice')}</th>
              <th>{t('pnl')}</th>
              <th>{t('strategy')}</th>
              <th>{t('date')}</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleTrades.map(trade => (
              <tr key={trade.id} className={selectedIds.has(trade.id) ? 'bg-primary/5' : ''}>
                <td><input type="checkbox" checked={selectedIds.has(trade.id)} onChange={() => toggleSelect(trade.id)} /></td>
                <td className="font-bold">{trade.symbol}</td>
                <td>
                  <span className={`badge ${trade.direction === 'long' ? 'badge-success' : 'badge-danger'}`}>
                    {trade.direction === 'long' ? '▲' : '▼'} {trade.direction === 'long' ? t('long') : t('short')}
                  </span>
                </td>
                <td className="font-mono text-xs tabular-nums">{trade.entry_price}</td>
                <td className="font-mono text-xs tabular-nums">{trade.exit_price || <span className="text-text-light">—</span>}</td>
                <td><span className={`badge ${pnlClass(trade.pnl || 0)}`}>{fmt(trade.pnl)}</span></td>
                <td className="text-xs">{trade.strategy_name || '—'}</td>
                <td className="text-xs text-text-muted tabular-nums">{trade.entry_date?.slice(0, 10)}</td>
                <td>{trade.screenshot_url && trade.screenshot_url !== 'undefined' ? (
                  <button type="button" onClick={() => setLightboxUrl(trade.screenshot_url)} className="cursor-pointer">
                    <img src={trade.screenshot_url} alt="" className="w-8 h-8 rounded-md object-cover border border-border hover:ring-2 hover:ring-primary/50 transition-shadow" />
                  </button>
                ) : null}</td>
                <td>
                  <div className="flex gap-1">
                    {trade.status === 'open' && (
                      <button onClick={() => { setCloseId(trade.id); setShowCloseModal(true); }} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary" title={t('close')}>
                        <X size={14} />
                      </button>
                    )}
                    <button onClick={() => navigate(`/add?edit=${trade.id}`)} className="p-1.5 rounded-lg hover:bg-surface-secondary text-text-muted" title={t('edit')}>
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(trade.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-danger" title={t('delete')}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleTrades.length === 0 && (
              <tr><td colSpan={8} className="!p-10 text-center text-text-muted">{t('noData')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {visibleTrades.map(trade => {
          const hasImg = trade.screenshot_url && trade.screenshot_url !== 'undefined';
          return (
            <div key={trade.id} className="card overflow-hidden p-0">
              {/* Image banner or color strip */}
              {hasImg ? (
                <button type="button" onClick={() => setLightboxUrl(trade.screenshot_url)} className="block w-full h-36 overflow-hidden">
                  <img src={trade.screenshot_url} alt="" className="w-full h-full object-cover" />
                </button>
              ) : (
                <div className={`h-1.5 ${trade.direction === 'long' ? 'bg-success' : 'bg-danger'}`} />
              )}
              <div className="p-3 space-y-2.5">
                {/* Row 1: symbol + direction + pnl */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base tracking-tight">{trade.symbol}</span>
                    <span className={`badge text-[10px] ${trade.direction === 'long' ? 'badge-success' : 'badge-danger'}`}>
                      {trade.direction === 'long' ? '▲ Long' : '▼ Short'}
                    </span>
                  </div>
                  <span className={`font-extrabold text-sm tabular-nums ${trade.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                    {fmt(trade.pnl)}
                  </span>
                </div>
                {/* Row 2: compact info grid */}
                <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[11px] text-text-secondary">
                  <div><span className="text-text-muted">{t('entryPrice')}:</span> <span className="font-mono tabular-nums">{trade.entry_price}</span></div>
                  <div><span className="text-text-muted">{t('exitPrice')}:</span> <span className="font-mono tabular-nums">{trade.exit_price || '—'}</span></div>
                  <div><span className="text-text-muted">{t('date')}:</span> <span className="tabular-nums">{trade.entry_date?.slice(5, 10)}</span></div>
                  {trade.strategy_name && <div className="col-span-2"><span className="text-text-muted">{t('strategy')}:</span> {trade.strategy_name}</div>}
                </div>
                {/* Row 3: actions */}
                <div className="flex gap-2 pt-1 border-t border-border">
                  {trade.status === 'open' && (
                    <button onClick={() => { setCloseId(trade.id); setShowCloseModal(true); }} className="btn-primary text-[11px] flex-1 py-2">{t('close')}</button>
                  )}
                  <button onClick={() => navigate(`/add?edit=${trade.id}`)} className="btn-secondary text-[11px] flex-1 py-2">{t('edit')}</button>
                  <button onClick={() => handleDelete(trade.id)} className="btn-danger text-[11px] py-2 px-3">✕</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
          onWheel={handleWheel}
        >
          <button type="button" onClick={() => setLightboxUrl(null)} className="absolute top-4 end-4 text-white/70 hover:text-white p-2 z-10">
            <X size={28} />
          </button>
          {/* Zoom controls */}
          <div onClick={e => e.stopPropagation()} className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur rounded-full px-4 py-2 z-10">
            <button type="button" onClick={() => setImgScale(s => Math.max(0.5, s - 0.5))} className="text-white text-lg font-bold px-2">−</button>
            <span className="text-white/70 text-xs tabular-nums w-10 text-center">{Math.round(imgScale * 100)}%</span>
            <button type="button" onClick={() => setImgScale(s => Math.min(5, s + 0.5))} className="text-white text-lg font-bold px-2">+</button>
            <div className="w-px h-4 bg-white/20" />
            <button type="button" onClick={() => { setImgScale(1); setImgPos({ x: 0, y: 0 }); }} className="text-white/70 text-xs">1:1</button>
            <div className="w-px h-4 bg-white/20" />
            <a href={lightboxUrl} download target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white"><Download size={18} /></a>
          </div>
          <img
            ref={imgRef}
            src={lightboxUrl}
            alt=""
            className="max-w-full max-h-[90vh] rounded-lg object-contain select-none"
            style={{ transform: `translate(${imgPos.x}px, ${imgPos.y}px) scale(${imgScale})`, transition: dragging.current ? 'none' : 'transform 0.15s ease-out', cursor: imgScale > 1 ? 'grab' : 'default' }}
            onClick={e => { e.stopPropagation(); if (imgScale <= 1) setLightboxUrl(null); }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            draggable={false}
          />
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowImportModal(false)}>
          <div className="bg-surface rounded-xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg">{t('import')} MT4/MT5</h3>
            <div>
              <label className="label">{t('account')}</label>
              <select value={importAccountId || ''} onChange={e => setImportAccountId(e.target.value ? Number(e.target.value) : null)} className="input">
                <option value="">{t('allAccounts')}</option>
                {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{lang === 'fa' ? 'فایل CSV' : 'CSV File'}</label>
              <input ref={importFileRef} type="file" accept=".csv,.htm,.html,.xlsx,.xls" className="input text-sm" onChange={handleImport} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowImportModal(false)} className="btn-secondary flex-1">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Close Trade Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCloseModal(false)}>
          <div className="bg-surface rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">{t('close')} Trade</h3>
            <div className="space-y-3">
              <div><label className="label">{t('exitPrice')} *</label><input type="number" step="any" className="input" value={closeForm.exit_price} onChange={e => setCloseForm({ ...closeForm, exit_price: e.target.value })} /></div>
              <div><label className="label">{t('exitDate')}</label><input type="datetime-local" className="input" value={closeForm.exit_date} onChange={e => setCloseForm({ ...closeForm, exit_date: e.target.value })} /></div>
              <div><label className="label">{t('fees')}</label><input type="number" step="any" className="input" value={closeForm.fees} onChange={e => setCloseForm({ ...closeForm, fees: e.target.value })} /></div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleClose} className="btn-primary flex-1">{t('save')}</button>
              <button onClick={() => setShowCloseModal(false)} className="btn-secondary">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
