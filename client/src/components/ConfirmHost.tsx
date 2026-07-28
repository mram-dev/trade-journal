import { useEffect, useState } from 'react';
import { useLang } from '../App';
import { answerConfirm, getConfirmState, subscribeConfirm } from '../lib/confirm';

export function ConfirmHost() {
  const { t } = useLang();
  const [s, setS] = useState(getConfirmState());
  useEffect(() => subscribeConfirm(() => setS(getConfirmState())), []);
  if (!s) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4" onClick={() => answerConfirm(false)}>
      <div className="bg-surface rounded-xl p-5 w-full max-w-sm border border-border shadow-xl" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3 className="font-bold text-base mb-2">{s.title || t('confirm')}</h3>
        <p className="text-sm text-text-secondary mb-5 whitespace-pre-wrap">{s.message}</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => answerConfirm(true)} className={`${s.danger ? 'btn-danger' : 'btn-primary'} flex-1`}>
            {s.danger ? t('delete') : t('confirm')}
          </button>
          <button type="button" onClick={() => answerConfirm(false)} className="btn-secondary flex-1">
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
