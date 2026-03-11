import { describe, expect, it } from 'vitest'

vi.mock('@js/Services/Pinia', () => {
  return {
    default: {},
  }
})

describe('main exports', () => {
  it('should export Form components', async () => {
    const formExports = await import('../src/Form/index.js')

    // Should export common form components
    expect(formExports.FormButton).toBeDefined()
    expect(formExports.FormInput).toBeDefined()
    expect(formExports.FormForm).toBeDefined()
    expect(formExports.FormField).toBeDefined()

    // Check that they are components/objects
    expect(typeof formExports.FormButton).toBe('object')
    expect(typeof formExports.FormInput).toBe('object')
  })

  it('should export Layout components', async () => {
    const layoutExports = await import('../src/Layout/index.js')

    // Should export common layout components
    expect(layoutExports.LayoutContainer).toBeDefined()
    expect(layoutExports.LayoutGrid).toBeDefined()
    expect(layoutExports.LayoutGridItem).toBeDefined()
    expect(layoutExports.LayoutRow).toBeDefined()
    expect(layoutExports.LayoutColumn).toBeDefined()

    // Check that they are components/objects
    expect(typeof layoutExports.LayoutContainer).toBe('object')
    expect(typeof layoutExports.LayoutGrid).toBe('object')
  })

  it('should export Content components', async () => {
    const contentExports = await import('../src/Content/index.js')

    // Should export common content components
    expect(contentExports.ContentHeading).toBeDefined()
    expect(contentExports.ContentParagraph).toBeDefined()
    expect(contentExports.ContentLink).toBeDefined()
    expect(contentExports.ContentList).toBeDefined()

    // Check that they are components/objects
    expect(typeof contentExports.ContentHeading).toBe('object')
    expect(typeof contentExports.ContentParagraph).toBe('object')
  })

  it('should export Media components', async () => {
    const mediaExports = await import('../src/Medias/index.js')

    // Should export common media components
    expect(mediaExports.MediaImage).toBeDefined()
    expect(mediaExports.MediaVideo).toBeDefined()
    expect(mediaExports.MediaAudio).toBeDefined()
    expect(mediaExports.MediaFigure).toBeDefined()

    // Check that they are components/objects
    expect(typeof mediaExports.MediaImage).toBe('object')
    expect(typeof mediaExports.MediaVideo).toBe('object')
  })

  it('should export main index file with all categories', async () => {
    const mainExports = await import('../src/index.js')

    // Should re-export all component categories
    expect(Object.keys(mainExports).length).toBeGreaterThan(0)

    // Test that main categories are available
    const keys = Object.keys(mainExports)
    const hasFormComponents = keys.some((key) => key.startsWith('Form'))
    const hasLayoutComponents = keys.some((key) => key.startsWith('Layout'))
    const hasContentComponents = keys.some((key) => key.startsWith('Content'))
    const hasMediaComponents = keys.some((key) => key.startsWith('Media'))

    expect(hasFormComponents).toBe(true)
    expect(hasLayoutComponents).toBe(true)
    expect(hasContentComponents).toBe(true)
    expect(hasMediaComponents).toBe(true)
  })

  it('should have consistent component structure', async () => {
    const formExports = await import('../src/Form/index.js')

    // Check that components have expected Vue component structure
    if (formExports.FormButton) {
      expect(formExports.FormButton.__name || formExports.FormButton.name).toBeDefined()
    }

    if (formExports.FormInput) {
      expect(typeof formExports.FormInput).toBe('object')
      // Vue components should have setup or render functions, or be SFC objects
      expect(
        formExports.FormInput.setup ||
          formExports.FormInput.render ||
          formExports.FormInput.template ||
          formExports.FormInput.__file // SFC indicator
      ).toBeDefined()
    }
  })

  it('should export components that can be imported individually', async () => {
    // Test that individual category imports work
    const { LayoutContainer } = await import('../src/Layout/index.js')
    const { FormButton } = await import('../src/Form/index.js')

    expect(LayoutContainer).toBeDefined()
    expect(FormButton).toBeDefined()
    expect(typeof LayoutContainer).toBe('object')
    expect(typeof FormButton).toBe('object')
  })

  it('should export Vue plugin', async () => {
    const mainExports = await import('../src/index.js')

    // Should export default plugin
    expect(mainExports.default).toBeDefined()
    expect(typeof mainExports.default).toBe('object')
    expect(typeof mainExports.default.install).toBe('function')
  })
})
