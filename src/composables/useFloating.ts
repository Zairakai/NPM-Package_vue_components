import { type Ref, onBeforeUnmount, ref, watch } from 'vue'

type FloatingSide = 'top' | 'bottom' | 'left' | 'right'
type FloatingAlign = 'start' | 'center' | 'end'
export type FloatingPlacement = FloatingSide | `${FloatingSide}-${Exclude<FloatingAlign, 'center'>}`

export interface FloatingSize {
  width: number
  height: number
}

export interface FloatingViewport {
  width: number
  height: number
}

export interface FloatingPosition {
  x: number
  y: number
  placement: FloatingPlacement
}

const OPPOSITE: Record<FloatingSide, FloatingSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

function parse(placement: FloatingPlacement): { side: FloatingSide; align: FloatingAlign } {
  const [side, align] = placement.split('-') as [FloatingSide, FloatingAlign | undefined]

  return { side, align: align ?? 'center' }
}

function coordinates(
  anchor: DOMRect,
  size: FloatingSize,
  side: FloatingSide,
  align: FloatingAlign,
  offset: number
): { x: number; y: number } {
  const vertical = 'top' === side || 'bottom' === side

  let x: number
  let y: number

  if (vertical) {
    y = 'top' === side ? anchor.top - size.height - offset : anchor.bottom + offset
    x =
      'start' === align
        ? anchor.left
        : 'end' === align
          ? anchor.right - size.width
          : anchor.left + anchor.width / 2 - size.width / 2
  } else {
    x = 'left' === side ? anchor.left - size.width - offset : anchor.right + offset
    y =
      'start' === align
        ? anchor.top
        : 'end' === align
          ? anchor.bottom - size.height
          : anchor.top + anchor.height / 2 - size.height / 2
  }

  return { x, y }
}

function overflows(x: number, y: number, size: FloatingSize, viewport: FloatingViewport, side: FloatingSide): boolean {
  switch (side) {
    case 'top':
      return 0 > y
    case 'bottom':
      return y + size.height > viewport.height
    case 'left':
      return 0 > x
    default:
      return x + size.width > viewport.width
  }
}

/**
 * Pure placement maths: where to put a floating element next to an anchor.
 *
 * The element goes on the requested side; when it does not fit there but fits
 * on the opposite side, it flips. It is then shifted along the other axis to
 * stay inside the viewport.
 */
export function computePosition(
  anchor: DOMRect,
  size: FloatingSize,
  viewport: FloatingViewport,
  placement: FloatingPlacement = 'bottom',
  offset = 8,
  padding = 4
): FloatingPosition {
  const { side, align } = parse(placement)

  let usedSide = side
  let { x, y } = coordinates(anchor, size, side, align, offset)

  if (overflows(x, y, size, viewport, side)) {
    const flipped = coordinates(anchor, size, OPPOSITE[side], align, offset)

    if (!overflows(flipped.x, flipped.y, size, viewport, OPPOSITE[side])) {
      usedSide = OPPOSITE[side]
      x = flipped.x
      y = flipped.y
    }
  }

  const vertical = 'top' === usedSide || 'bottom' === usedSide

  if (vertical) {
    x = Math.max(padding, Math.min(x, viewport.width - size.width - padding))
  } else {
    y = Math.max(padding, Math.min(y, viewport.height - size.height - padding))
  }

  const usedPlacement = ('center' === align ? usedSide : `${usedSide}-${align}`) as FloatingPlacement

  return { x: Math.round(x), y: Math.round(y), placement: usedPlacement }
}

export interface UseFloatingOptions {
  placement?: FloatingPlacement
  offset?: number
}

/**
 * Keep a floating element positioned next to its anchor while it is open.
 * Returns the inline style to bind on the floating element (position fixed)
 * and the placement actually used (it can differ from the requested one).
 */
export function useFloating(
  anchor: Ref<HTMLElement | null>,
  floating: Ref<HTMLElement | null>,
  open: Ref<boolean>,
  options: UseFloatingOptions = {}
) {
  const style = ref<Record<string, string>>({ position: 'fixed', left: '0px', top: '0px' })
  const placement = ref<FloatingPlacement>(options.placement ?? 'bottom')

  function update(): void {
    if (!anchor.value || !floating.value) {
      return
    }

    const rect = anchor.value.getBoundingClientRect()
    const size = { width: floating.value.offsetWidth, height: floating.value.offsetHeight }
    const viewport = { width: window.innerWidth, height: window.innerHeight }
    const position = computePosition(rect, size, viewport, options.placement ?? 'bottom', options.offset ?? 8)

    placement.value = position.placement
    style.value = { position: 'fixed', left: `${position.x}px`, top: `${position.y}px` }
  }

  function listen(): void {
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
  }

  function unlisten(): void {
    window.removeEventListener('resize', update)
    window.removeEventListener('scroll', update, true)
  }

  watch(
    open,
    (isOpen) => {
      if (isOpen) {
        listen()
        // Wait for the element to be rendered before measuring it.
        void Promise.resolve().then(update)
      } else {
        unlisten()
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(unlisten)

  return { style, placement, update }
}
