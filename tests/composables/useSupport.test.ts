import { afterEach, describe, expect, it } from 'vitest'
import { detectSupport, getSupport, resetSupport, setSupport } from '../../src/composables/useSupport'

class Unknown {}

function env(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    document: { createElement: () => new Unknown(), startViewTransition: () => undefined },
    HTMLUnknownElement: Unknown,
    HTMLDialogElement: { prototype: { showModal: () => undefined, closedBy: '', requestClose: () => undefined } },
    HTMLElement: { prototype: { popover: null, inert: false, onbeforematch: null } },
    HTMLButtonElement: { prototype: { commandForElement: null } },
    HTMLDetailsElement: { prototype: { name: '' } },
    HTMLInputElement: { prototype: { showPicker: () => undefined } },
    CSS: { supports: () => true },
    navigation: {},
    navigator: { clipboard: { writeText: () => undefined }, share: () => undefined },
    ...overrides,
  }
}

describe('detectSupport', () => {
  it('should detect a browser that has everything', () => {
    expect(detectSupport(env())).toEqual({
      dialog: true,
      dialogClosedBy: true,
      dialogRequestClose: true,
      popover: true,
      invokerCommands: true,
      anchorPositioning: true,
      hiddenUntilFound: true,
      detailsName: true,
      inert: true,
      search: false,
      viewTransitions: true,
      navigationApi: true,
      clipboard: true,
      share: true,
      showPicker: true,
    })
  })

  it('should know the search element when it is not an unknown element', () => {
    expect(detectSupport(env({ document: { createElement: () => ({}) } })).search).toBe(true)
  })

  it('should detect nothing without a document (server rendering)', () => {
    const support = detectSupport({})

    expect(Object.values(support).every((value) => false === value)).toBe(true)
  })

  it('should detect an old browser', () => {
    const support = detectSupport(
      env({
        HTMLDialogElement: { prototype: {} },
        HTMLElement: { prototype: {} },
        HTMLButtonElement: { prototype: {} },
        HTMLDetailsElement: { prototype: {} },
        HTMLInputElement: { prototype: {} },
        CSS: {},
        navigation: undefined,
        navigator: {},
        document: { createElement: () => new Unknown() },
      })
    )

    expect(support.dialog).toBe(false)
    expect(support.popover).toBe(false)
    expect(support.anchorPositioning).toBe(false)
    expect(support.clipboard).toBe(false)
    expect(support.viewTransitions).toBe(false)
  })

  it('should cope with missing interfaces', () => {
    const support = detectSupport({ document: { createElement: () => ({}) } })

    expect(support.dialog).toBe(false)
    expect(support.search).toBe(false)
  })
})

describe('getSupport', () => {
  afterEach(() => resetSupport())

  it('should detect once and apply the overrides', () => {
    const detected = getSupport()

    setSupport({ popover: !detected.popover })

    expect(getSupport().popover).toBe(!detected.popover)
    expect(getSupport().dialog).toBe(detected.dialog)

    resetSupport()

    expect(getSupport().popover).toBe(detected.popover)
  })
})
