import { useEffect, useState } from 'react';
import { useLang } from '../App';
import { api } from '../lib/api';
import { askConfirm } from '../lib/confirm';
import { toast } from '../lib/toast';

export function Strategies() {
  const { t } = useLang();
  const [strategies, setStrategies] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', rules: '', color: '#4f46e5' });

  const load = () => api.getStrategies().then(r => setStrategies(r.strategies || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.name) { toast(t('error'), 'err'); return; }
    try {
      if (editing) await api.updateStrategy(editing.id, form);
      else await api.createStrategy(form);
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', description: '', rules: '', color: '#4f46e5' });
      toast(t('saved'));
    } catch (e: any) { toast(e?.message || t('error'), 'err'); }
    finally { load(); }
  };

  const handleDelete = async (id: number) => {
    if (!(await askConfirm(t('confirmDelete')))) return;
    setStrategies(prev => prev.filter(s => s.id !== id));
    try {
      await api.deleteStrategy(id);
      toast(t('deleted'));
    } catch (e: any) { toast(e?.message || t('error'), 'err'); }
    finally { load(); }
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description || '', rules: s.rules || '', color: s.color || '#4f46e5' });
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('strategies')}</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', description: '', rules: '', color: '#4f46e5' }); setShowModal(true); }} className="btn-primary">
          + {t('strategies')}
        </button>
      </div>

      <div className="grid gap-3">
        {strategies.map(s => (
          <div key={s.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-text-muted">{s.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {s.trade_count > 0 && (
                <span className={`badge ${s.win_rate >= 50 ? 'badge-success' : 'badge-danger'}`}>
                  {s.win_rate}% WR
                </span>
              )}
              <button onClick={() => openEdit(s)} className="text-text-muted hover:text-text">✏️</button>
              <button onClick={() => handleDelete(s.id)} className="text-text-muted hover:text-danger">🗑️</button>
            </div>
          </div>
        ))}
        {strategies.length === 0 && <div className="card text-center text-text-muted py-8">{t('noData')}</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-surface rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">{editing ? t('edit') : t('addTrade')}</h3>
            <div className="space-y-3">
              <div><label className="label">{t('strategyName')}</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">{t('description')}</label><input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div><label className="label">{t('color')}</label><input type="color" className="w-full h-10 rounded-lg cursor-pointer" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleSubmit} className="btn-primary flex-1">{t('save')}</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
