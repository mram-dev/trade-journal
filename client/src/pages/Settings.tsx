import { useEffect, useRef, useState } from 'react';
import { useLang } from '../App';
import { api } from '../lib/api';
import { askConfirm } from '../lib/confirm';
import { toast } from '../lib/toast';
import { Save, Eye, EyeOff, RefreshCw, Trash2, RotateCcw, Camera, User, Download, Upload } from 'lucide-react';

const IMGBB = 'https://api.imgbb.com/1/upload?key=a5d3fea6976a3092499ff78d830908bb';

export function Settings() {
  const { t } = useLang();
  const [cur, setCur] = useState('');
  const [nxt, setNxt] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getSettings().then(s => {
      setName(s.profile_name || '');
      setAvatar(s.profile_avatar || '');
    }).catch(() => toast(t('error'), 'err'));
  }, [t]);

  const saveProfile = async () => {
    setBusy(true);
    try {
      await api.saveSetting('profile_name', name.trim());
      await api.saveSetting('profile_avatar', avatar || '');
      window.dispatchEvent(new Event('tj-profile-changed'));
      toast(t('saved'));
    } catch { toast(t('error'), 'err'); }
    setBusy(false);
  };

  const onPick = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(IMGBB, { method: 'POST', body: fd });
      const data = await res.json();
      const url = data?.data?.url;
      if (!url) throw new Error('upload failed');
      setAvatar(url);
      await api.saveSetting('profile_avatar', url);
      window.dispatchEvent(new Event('tj-profile-changed'));
      toast(t('saved'));
    } catch { toast(t('uploadFailed'), 'err'); }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeAvatar = async () => {
    setBusy(true);
    try {
      await api.saveSetting('profile_avatar', '');
      // verify clear actually stuck (empty string is valid stored value)
      const s = await api.getSettings();
      if (s.profile_avatar) throw new Error('still set');
      setAvatar('');
      window.dispatchEvent(new Event('tj-profile-changed'));
      toast(t('deleted'));
    } catch { toast(t('error'), 'err'); }
    setBusy(false);
  };

  const changePw = async () => {
    if (!cur || !nxt) return;
    setBusy(true);
    try {
      await api.saveSetting('admin_password', nxt, cur);
      toast(t('saved'));
      setCur(''); setNxt('');
    } catch (e: any) {
      toast(e?.message === 'Current password wrong' ? (t('loginFailed')) : (e?.message || t('error')), 'err');
    }
    setBusy(false);
  };

  const syncBalances = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/sync-balances?token=' + localStorage.getItem('tj_token'), { method: 'POST', credentials: 'include' });
      const r: any = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(r.error || t('error'));
      toast(`${t('balancesSynced')} · ${r.accounts?.length || 0}`);
      window.dispatchEvent(new Event('tj-data-changed'));
    } catch (e: any) { toast(e?.message || t('error'), 'err'); }
    setBusy(false);
  };

  const resetUi = () => {
    // ponytail: never wipe tj_token — only UI prefs
    ['lang', 'theme', 'sb_collapsed'].forEach(k => localStorage.removeItem(k));
    toast(t('prefsReset'));
    setTimeout(() => location.reload(), 800);
  };

  const clearTrades = async () => {
    if (!(await askConfirm(t('confirmDeleteAll')))) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/clear-trades?token=' + localStorage.getItem('tj_token'), { method: 'POST', credentials: 'include' });
      const r: any = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(r.error || t('error'));
      toast(t('tradesCleared'));
      window.dispatchEvent(new Event('tj-data-changed'));
    } catch (e: any) { toast(e?.message || t('error'), 'err'); }
    setBusy(false);
  };

  const exportBackup = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/export?token=' + localStorage.getItem('tj_token'), { credentials: 'include' });
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `trade-journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast('Backup exported');
    } catch (e: any) { toast(e?.message || 'Export failed', 'err'); }
    setBusy(false);
  };

  const importBackup = async (file: File | null) => {
    if (!file) return;
    if (!(await askConfirm('Import backup? This will replace all data.'))) return;
    setBusy(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await fetch('/api/admin/import?token=' + localStorage.getItem('tj_token'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const r: any = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(r.error || 'Import failed');
      toast('Backup imported');
      window.dispatchEvent(new Event('tj-data-changed'));
      window.dispatchEvent(new Event('tj-profile-changed'));
      setTimeout(() => location.reload(), 800);
    } catch (e: any) { toast(e?.message || 'Import failed', 'err'); }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">{t('settings')}</h1>

      <div className="grid md:grid-cols-2 gap-4">
      <div className="card space-y-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || busy}
            className="relative w-16 h-16 rounded-2xl overflow-hidden bg-bg border border-border shrink-0 group"
            title={t('changePhoto')}
          >
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-text-muted"><User size={28} /></span>
            )}
            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera size={18} className="text-white" />
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => onPick(e.target.files?.[0])} />
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="font-bold text-sm text-text-muted uppercase tracking-wide">{t('profile')}</h3>
            <div>
              <label className="label">{t('displayName')}</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Trader" maxLength={40} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading || busy} className="btn-secondary text-xs flex items-center gap-1.5 disabled:opacity-50">
                <Camera size={13} /> {uploading ? '…' : t('changePhoto')}
              </button>
              {avatar && (
                <button type="button" onClick={removeAvatar} disabled={busy} className="btn-secondary text-xs text-danger !border-danger/30 disabled:opacity-50">
                  {t('removePhoto')}
                </button>
              )}
            </div>
          </div>
        </div>
        <button onClick={saveProfile} disabled={busy} className="btn-primary flex items-center gap-1.5 disabled:opacity-50">
          <Save size={14} /> {t('save')}
        </button>
      </div>

      <div className="card space-y-3">
        <h3 className="font-bold text-sm text-text-muted uppercase tracking-wide">{t('changePassword')}</h3>
        <div>
          <label className="label">{t('currentPassword')}</label>
          <div className="relative">
            <input type={showCur ? 'text' : 'password'} className="input pe-9" value={cur} onChange={e => setCur(e.target.value)} />
            <button type="button" onClick={() => setShowCur(v => !v)} className="absolute end-2 top-1/2 -translate-y-1/2 text-text-muted p-1">
              {showCur ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">{t('newPassword')}</label>
          <input type="password" className="input" value={nxt} onChange={e => setNxt(e.target.value)} />
        </div>
        <button onClick={changePw} disabled={!cur || !nxt || busy} className="btn-primary flex items-center gap-1.5 disabled:opacity-50">
          <Save size={14} /> {t('save')}
        </button>
      </div>
      </div>

      <div className="card space-y-3">
        <h3 className="font-bold text-sm text-text-muted uppercase tracking-wide">{t('settings')}</h3>
        <p className="text-xs text-text-muted">Sync / reset / clear</p>
        <button onClick={syncBalances} disabled={busy} className="btn-secondary flex items-center gap-1.5 disabled:opacity-50">
          <RefreshCw size={14} /> Sync Balances
        </button>
        <hr className="border-border" />
        <button onClick={resetUi} disabled={busy} className="btn-secondary flex items-center gap-1.5 disabled:opacity-50">
          <RotateCcw size={14} /> Reset UI Preferences
        </button>
        <hr className="border-border" />
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportBackup} disabled={busy} className="btn-secondary flex items-center gap-1.5 disabled:opacity-50">
            <Download size={14} /> Export Backup (JSON)
          </button>
          <label className="btn-secondary flex items-center gap-1.5 cursor-pointer">
            <Upload size={14} /> Import Backup
            <input type="file" accept=".json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importBackup(f); }} />
          </label>
        </div>
        <hr className="border-border" />
        <button onClick={clearTrades} disabled={busy} className="btn-secondary flex items-center gap-1.5 text-danger !border-danger/30 disabled:opacity-50">
          <Trash2 size={14} /> Clear All Trades
        </button>
      </div>
    </div>
  );
}
