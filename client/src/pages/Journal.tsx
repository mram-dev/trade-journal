import { useEffect, useState } from 'react';
import { useLang } from '../App';
import { api } from '../lib/api';
import { toast } from '../lib/toast';

export function Journal() {
  const { t } = useLang();
  const [entries, setEntries] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), mood: '', notes: '', lessons: '', market_conditions: '' });

  const load = () => api.getJournal().then(r => setEntries(r.entries || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.date) { toast(t('error'), 'err'); return; }
    try {
      await api.saveJournal(form);
      setShowForm(false);
      setForm({ date: new Date().toISOString().slice(0, 10), mood: '', notes: '', lessons: '', market_conditions: '' });
      toast(t('saved'));
    } catch (e: any) { toast(e?.message || t('error'), 'err'); }
    finally { load(); }
  };

  const moods = ['😊', '😐', '😤', '😰', '🥳', '🤔', '💪', '😴'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('journal')}</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ {t('journal')}</button>
      </div>

      {showForm && (
        <div className="card space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">{t('date')}</label><input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div>
              <label className="label">{t('mood')}</label>
              <div className="flex gap-1 flex-wrap">
                {moods.map(m => (
                  <button key={m} onClick={() => setForm({ ...form, mood: m })} className={`text-2xl p-1 rounded-lg transition-all ${form.mood === m ? 'bg-primary/10 scale-110' : 'hover:bg-surface-secondary'}`}>{m}</button>
                ))}
              </div>
            </div>
          </div>
          <div><label className="label">{t('marketConditions')}</label><input className="input" value={form.market_conditions} onChange={e => setForm({ ...form, market_conditions: e.target.value })} placeholder="Trending, Ranging, Volatile..." /></div>
          <div><label className="label">{t('notes')}</label><textarea className="input min-h-[80px]" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <div><label className="label">{t('lessons')}</label><textarea className="input min-h-[60px]" value={form.lessons} onChange={e => setForm({ ...form, lessons: e.target.value })} /></div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="btn-primary">{t('save')}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">{t('cancel')}</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {entries.map(e => (
          <div key={e.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{e.mood || '📝'}</span>
                <span className="font-medium">{e.date}</span>
              </div>
              {e.market_conditions && <span className="badge badge-warning">{e.market_conditions}</span>}
            </div>
            {e.notes && <p className="text-sm text-text-secondary mb-2">{e.notes}</p>}
            {e.lessons && <div className="text-sm bg-primary/5 rounded-lg p-2"><span className="font-medium">💡</span> {e.lessons}</div>}
          </div>
        ))}
        {entries.length === 0 && <div className="card text-center text-text-muted py-8">{t('noData')}</div>}
      </div>
    </div>
  );
}
