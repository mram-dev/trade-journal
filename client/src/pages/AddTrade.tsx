import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLang } from '../App';
import { api } from '../lib/api';
import { toast } from '../lib/toast';
import { ImageIcon, X } from 'lucide-react';

interface AddTradeProps { accountId: number | null }

export function AddTrade({ accountId }: AddTradeProps) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit') ? Number(searchParams.get('edit')) : null;

  const [form, setForm] = useState({
    symbol: '', direction: 'long', entry_price: '', exit_price: '', lot_size: '0.01',
    stop_loss: '', take_profit: '', fees: '0', strategy_id: '', account_id: accountId || '',
    timeframe: '', entry_date: new Date().toISOString().slice(0, 16), exit_date: '',
    emotion: '', rating: 0, notes: '', screenshot_url: '',
  });
  const [strategies, setStrategies] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [imgPreview, setImgPreview] = useState<string>('');
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getStrategies().then(r => setStrategies(r.strategies || []));
    api.getAccounts().then(r => setAccounts(r.accounts || []));
    if (editId) {
      api.getTrade(editId).then(trade => {
        if (trade) setForm({
          symbol: trade.symbol || '', direction: trade.direction || 'long',
          entry_price: String(trade.entry_price || ''), exit_price: trade.exit_price ? String(trade.exit_price) : '',
          lot_size: String(trade.lot_size || '0.01'), stop_loss: trade.stop_loss ? String(trade.stop_loss) : '',
          take_profit: trade.take_profit ? String(trade.take_profit) : '', fees: String(trade.fees || 0),
          strategy_id: trade.strategy_id ? String(trade.strategy_id) : '',
          account_id: trade.account_id ? String(trade.account_id) : String(accountId || ''),
          timeframe: trade.timeframe || '', entry_date: trade.entry_date || new Date().toISOString().slice(0, 16),
          exit_date: trade.exit_date || '', emotion: trade.emotion || '', rating: trade.rating || 0,
          notes: trade.notes || '', screenshot_url: (trade.screenshot_url && trade.screenshot_url !== 'undefined') ? trade.screenshot_url : '',
        });
        if (trade.screenshot_url && trade.screenshot_url !== 'undefined') setImgPreview(trade.screenshot_url);
      });
    }
  }, [editId]); // eslint-disable-line -- accountId only used as initial fallback

  const uploadToImgbb = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('https://api.imgbb.com/1/upload?key=a5d3fea6976a3092499ff78d830908bb', { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.url || null;
  };

  const handleSubmit = async () => {
    if (!form.symbol || !form.entry_price) { toast(t('error'), 'err'); return; }
    setUploading(true);
    try {
      let url = form.screenshot_url;
      if (imgFile) {
        const uploaded = await uploadToImgbb(imgFile);
        if (uploaded) url = uploaded;
        else toast(t('uploadFailed'), 'err');
      }
      const data = {
        ...form,
        screenshot_url: url || null,
        entry_price: Number(form.entry_price), exit_price: form.exit_price ? Number(form.exit_price) : null,
        lot_size: Number(form.lot_size), stop_loss: form.stop_loss ? Number(form.stop_loss) : null,
        take_profit: form.take_profit ? Number(form.take_profit) : null, fees: Number(form.fees),
        strategy_id: form.strategy_id ? Number(form.strategy_id) : null,
        account_id: form.account_id ? Number(form.account_id) : null,
      };
      if (editId) await api.updateTrade(editId, data);
      else await api.createTrade(data);
      window.dispatchEvent(new Event('tj-data-changed'));
      toast(t('saved'));
      navigate('/trades');
    } catch (e: any) { toast(e?.message || t('error'), 'err'); }
    finally { setUploading(false); }
  };

  const emojis = ['😊', '😐', '😤', '😰', '🥳', '🤔', '💪', '😴'];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">{editId ? t('edit') : t('addTrade')}</h1>

      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">{t('symbol')} *</label><input className="input" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} placeholder="XAU/USD" /></div>
          <div><label className="label">{t('direction')} *</label>
            <div className="flex gap-2">
              <button onClick={() => setForm({ ...form, direction: 'long' })} className={`flex-1 py-2 rounded-lg font-medium transition-colors ${form.direction === 'long' ? 'bg-success text-white' : 'bg-surface-secondary text-text-secondary'}`}>🟢 {t('long')}</button>
              <button onClick={() => setForm({ ...form, direction: 'short' })} className={`flex-1 py-2 rounded-lg font-medium transition-colors ${form.direction === 'short' ? 'bg-danger text-white' : 'bg-surface-secondary text-text-secondary'}`}>🔴 {t('short')}</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">{t('entryPrice')} *</label><input type="number" step="any" className="input" value={form.entry_price} onChange={e => setForm({ ...form, entry_price: e.target.value })} /></div>
          <div><label className="label">{t('exitPrice')}</label><input type="number" step="any" className="input" value={form.exit_price} onChange={e => setForm({ ...form, exit_price: e.target.value })} /></div>
          <div><label className="label">{t('lotSize')}</label><input type="number" step="any" className="input" value={form.lot_size} onChange={e => setForm({ ...form, lot_size: e.target.value })} /></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div><label className="label">{t('stopLoss')}</label><input type="number" step="any" className="input" value={form.stop_loss} onChange={e => setForm({ ...form, stop_loss: e.target.value })} /></div>
          <div><label className="label">{t('takeProfit')}</label><input type="number" step="any" className="input" value={form.take_profit} onChange={e => setForm({ ...form, take_profit: e.target.value })} /></div>
          <div><label className="label">{t('fees')}</label><input type="number" step="any" className="input" value={form.fees} onChange={e => setForm({ ...form, fees: e.target.value })} /></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">{t('strategy')}</label>
            <select className="input" value={form.strategy_id} onChange={e => setForm({ ...form, strategy_id: e.target.value })}>
              <option value="">-</option>
              {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="label">{t('account')}</label>
            <select className="input" value={form.account_id} onChange={e => setForm({ ...form, account_id: e.target.value })}>
              <option value="">-</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">{t('entryDate')}</label><input type="datetime-local" className="input" value={form.entry_date} onChange={e => setForm({ ...form, entry_date: e.target.value })} /></div>
          <div><label className="label">{t('exitDate')}</label><input type="datetime-local" className="input" value={form.exit_date} onChange={e => setForm({ ...form, exit_date: e.target.value })} /></div>
        </div>

        <div><label className="label">{t('timeframe')}</label>
          <div className="flex gap-2 flex-wrap">
            {['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'].map(tf => (
              <button key={tf} onClick={() => setForm({ ...form, timeframe: tf })} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${form.timeframe === tf ? 'bg-primary text-white' : 'bg-surface-secondary text-text-secondary hover:bg-border'}`}>{tf}</button>
            ))}
          </div>
        </div>

        <div><label className="label">{t('emotion')}</label>
          <div className="flex gap-2 flex-wrap">
            {emojis.map(em => (
              <button key={em} onClick={() => setForm({ ...form, emotion: em })} className={`text-2xl p-2 rounded-lg transition-all ${form.emotion === em ? 'bg-primary/10 scale-110' : 'hover:bg-surface-secondary'}`}>{em}</button>
            ))}
          </div>
        </div>

        <div><label className="label">{t('rating')}</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setForm({ ...form, rating: n })} className={`text-2xl transition-colors ${n <= form.rating ? 'text-warning' : 'text-text-light hover:text-warning'}`}>★</button>
            ))}
          </div>
        </div>

        <div><label className="label">{t('notes')}</label><textarea className="input min-h-[80px]" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>

        {/* Image Upload */}
        <div>
          <label className="label">{t('screenshot') || 'اسکرین‌شات'}</label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
            const f = e.target.files?.[0];
            if (!f) return;
            setImgFile(f);
            const reader = new FileReader();
            reader.onload = () => setImgPreview(reader.result as string);
            reader.readAsDataURL(f);
          }} />
          {imgPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-border group">
              <img src={imgPreview} alt="preview" className="w-full max-h-48 object-contain bg-black/5" />
              <button type="button" onClick={() => { setImgPreview(''); setImgFile(null); setForm({ ...form, screenshot_url: '' }); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute top-2 end-2 bg-danger/90 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              ><X size={14} /></button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-border hover:border-primary/40 rounded-xl py-6 flex flex-col items-center gap-2 text-text-muted hover:text-primary transition-colors"
            ><ImageIcon size={28} />
              <span className="text-sm font-medium">{t('uploadImage') || 'انتخاب عکس'}</span>
              <span className="text-xs opacity-60">JPG, PNG, WebP</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSubmit} className="btn-primary flex-1" disabled={uploading}>
          {uploading ? '...' : t('save')}
        </button>
        <button onClick={() => navigate('/trades')} className="btn-secondary">{t('cancel')}</button>
      </div>
    </div>
  );
}
