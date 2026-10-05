import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { useUid } from '../../src/composables/useUid'

describe('useUid', () => {
  it('should return a different prefixed id on each call', () => {
    const ids: string[] = []
    const Probe = defineComponent({
      setup() {
        ids.push(useUid('modal'), useUid('modal'))

        return () => h('div')
      },
    })

    mount(Probe)

    expect(ids[0]).toMatch(/^modal-/)
    expect(ids[1]).toMatch(/^modal-/)
    expect(ids[0]).not.toBe(ids[1])
  })

  it('should use the default prefix', () => {
    let id = ''
    const Probe = defineComponent({
      setup() {
        id = useUid()

        return () => h('div')
      },
    })

    mount(Probe)

    expect(id.startsWith('zk-')).toBe(true)
  })
})
