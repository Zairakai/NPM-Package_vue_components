<script setup>
  import { useControllable } from '@/composables/useControllable'
  import OverlayModal from '@overlay/Modal.vue'
  import { computed } from 'vue'

  defineOptions({
    name: 'MediaLightbox',
  })

  const emit = defineEmits(['update:modelValue', 'update:index'])

  const props = defineProps({
    id: String,
    class: String,
    // The images: { src, alt, caption, srcset, thumbnail }.
    items: {
      type: Array,
      default: () => [],
    },
    // Whether the large view is open.
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    // The index of the image shown in the large view.
    index: {
      type: Number,
      default: undefined,
    },
    // Show the thumbnails that open it. Turn off to open it from your own buttons with v-model.
    thumbnails: {
      type: Boolean,
      default: true,
    },
    loop: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: 'Image viewer',
    },
    previousLabel: {
      type: String,
      default: 'Previous image',
    },
    nextLabel: {
      type: String,
      default: 'Next image',
    },
    openLabel: {
      type: String,
      default: 'View {alt}',
    },
  })

  const open = useControllable(props, 'modelValue', emit, false)
  const current = useControllable(props, 'index', emit, 0)

  const count = computed(() => props.items.length)
  const item = computed(() => props.items[current.value])

  function go(index) {
    if (0 < count.value) {
      current.value = props.loop ? (index + count.value) % count.value : Math.max(0, Math.min(count.value - 1, index))
    }
  }

  function show(index) {
    go(index)
    open.value = true
  }

  function onKeydown(event) {
    const actions = {
      ArrowLeft: () => go(current.value - 1),
      ArrowRight: () => go(current.value + 1),
      Home: () => go(0),
      End: () => go(count.value - 1),
    }

    if (actions[event.key]) {
      event.preventDefault()
      actions[event.key]()
    }
  }

  const rootProps = computed(() => ({
    id: props.id,
    class: `lightbox ${props.class ?? ''}`.trim(),
  }))
</script>

<template>
  <div v-bind="rootProps">
    <ul
      v-if="thumbnails"
      class="lightbox-thumbnails"
      role="list"
    >
      <li
        v-for="(thumb, position) in items"
        :key="thumb.src"
      >
        <button
          type="button"
          class="lightbox-thumbnail"
          :aria-label="openLabel.replace('{alt}', thumb.alt ?? '')"
          @click="show(position)"
        >
          <img
            :src="thumb.thumbnail ?? thumb.src"
            :alt="thumb.alt ?? ''"
            loading="lazy"
            decoding="async"
          />
        </button>
      </li>
    </ul>
    <OverlayModal
      class="lightbox-dialog"
      :model-value="open"
      :title="title"
      closedby="any"
      @update:model-value="open = $event"
    >
      <figure
        v-if="item"
        class="lightbox-figure"
        tabindex="0"
        @keydown="onKeydown"
      >
        <img
          class="lightbox-image"
          :src="item.src"
          :srcset="item.srcset"
          :alt="item.alt ?? ''"
        />
        <figcaption
          v-if="item.caption || $slots.caption"
          class="lightbox-caption"
        >
          <slot
            name="caption"
            :item="item"
          >
            {{ item.caption }}
          </slot>
        </figcaption>
      </figure>
      <div class="lightbox-controls">
        <button
          type="button"
          class="lightbox-previous"
          :aria-label="previousLabel"
          :disabled="!loop && 0 === current"
          @click="go(current - 1)"
        >
          &lsaquo;
        </button>
        <output
          class="lightbox-counter"
          aria-live="polite"
        >
          {{ current + 1 }} / {{ count }}
        </output>
        <button
          type="button"
          class="lightbox-next"
          :aria-label="nextLabel"
          :disabled="!loop && current === count - 1"
          @click="go(current + 1)"
        >
          &rsaquo;
        </button>
      </div>
    </OverlayModal>
  </div>
</template>
