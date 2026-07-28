export type ToastKind = 'ok' | 'err' | 'info';

export type ToastAction = { label: string; onClick: () => void };

type ToastState = { id: number; kind: ToastKind; text: string; action?: ToastAction } | null;

let state: ToastState = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();
let seq = 0;

export function getToastState() { return state; }
export function subscribeToast(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** App-styled toast. Replaces alert / inline flash.
 * ponytail: optional `action` adds a single button (e.g. Undo). */
export function toast(text: string, kind: ToastKind = 'ok', ms = 2800, action?: ToastAction) {
  if (timer) clearTimeout(timer);
  state = { id: ++seq, kind, text, action };
  listeners.forEach(l => l());
  timer = setTimeout(() => {
    state = null;
    listeners.forEach(l => l());
  }, ms);
}

export function dismissToast() {
  if (timer) clearTimeout(timer);
  state = null;
  listeners.forEach(l => l());
}
