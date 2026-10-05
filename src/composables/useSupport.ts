/**
 * What the browser can do natively. The components use the native feature when
 * it exists (less code, better behaviour, accessibility built in) and fall back
 * to a script when it does not, so every component works wherever Vue does.
 */
export interface PlatformSupport {
  /** `<dialog>` with `showModal()`. */
  dialog: boolean
  /** The `closedby` attribute of `<dialog>` (light dismiss without code). */
  dialogClosedBy: boolean
  /** `dialog.requestClose()`. */
  dialogRequestClose: boolean
  /** The Popover API (`popover`, `showPopover()`, light dismiss, top layer). */
  popover: boolean
  /** Invoker commands (`commandfor` and `command` on a button). */
  invokerCommands: boolean
  /** CSS anchor positioning. */
  anchorPositioning: boolean
  /** `hidden="until-found"` and the `beforematch` event. */
  hiddenUntilFound: boolean
  /** The `name` attribute of `<details>` (exclusive accordion). */
  detailsName: boolean
  /** The `inert` attribute. */
  inert: boolean
  /** The `<search>` element. */
  search: boolean
  /** View Transitions (`document.startViewTransition`). */
  viewTransitions: boolean
  /** The Navigation API. */
  navigationApi: boolean
  /** The asynchronous Clipboard API. */
  clipboard: boolean
  /** The Web Share API. */
  share: boolean
  /** `input.showPicker()`. */
  showPicker: boolean
}

type Env = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const has = (proto: unknown, member: string): boolean => 'object' === typeof proto && null !== proto && member in proto

const prototypeOf = (env: Env, name: string): unknown => env[name]?.prototype

const NONE: PlatformSupport = {
  dialog: false,
  dialogClosedBy: false,
  dialogRequestClose: false,
  popover: false,
  invokerCommands: false,
  anchorPositioning: false,
  hiddenUntilFound: false,
  detailsName: false,
  inert: false,
  search: false,
  viewTransitions: false,
  navigationApi: false,
  clipboard: false,
  share: false,
  showPicker: false,
}

/**
 * Detect the features of an environment (the browser by default). Pure: the
 * environment is a parameter, so every combination can be tested.
 */
export function detectSupport(env: Env = globalThis as Env): PlatformSupport {
  if (undefined === env['document']) {
    return { ...NONE }
  }

  const dialog = prototypeOf(env, 'HTMLDialogElement')
  const element = prototypeOf(env, 'HTMLElement')
  const unknown = env['HTMLUnknownElement']
  const css = env['CSS']

  return {
    dialog: has(dialog, 'showModal'),
    dialogClosedBy: has(dialog, 'closedBy'),
    dialogRequestClose: has(dialog, 'requestClose'),
    popover: has(element, 'popover'),
    invokerCommands: has(prototypeOf(env, 'HTMLButtonElement'), 'commandForElement'),
    anchorPositioning: 'function' === typeof css?.supports && css.supports('anchor-name: --a'),
    hiddenUntilFound: has(element, 'onbeforematch'),
    detailsName: has(prototypeOf(env, 'HTMLDetailsElement'), 'name'),
    inert: has(element, 'inert'),
    // An unknown element is an HTMLUnknownElement: <search> is only known where it is supported.
    search: 'function' === typeof unknown && !(env['document'].createElement('search') instanceof unknown),
    viewTransitions: 'function' === typeof env['document'].startViewTransition,
    navigationApi: 'navigation' in env,
    clipboard: 'function' === typeof env['navigator']?.clipboard?.writeText,
    share: 'function' === typeof env['navigator']?.share,
    showPicker: has(prototypeOf(env, 'HTMLInputElement'), 'showPicker'),
  }
}

let current: PlatformSupport | undefined
let overrides: Partial<PlatformSupport> = {}

/** The support of the current browser, detected once. */
export function getSupport(): PlatformSupport {
  current ??= detectSupport()

  return { ...current, ...overrides }
}

/**
 * Force some features on or off, for example `{ popover: false }` to use the
 * script fallback everywhere (tests, an old browser to support, a bug to avoid).
 */
export function setSupport(next: Partial<PlatformSupport>): void {
  overrides = { ...overrides, ...next }
}

/** Forget the detection and the overrides (tests). */
export function resetSupport(): void {
  current = undefined
  overrides = {}
}
