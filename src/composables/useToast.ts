import { type Ref, ref } from 'vue'

export type ToastVariant = 'default' | 'info' | 'success' | 'warning' | 'error'

export interface ToastOptions {
  message: string
  title?: string
  variant?: ToastVariant
  /** Milliseconds before the toast closes by itself. 0 keeps it until it is closed. */
  duration?: number
  dismissible?: boolean
}

export interface Toast {
  id: number
  message: string
  title: string | undefined
  variant: ToastVariant
  duration: number
  dismissible: boolean
}

const toasts: Ref<Toast[]> = ref([])
const timers = new Map<number, { handle: ReturnType<typeof setTimeout>; started: number; remaining: number }>()

let nextId = 0

function schedule(id: number, delay: number): void {
  const handle = setTimeout(() => remove(id), delay)

  timers.set(id, { handle, started: Date.now(), remaining: delay })
}

function remove(id: number): void {
  const timer = timers.get(id)

  if (undefined !== timer) {
    clearTimeout(timer.handle)
    timers.delete(id)
  }

  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function add(options: ToastOptions): number {
  nextId += 1

  const toast: Toast = {
    id: nextId,
    message: options.message,
    title: options.title,
    variant: options.variant ?? 'default',
    duration: options.duration ?? 5000,
    dismissible: options.dismissible ?? true,
  }

  toasts.value = [...toasts.value, toast]

  if (0 < toast.duration) {
    schedule(toast.id, toast.duration)
  }

  return toast.id
}

/** Stop the countdown of a toast, for example while the pointer is over it. */
function pause(id: number): void {
  const timer = timers.get(id)

  if (undefined === timer) {
    return
  }

  clearTimeout(timer.handle)
  timers.set(id, { ...timer, remaining: Math.max(0, timer.remaining - (Date.now() - timer.started)) })
}

/** Restart the countdown with the time that was left. */
function resume(id: number): void {
  const timer = timers.get(id)

  if (undefined === timer) {
    return
  }

  schedule(id, timer.remaining)
}

function clear(): void {
  for (const id of [...timers.keys()]) {
    remove(id)
  }

  toasts.value = []
}

function shortcut(variant: ToastVariant) {
  return (message: string, options: Omit<ToastOptions, 'message' | 'variant'> = {}): number =>
    add({ ...options, message, variant })
}

/**
 * Show short messages. The state is shared by the whole application: call
 * `useToast()` anywhere and render one `FeedbackToastContainer` once.
 */
export function useToast() {
  return {
    toasts,
    add,
    remove,
    pause,
    resume,
    clear,
    info: shortcut('info'),
    success: shortcut('success'),
    warning: shortcut('warning'),
    error: shortcut('error'),
  }
}
