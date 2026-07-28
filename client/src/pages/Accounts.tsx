import { useEffect, useState } from 'react';
import { useLang } from '../App';
import { api } from '../lib/api';
import { askConfirm } from '../lib/confirm';
import { toast } from '../lib/toast';

export function Accounts() {
  const { t } = useLang();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', balance: '', initial_balance: '', currency: 'USD', broker: '', leverage: '1' });

  const load = () => api.getAccounts().then(r => setAccounts(r.accounts || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.name) { toast(t('error'), 'err'); return; }
    const data = {
      name: form.name,
      initial_balance: Number(form.initial_balance) || 0,
      leverage: Number(form.leverage) || 1,
      currency: form.currency,
      broker: form.broker,
    };
    try {
      if (editing) await api.updateAccount(editing.id, data);
      else await api.createAccount(data);
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', balance: '', initial_balance: '', currency: 'USD', broker: '', leverage: '1' });
      toast(t('saved'));
      window.dispatchEvent(new Event('tj-data-changed'));
    } catch (e: any) { toast(e?.message || t('error'), 'err'); }
    finally { load(); }
  };

  const handleDelete = async (id: number) => {
    if (!(await askConfirm(t('confirmDelete')))) return;
    setAccounts(prev => prev.filter(a => a.id !== id));
    try {
      await api.deleteAccount(id);
      toast(t('deleted'));
      window.dispatchEvent(new Event('tj-data-changed'));
    } catch (e: any) { toast(e?.message || t('error'), 'err'); }
    finally { load(); }
  };

  const setDefault = async (id: number) => {
    try {
      await api.setDefaultAccount(id);
      toast(t('saved'));
      window.dispatchEvent(new Event('tj-data-changed'));
    } catch (e: any) { toast(e?.message || t('error'), 'err'); }
    finally { load(); }
  };

  const openEdit = (a: any) => {
    setEditing(a);
    setForm({ name: a.name, balance: String(a.balance), initial_balance: String(a.initial_balance || ''), currency: a.currency || 'USD', broker: a.broker || '', leverage: String(a.leverage || 1) });
    setShowModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('accounts')}</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', balance: '', initial_balance: '', currency: 'USD', broker: '', leverage: '1' }); setShowModal(true); }} className="btn-primary">
          + {t('accounts')}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {accounts.map(a => (
          <div key={a.id} className={`card relative ${a.is_default ? 'ring-2 ring-primary' : ''}`}>
            {a.is_default && <span className="absolute top-2 left-2 badge badge-success">Default</span>}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">{a.name}</h3>
              <div className="flex gap-1">
                {!a.is_default && <button onClick={() => setDefault(a.id)} className="text-xs text-primary hover:underline">Set Default</button>}
                <button onClick={() => openEdit(a)} className="text-text-muted hover:text-text">✏️</button>
                <button onClick={() => handleDelete(a.id)} className="text-text-muted hover:text-danger">🗑️</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-surface-secondary rounded-lg p-2"><div className="text-text-muted text-xs">{t('balance')}</div><div className="font-medium">${(a.balance || 0).toLocaleString()}</div></div>
              <div className="bg-surface-secondary rounded-lg p-2"><div className="text-text-muted text-xs">{t('initialBalance')}</div><div className="font-medium">${(a.initial_balance || 0).toLocaleString()}</div></div>
              <div className="bg-surface-secondary rounded-lg p-2"><div className="text-text-muted text-xs">{t('leverage')}</div><div className="font-medium">1:{a.leverage || 1}</div></div>
              <div className="bg-surface-secondary rounded-lg p-2"><div className="text-text-muted text-xs">{t('broker')}</div><div className="font-medium">{a.broker || '-'}</div></div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-surface rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">{editing ? t('edit') : t('accounts')}</h3>
            <div className="space-y-3">
              <div><label className="label">{t('accountName')}</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">{t('initialBalance')}</label><input type="number" className="input" value={form.initial_balance} onChange={e => setForm({ ...form, initial_balance: e.target.value })} /></div>
                <div><label className="label">{t('leverage')}</label><input type="number" className="input" value={form.leverage} onChange={e => setForm({ ...form, leverage: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">{t('currency')}</label><input className="input" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} /></div>
                <div><label className="label">{t('broker')}</label><input className="input" value={form.broker} onChange={e => setForm({ ...form, broker: e.target.value })} /></div>
              </div>
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
