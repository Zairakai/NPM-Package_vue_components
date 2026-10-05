<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { isThemeMode, resolveTheme } from '@utility/theme'
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

  defineOptions({
    name: 'UtilityThemeSwitcher',
  })

  const emit = defineEmits(['update:modelValue', 'change'])

  const props = defineProps({
    id: String,
    class: String,
    // "light", "dark" or "system".
    modelValue: {
      type: String,
      default: undefined,
    },
    // Where the choice is remembered. Empty for nowhere.
    storageKey: {
      type: String,
      default: 'zk-theme',
    },
    // Where the theme is written, as the data-theme attribute. The page itself by default.
    attribute: {
      type: String,
      default: 'data-theme',
    },
    modes: {
      type: Array,
      default: () => ['light', 'dark', 'system'],
    },
    labels: {
      type: Object,
      default: () => ({ light: 'Light', dark: 'Dark', system: 'System' }),
    },
    label: {
      type: String,
      default: 'Theme',
    },
  })

  function stored() {
    try {
      const value = props.storageKey ? window.localStorage.getItem(props.storageKey) : null

      return isThemeMode(value) ? value : undefined
    } catch {
      return undefined
    }
  }

  const state = useControllable(props, 'modelValue', emit, stored() ?? 'system')
  const query = ref(null)
  const prefersDark = ref(false)

  const applied = computed(() => resolveTheme(state.value, prefersDark.value))

  function apply() {
    document.documentElement.setAttribute(props.attribute, applied.value)
    document.documentElement.style.colorScheme = applied.value
    emit('change', applied.value)
  }

  function choose(mode) {
    state.value = mode

    try {
      if (props.storageKey) {
        window.localStorage.setItem(props.storageKey, mode)
      }
    } catch {
      // Storage can be blocked: the choice only lasts for the page.
    }
  }

  const onPreference = (event) => (prefersDark.value = event.matches)

  onMounted(() => {
    query.value = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null
    prefersDark.value = Boolean(query.value?.matches)
    query.value?.addEventListener('change', onPreference)
    apply()
  })

  onBeforeUnmount(() => query.value?.removeEventListener('change', onPreference))

  watch(applied, apply)

  const rootProps = computed(() => ({
    id: props.id,
    class: `theme-switcher ${props.class ?? ''}`.trim(),
    role: 'group',
    'aria-label': props.label,
    'data-theme-applied': applied.value,
  }))
</script>

<template>
  <div v-bind="rootProps">
    <button
      v-for="mode in modes"
      :key="mode"
      type="button"
      class="theme-switcher-option"
      :aria-pressed="mode === state"
      :data-mode="mode"
      @click="choose(mode)"
    >
      <slot
        :name="mode"
        :mode="mode"
      >
        {{ labels[mode] ?? mode }}
      </slot>
    </button>
  </div>
</template>
