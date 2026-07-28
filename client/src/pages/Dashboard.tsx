import { useEffect, useState, useCallback } from 'react';
import { useLang } from '../App';
import { api } from '../lib/api';
import { BarChart3, Zap, Award, AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight, FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DashboardProps { accountId: number | null }

export function Dashboard({ accountId }: DashboardProps) {
  const { lang, t } = useLang();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getStats(accountId || undefined).then(s => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, [accountId]);

  const exportPDF = useCallback(() => {
    if (!stats) return;
    const dir = lang === 'fa' ? 'rtl' : 'ltr';
    const fmt = (n: number | null) => n != null ? (n >= 0 ? '+' : '') + n.toFixed(2) : '—';
    const pnlC = (n: number) => n > 0 ? '#059669' : n < 0 ? '#dc2626' : '';
    const r = (label: string, val: string, c?: string) =>
      `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:600">${label}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:${lang === 'fa' ? 'left' : 'right'};${c ? 'color:' + c : ''}">${val}</td></tr>`;
    const rows = [
      r(t('totalPnl'), fmt(stats.totalPnl), pnlC(stats.totalPnl)),
      r(t('winRate'), `${stats.winRate}% (${stats.wins}W/${stats.losses}L)`),
      r(t('totalTrades'), String(stats.total)),
      r(t('profitFactor'), String(stats.profitFactor)),
      r(t('best'), fmt(stats.bestTrade), '#059669'),
      r(t('worst'), fmt(stats.worstTrade), '#dc2626'),
    ].join('');
    const html = `<!DOCTYPE html><html dir="${dir}"><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;padding:20px;direction:${dir}}h2{margin-bottom:8px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#4f46e5;color:#fff;padding:8px;text-align:left}@media print{body{margin:0}}</style></head><body><h2>Trade Journal — ${new Date().toLocaleDateString()}</h2><table>${rows}</table><script>window.onload=()=>window.print();<\/script></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  }, [stats, lang, t]);

  const exportExcel = useCallback(() => {
    if (!stats) return;
    const data = [{ [t('totalPnl')]: stats.totalPnl, [t('winRate')]: stats.winRate + '%', [t('totalTrades')]: stats.total, [t('profitFactor')]: stats.profitFactor, [t('best')]: stats.bestTrade, [t('worst')]: stats.worstTrade }];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('dashboard'));
    const blob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], { type: 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dashboard_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [stats, t]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="relative">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20"></div>
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-primary absolute inset-0"></div>
      </div>
    </div>
  );
  if (!stats) return <div className="card text-center py-12 text-text-muted">{t('noData')}</div>;

  const fmt = (n: number | null) => n != null ? (n >= 0 ? '+' : '') + n.toFixed(2) : '—';
  const pnlColor = (n: number) => n > 0 ? 'text-success' : n < 0 ? 'text-danger' : '';

  const miniStats = [
    { label: t('profitFactor'), value: String(stats.profitFactor), color: 'text-primary' },
    { label: t('totalTrades'), value: String(stats.total), color: 'text-text' },
    { label: t('winRate'), value: `${stats.winRate}%`, color: 'text-success' },
    { label: t('totalPnl'), value: fmt(stats.totalPnl), color: pnlColor(stats.totalPnl) },
    { label: t('openTrades'), value: String(stats.openTrades || 0), color: 'text-info' },
  ];

  const mainCards = [
    { icon: DollarSign, label: t('totalPnl'), value: fmt(stats.totalPnl), color: pnlColor(stats.totalPnl), bg: stats.totalPnl >= 0 ? 'bg-success/10' : 'bg-danger/10' },
    { icon: Award, label: t('winRate'), value: `${stats.winRate}%`, sub: `${stats.wins}W / ${stats.losses}L`, bg: 'bg-primary/10' },
    { icon: BarChart3, label: t('totalTrades'), value: String(stats.total), sub: `${stats.openTrades} ${t('openTrades')}`, bg: 'bg-info/10' },
    { icon: Zap, label: t('profitFactor'), value: String(stats.profitFactor), sub: 'RR ' + (stats.avgRR || '—'), bg: 'bg-warning/10' },
  ];

  // ponytail: precomputed once, derived from stats so equity badge never re-renders jittery
  const equityMax = stats.equity?.length ? Math.max(...stats.equity.map((x: any) => x.cumulative)) : 0;
  const equityMin = stats.equity?.length ? Math.min(...stats.equity.map((x: any) => x.cumulative)) : 0;

  return (
    <div className="space-y-3.5 md:space-y-4">
      {/* Export buttons */}
      <div className="flex items-center gap-2 justify-end">
        <button onClick={exportPDF} className="btn-secondary text-xs flex items-center gap-1.5">
          <FileText size={14} /> PDF
        </button>
        <button onClick={exportExcel} className="btn-secondary text-xs flex items-center gap-1.5">
          <FileSpreadsheet size={14} /> Excel
        </button>
      </div>
      {/* Hero stat */}
      <div className="card !p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-info/5 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-text-muted mb-1">{t('totalPnl')}</p>
            <div className={`text-3xl md:text-4xl font-black tracking-tight tabular-nums ${pnlColor(stats.totalPnl)}`}>
              {fmt(stats.totalPnl)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {miniStats.map((s, i) => (
              <div key={i} className="mini-stat flex flex-col items-center min-w-[3.5rem]">
                <span className={`text-sm font-bold tabular-nums ${s.color}`}>{s.value}</span>
                <span className="text-[9px] font-semibold text-text-muted mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {mainCards.map((card, i) => (
          <div key={i} className="stat-card card-hover">
            <div className="flex items-center justify-between">
              <span className="stat-label">{card.label}</span>
              <div className={`stat-icon ${card.bg}`}>
                <card.icon size={15} className="text-text-secondary" />
              </div>
            </div>
            <div className={`stat-value ${card.color}`}>{card.value}</div>
            {card.sub && <div className="stat-sub">{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* Wins / Losses / Best / Worst */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: ArrowUpRight, label: t('best'), value: fmt(stats.bestTrade), color: 'text-success' },
          { icon: Award, label: t('wins'), value: String(stats.wins), sub: `avg ${fmt(stats.avgWin)}`, color: 'text-success' },
          { icon: AlertTriangle, label: t('losses'), value: String(stats.losses), sub: `avg ${fmt(stats.avgLoss)}`, color: 'text-danger' },
          { icon: ArrowDownRight, label: t('worst'), value: fmt(stats.worstTrade), color: 'text-danger' },
        ].map((card, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">{card.label}</span>
              <card.icon size={14} className={card.color} />
            </div>
            <div className={`stat-value ${card.color}`}>{card.value}</div>
            {card.sub && <div className="stat-sub">{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* Equity Curve */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">{t('equityCurve')}</h3>
          <div className="flex items-center gap-1.5">
            <span className="badge badge-success">↑ {fmt(equityMax)}</span>
            <span className="badge badge-danger">↓ {fmt(equityMin)}</span>
            <span className="badge badge-primary">{stats.total} trades</span>
          </div>
        </div>
        {(!stats.equity || stats.equity.length === 0) ? (
          <div className="h-[180px] flex items-center justify-center text-text-muted text-sm">{t('noData')}</div>
        ) : (
          (() => {
            const equity = stats.equity;
            const maxAbs = Math.max(...equity.map((x: any) => Math.abs(x.cumulative)), 1);
            const step = Math.max(1, Math.ceil(equity.length / 8));
            // drawdown overlay
            let peak = -Infinity;
            const dd = equity.map((e: any) => {
              peak = Math.max(peak, e.cumulative);
              return peak - e.cumulative;
            });
            const maxDD = Math.max(...dd, 0);
            return (
              <div className="chart-wrap h-[180px] md:h-[220px] relative">
                {/* Drawdown area */}
                {maxDD > 0 && (
                  <div className="absolute inset-x-0 top-1/2 h-[50%] pointer-events-none" style={{ zIndex: 1 }}>
                    <div className="absolute inset-x-0 bottom-0 h-full" style={{
                      background: 'linear-gradient(to top, rgba(244,63,94,0.12), transparent)',
                      clipPath: `polygon(0% 100%, ${equity.map((e: any, i: number) => {
                        const v = e.cumulative;
                        const pct = Math.max(Math.abs(v) / maxAbs * 50, 1.5);
                        const above = v >= 0;
                        const ddPct = (dd[i] / maxAbs) * 50;
                        const ddTop = above ? 50 + ddPct : 50 - pct + ddPct;
                        return `${(i / (equity.length - 1)) * 100}% ${Math.min(100, Math.max(0, ddTop))}%`;
                      }).join(', ')}, 100% 100%)`
                    }} />
                  </div>
                )}
                <div className="chart-zero" style={{ top: '50%', zIndex: 2 }} />
                <div className="absolute inset-x-0 top-0 flex items-end gap-[2px] md:gap-0.5 pb-5" style={{ zIndex: 2 }}>
                  {equity.map((e: any, i: number) => {
                    const v = e.cumulative;
                    const pct = Math.max(Math.abs(v) / maxAbs * 50, 1.5);
                    const above = v >= 0;
                    return (
                      <div key={i} className="flex-1 h-full flex flex-col items-center justify-center min-w-0 relative group">
                        <div
                          className={`w-full chart-bar ${v > 0 ? 'chart-bar-pos' : v < 0 ? 'chart-bar-neg' : 'chart-bar-flat'}`}
                          style={{ position: 'absolute', left: 0, right: 0, height: `${pct}%`, top: above ? '50%' : `${50 - pct}%` }}
                          title={`${e.exit_date?.slice(0, 10)}: ${fmt(v)}`}
                        />
                        <span className="absolute -top-3.5 text-[8px] font-semibold tabular-nums text-success opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {v >= 0 ? '+' : ''}{v.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between text-[9px] text-text-light px-0.5" dir="ltr">
                  {equity.map((e: any, i: number) => (
                    <span key={i} className="flex-1 text-center truncate tabular-nums" style={{ visibility: (i % step === 0 || i === equity.length - 1) ? 'visible' : 'hidden' }}>
                      {e.exit_date?.slice(5, 10)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* Breakdowns */}
      <div className="grid md:grid-cols-2 gap-3">
        {/* Strategy */}
        <div className="card">
          <h3 className="section-title mb-3">{t('byStrategy')}</h3>
          <div className="space-y-2">
            {(stats.byStrategy || []).map((s: any, i: number) => {
              const max = Math.max(...(stats.byStrategy || []).map((x: any) => Math.abs(x.total_pnl)), 1);
              const w = Math.min(100, Math.max(2, (Math.abs(s.total_pnl) / max) * 100));
              const cls = s.total_pnl > 0 ? 'pos' : s.total_pnl < 0 ? 'neg' : 'flat';
              const winRate = s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : 0;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color || '#6366f1' }} />
                    <span className="font-semibold truncate flex-1">{s.name}</span>
                    <span className="text-[10px] text-text-muted tabular-nums">{s.trades}</span>
                    <span className="text-xs font-bold tabular-nums w-14 text-end" style={{ color: s.total_pnl >= 0 ? '#059669' : '#e11d48' }}>{fmt(s.total_pnl)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`mini-bar ${cls} flex-1`}><span style={{ width: `${w}%` }} /></div>
                    <span className="text-[10px] font-bold tabular-nums text-text-muted w-9 text-end">{winRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Symbol */}
        <div className="card">
          <h3 className="section-title mb-3">{t('bySymbol')}</h3>
          <div className="space-y-2">
            {(stats.bySymbol || []).map((s: any, i: number) => {
              const max = Math.max(...(stats.bySymbol || []).map((x: any) => Math.abs(x.total_pnl)), 1);
              const w = Math.min(100, Math.max(2, (Math.abs(s.total_pnl) / max) * 100));
              const cls = s.total_pnl > 0 ? 'pos' : s.total_pnl < 0 ? 'neg' : 'flat';
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold truncate">{s.symbol}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-muted tabular-nums">{s.trades}</span>
                      <span className="text-xs font-bold tabular-nums w-14 text-end" style={{ color: s.total_pnl >= 0 ? '#059669' : '#e11d48' }}>{fmt(s.total_pnl)}</span>
                    </div>
                  </div>
                  <div className={`mini-bar ${cls}`}><span style={{ width: `${w}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly + Direction */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="card">
          <h3 className="section-title mb-3">{t('monthlyPnl')}</h3>
          {(!stats.monthly || stats.monthly.length === 0) ? (
            <div className="h-[140px] flex items-center justify-center text-text-muted text-sm">{t('noData')}</div>
          ) : (() => {
            const monthly = stats.monthly.slice(0, 12).reverse();
            const maxAbs = Math.max(...monthly.map((x: any) => Math.abs(x.pnl)), 1);
            return (
              <div className="chart-wrap h-[150px]">
                <div className="chart-zero" style={{ top: '50%' }} />
                <div className="absolute inset-x-0 top-0 flex items-end gap-1.5 pb-5">
                  {monthly.map((m: any, i: number) => {
                    const v = m.pnl;
                    const pct = Math.max(Math.abs(v) / maxAbs * 50, 2);
                    const above = v >= 0;
                    return (
                      <div key={i} className="flex-1 h-full relative group min-w-0">
                        <div
                          className={`w-full chart-bar ${v > 0 ? 'chart-bar-pos' : v < 0 ? 'chart-bar-neg' : 'chart-bar-flat'}`}
                          style={{ position: 'absolute', left: 0, right: 0, height: `${pct}%`, top: above ? '50%' : `${50 - pct}%` }}
                          title={`${m.month}: ${fmt(v)}`}
                        />
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-semibold tabular-nums opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none" style={{ color: v >= 0 ? '#059669' : '#e11d48' }}>
                          {v >= 0 ? '+' : ''}{v.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between text-[9px] text-text-light px-1" dir="ltr">
                  {monthly.map((m: any, i: number) => (
                    <span key={i} className="flex-1 text-center truncate tabular-nums">{m.month?.split('-')[1]}</span>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        <div className="card">
          <h3 className="section-title mb-3">{t('directionStats')}</h3>
          {(() => {
            const L = stats.long || { trades: 0, pnl: 0 };
            const S = stats.short || { trades: 0, pnl: 0 };
            const tot = (L.trades || 0) + (S.trades || 0);
            const lPct = tot > 0 ? (L.trades / tot) * 100 : 50;
            const sPct = 100 - lPct;
            return (
              <div className="space-y-3">
                <div className="h-2 rounded-full overflow-hidden flex">
                  <div style={{ width: `${lPct}%`, background: 'linear-gradient(90deg, #34d399, #059669)' }} />
                  <div style={{ width: `${sPct}%`, background: 'linear-gradient(90deg, #fb7185, #e11d48)' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="dir-tile long rounded-xl p-3 text-center">
                    <div className="text-[10px] font-extrabold tracking-widest text-success">LONG</div>
                    <div className="text-3xl font-black tabular-nums mt-1">{L.trades || 0}</div>
                    <div className="text-xs font-bold tabular-nums mt-0.5" style={{ color: (L.pnl || 0) >= 0 ? '#059669' : '#e11d48' }}>{fmt(L.pnl || 0)}</div>
                    <div className="text-[10px] text-text-muted tabular-nums mt-0.5">{lPct.toFixed(0)}% share</div>
                  </div>
                  <div className="dir-tile short rounded-xl p-3 text-center">
                    <div className="text-[10px] font-extrabold tracking-widest text-danger">SHORT</div>
                    <div className="text-3xl font-black tabular-nums mt-1">{S.trades || 0}</div>
                    <div className="text-xs font-bold tabular-nums mt-0.5" style={{ color: (S.pnl || 0) >= 0 ? '#059669' : '#e11d48' }}>{fmt(S.pnl || 0)}</div>
                    <div className="text-[10px] text-text-muted tabular-nums mt-0.5">{sPct.toFixed(0)}% share</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Recent Trades */}
      <div className="card">
        <h3 className="section-title mb-3">{t('recentTrades')}</h3>
        <div className="space-y-1.5">
          {(stats.recentTrades || []).map((tr: any) => (
            <div key={tr.id} className="list-row">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold ${
                  tr.direction === 'long' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                }`}>
                  {tr.direction === 'long' ? '▲' : '▼'}
                </span>
                <span className="text-sm font-bold">{tr.symbol}</span>
                {tr.strategy_name && <span className="badge badge-primary text-[9px]">{tr.strategy_name}</span>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-sm font-bold tabular-nums ${(tr.pnl || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                  {fmt(tr.pnl)}
                </span>
                <span className="text-[10px] text-text-light tabular-nums">{tr.exit_date?.slice(0, 10)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
