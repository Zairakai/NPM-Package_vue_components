<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'NavigationSkipLink',
  })

  const props = defineProps({
    id: String,
    class: String,
    // The id of the element to jump to, with or without the #.
    target: {
      type: String,
      default: 'main',
    },
    label: {
      type: String,
      default: 'Skip to the main content',
    },
  })

  const href = computed(() => (props.target.startsWith('#') ? props.target : `#${props.target}`))

  // A link to an element that is not focusable moves the view but not always the focus.
  function onClick() {
    const element = document.getElementById(href.value.slice(1))

    if (element && !element.hasAttribute('tabindex') && !/^(a|button|input|select|textarea)$/i.test(element.tagName)) {
      element.setAttribute('tabindex', '-1')
    }

    element?.focus()
  }

  // Functional CSS only: out of the screen until it has the focus.
  const hidden = { position: 'absolute', insetInlineStart: '-9999px' }
  const linkProps = computed(() => ({
    id: props.id,
    class: `skip-link ${props.class ?? ''}`.trim(),
    href: href.value,
    style: hidden,
  }))

  function onFocus(event) {
    event.target.style.insetInlineStart = '0'
  }

  function onBlur(event) {
    event.target.style.insetInlineStart = hidden.insetInlineStart
  }
</script>

<template>
  <a
    v-bind="linkProps"
    @click="onClick"
    @focus="onFocus"
    @blur="onBlur"
  >
    <slot>{{ label }}</slot>
  </a>
</template>
