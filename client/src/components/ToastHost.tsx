import { useEffect, useState } from 'react';
import { dismissToast, getToastState, subscribeToast } from '../lib/toast';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export function ToastHost() {
  const [s, setS] = useState(getToastState());
  useEffect(() => subscribeToast(() => setS(getToastState())), []);
  if (!s) return null;

  const Icon = s.kind === 'ok' ? CheckCircle2 : s.kind === 'err' ? XCircle : Info;
  const tone =
    s.kind === 'ok' ? 'border-success/40 bg-success/10 text-success'
    : s.kind === 'err' ? 'border-danger/40 bg-danger/10 text-danger'
    : 'border-primary/40 bg-primary/10 text-primary';

  return (
    <div className="fixed bottom-20 md:bottom-6 inset-x-0 z-[90] flex justify-center px-3 pointer-events-none" role="status" aria-live="polite">
      <div className={`pointer-events-auto flex items-start gap-2 max-w-md w-full rounded-xl border shadow-lg px-3 py-2.5 ${tone}`}>
        <Icon size={18} className="shrink-0 mt-0.5" />
        <p className="text-sm font-semibold flex-1 whitespace-pre-wrap text-text">{s.text}</p>
        {s.action && (
          <button
            type="button"
            onClick={() => { s.action!.onClick(); dismissToast(); }}
            className="text-sm font-bold underline underline-offset-2 hover:opacity-80 shrink-0"
          >
            {s.action.label}
          </button>
        )}
        <button type="button" onClick={dismissToast} className="text-text-muted hover:text-text p-0.5 shrink-0" aria-label="close">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
