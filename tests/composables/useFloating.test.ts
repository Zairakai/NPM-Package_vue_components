import { describe, expect, it } from 'vitest'
import { computePosition } from '../../src/composables/useFloating'

const anchor = { left: 100, top: 100, right: 160, bottom: 120, width: 60, height: 20 } as DOMRect
const size = { width: 80, height: 40 }
const viewport = { width: 400, height: 300 }

describe('computePosition', () => {
  it('should place the element below and centered by default', () => {
    expect(computePosition(anchor, size, viewport)).toEqual({ x: 90, y: 128, placement: 'bottom' })
  })

  it('should place the element on each requested side', () => {
    expect(computePosition(anchor, size, viewport, 'top')).toMatchObject({ y: 52, placement: 'top' })
    expect(computePosition(anchor, size, viewport, 'right')).toMatchObject({ x: 168, y: 90, placement: 'right' })
    expect(computePosition(anchor, size, viewport, 'left')).toMatchObject({ x: 12, y: 90, placement: 'left' })
  })

  it('should align to the start or the end of the anchor', () => {
    expect(computePosition(anchor, size, viewport, 'bottom-start')).toMatchObject({ x: 100, placement: 'bottom-start' })
    expect(computePosition(anchor, size, viewport, 'bottom-end')).toMatchObject({ x: 80, placement: 'bottom-end' })
    expect(computePosition(anchor, size, viewport, 'right-start')).toMatchObject({ y: 100, placement: 'right-start' })
    expect(computePosition(anchor, size, viewport, 'right-end')).toMatchObject({ y: 80, placement: 'right-end' })
  })

  it('should flip to the opposite side when it does not fit', () => {
    const low = { left: 100, top: 270, right: 160, bottom: 290, width: 60, height: 20 } as DOMRect

    expect(computePosition(low, size, viewport, 'bottom')).toMatchObject({ y: 222, placement: 'top' })

    const high = { left: 100, top: 5, right: 160, bottom: 25, width: 60, height: 20 } as DOMRect

    expect(computePosition(high, size, viewport, 'top')).toMatchObject({ y: 33, placement: 'bottom' })

    const leftEdge = { left: 10, top: 100, right: 70, bottom: 120, width: 60, height: 20 } as DOMRect

    expect(computePosition(leftEdge, size, viewport, 'left')).toMatchObject({ x: 78, placement: 'right' })

    const rightEdge = { left: 330, top: 100, right: 390, bottom: 120, width: 60, height: 20 } as DOMRect

    expect(computePosition(rightEdge, size, viewport, 'right')).toMatchObject({ x: 242, placement: 'left' })
  })

  it('should keep the requested side when neither side fits', () => {
    const tiny = { width: 400, height: 140 }

    expect(computePosition(anchor, tiny, { width: 400, height: 150 }, 'bottom').placement).toBe('bottom')
  })

  it('should shift along the other axis to stay inside the viewport', () => {
    const farRight = { left: 370, top: 100, right: 395, bottom: 120, width: 25, height: 20 } as DOMRect

    expect(computePosition(farRight, size, viewport, 'bottom').x).toBe(316)

    const farLeft = { left: 0, top: 100, right: 10, bottom: 120, width: 10, height: 20 } as DOMRect

    expect(computePosition(farLeft, size, viewport, 'bottom').x).toBe(4)

    const farBottom = { left: 100, top: 295, right: 160, bottom: 299, width: 60, height: 4 } as DOMRect

    expect(computePosition(farBottom, size, viewport, 'right').y).toBe(256)
  })
})

describe('useFloating on the server', () => {
  it('does not touch the window when there is none', async () => {
    const { ref } = await import('vue')
    const original = globalThis.window

    // @ts-expect-error simulate a server
    delete globalThis.window

    try {
      const { useFloating } = await import('../../src/composables/useFloating')

      expect(() => useFloating(ref(null), ref(null), ref(true))).not.toThrow()
      expect(() => useFloating(ref(null), ref(null), ref(false))).not.toThrow()
    } finally {
      globalThis.window = original
    }
  })
})
