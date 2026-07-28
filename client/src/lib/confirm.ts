type ConfirmState = {
  message: string;
  title?: string;
  danger?: boolean;
  resolve: (ok: boolean) => void;
} | null;

let state: ConfirmState = null;
const listeners = new Set<() => void>();

export function getConfirmState() { return state; }
export function subscribeConfirm(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** App-styled confirm. Replaces window.confirm. */
export function askConfirm(message: string, opts?: { title?: string; danger?: boolean }): Promise<boolean> {
  return new Promise(resolve => {
    state = { message, title: opts?.title, danger: opts?.danger !== false, resolve };
    listeners.forEach(l => l());
  });
}

export function answerConfirm(ok: boolean) {
  const r = state?.resolve;
  state = null;
  listeners.forEach(l => l());
  r?.(ok);
}
