<script setup>
  import { computed, ref } from 'vue'

  defineOptions({
    name: 'DataVirtualScroll',
  })

  const props = defineProps({
    id: String,
    class: String,
    items: {
      type: Array,
      default: () => [],
    },
    // The height of one item, in pixels. Every item has the same height.
    itemHeight: {
      type: Number,
      required: true,
    },
    // The height of the window, in pixels.
    height: {
      type: Number,
      default: 400,
    },
    // How many items are drawn above and below the window, to scroll without blanks.
    buffer: {
      type: Number,
      default: 3,
    },
    itemKey: String,
    label: String,
  })

  const scroller = ref(null)
  const scrollTop = ref(0)

  const first = computed(() => Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer))
  const last = computed(() =>
    Math.min(props.items.length, Math.ceil((scrollTop.value + props.height) / props.itemHeight) + props.buffer)
  )
  const visible = computed(() =>
    props.items.slice(first.value, last.value).map((item, offset) => ({ item, index: first.value + offset }))
  )

  function onScroll(event) {
    scrollTop.value = event.target.scrollTop
  }

  // Bring an item into view.
  function scrollToIndex(index) {
    scroller.value.scrollTop = Math.max(0, Math.min(index, props.items.length - 1)) * props.itemHeight
    scrollTop.value = scroller.value.scrollTop
  }

  defineExpose({ scrollToIndex })

  // Functional CSS only: the scroll window, the full height that makes the scroll bar right,
  // and the drawn items placed where they would be in the whole list.
  const windowStyle = computed(() => ({ height: `${props.height}px`, overflowY: 'auto', position: 'relative' }))
  const spacerStyle = computed(() => ({ height: `${props.items.length * props.itemHeight}px`, position: 'relative' }))
  const itemStyle = (index) => ({
    position: 'absolute',
    top: `${index * props.itemHeight}px`,
    left: 0,
    right: 0,
    height: `${props.itemHeight}px`,
  })

  const viewProps = computed(() => ({
    id: props.id,
    class: `virtual-scroll ${props.class ?? ''}`.trim(),
    role: 'list',
    'aria-label': props.label,
    // The window scrolls: it has to be reachable with the keyboard.
    tabindex: 0,
    style: windowStyle.value,
  }))
</script>

<template>
  <div
    ref="scroller"
    v-bind="viewProps"
    @scroll.passive="onScroll"
  >
    <div :style="spacerStyle">
      <div
        v-for="entry in visible"
        :key="itemKey ? entry.item[itemKey] : entry.index"
        class="virtual-scroll-item"
        role="listitem"
        :aria-setsize="items.length"
        :aria-posinset="entry.index + 1"
        :style="itemStyle(entry.index)"
      >
        <slot
          :item="entry.item"
          :index="entry.index"
        />
      </div>
    </div>
  </div>
</template>
