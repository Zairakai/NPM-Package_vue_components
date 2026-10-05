<script setup>
  import { useUid } from '@/composables/useUid'
  import { computed, onMounted, reactive, ref } from 'vue'

  defineOptions({
    name: 'FeedbackCookieBanner',
  })

  const emit = defineEmits(['consent'])

  const props = defineProps({
    id: String,
    class: String,
    // The categories the visitor can accept: { id, label, description, required }. A required one is always on.
    categories: {
      type: Array,
      default: () => [{ id: 'essential', label: 'Essential', required: true }],
    },
    // Where the answer is remembered.
    storageKey: {
      type: String,
      default: 'zk-consent',
    },
    title: {
      type: String,
      default: 'Cookies',
    },
    acceptLabel: {
      type: String,
      default: 'Accept all',
    },
    rejectLabel: {
      type: String,
      default: 'Reject all',
    },
    customizeLabel: {
      type: String,
      default: 'Customize',
    },
    saveLabel: {
      type: String,
      default: 'Save my choices',
    },
  })

  const uid = useUid('consent')
  const visible = ref(false)
  const customizing = ref(false)
  const choices = reactive(
    Object.fromEntries(props.categories.map((category) => [category.id, Boolean(category.required)]))
  )

  function read() {
    try {
      return JSON.parse(window.localStorage.getItem(props.storageKey) ?? 'null')
    } catch {
      return null
    }
  }

  // The banner only shows while there is no answer: shown again if a category was added since.
  onMounted(() => {
    const saved = read()

    if (saved && props.categories.every((category) => category.id in saved)) {
      Object.assign(choices, saved)
      emit('consent', { ...choices })
    } else {
      visible.value = true
    }
  })

  function answer(values) {
    props.categories.forEach(
      (category) => (choices[category.id] = category.required ? true : Boolean(values[category.id]))
    )

    try {
      window.localStorage.setItem(props.storageKey, JSON.stringify(choices))
    } catch {
      // Storage can be blocked: the answer only lasts for the page.
    }

    visible.value = false
    emit('consent', { ...choices })
  }

  const all = (value) => Object.fromEntries(props.categories.map((category) => [category.id, value]))

  const bannerProps = computed(() => ({
    id: props.id,
    class: `cookie-banner ${props.class ?? ''}`.trim(),
    role: 'region',
    'aria-labelledby': `${uid}-title`,
  }))
</script>

<template>
  <div
    v-if="visible"
    v-bind="bannerProps"
  >
    <p
      :id="`${uid}-title`"
      class="cookie-banner-title"
    >
      {{ title }}
    </p>
    <div class="cookie-banner-text">
      <slot />
    </div>
    <fieldset
      v-if="customizing"
      class="cookie-banner-categories"
    >
      <legend class="cookie-banner-legend">{{ customizeLabel }}</legend>
      <div
        v-for="category in categories"
        :key="category.id"
        class="cookie-banner-category"
      >
        <input
          :id="`${uid}-${category.id}`"
          v-model="choices[category.id]"
          type="checkbox"
          :disabled="category.required"
        />
        <label :for="`${uid}-${category.id}`">{{ category.label }}</label>
        <p
          v-if="category.description"
          class="cookie-banner-description"
        >
          {{ category.description }}
        </p>
      </div>
    </fieldset>
    <div class="cookie-banner-actions">
      <button
        type="button"
        class="cookie-banner-accept"
        @click="answer(all(true))"
      >
        {{ acceptLabel }}
      </button>
      <button
        type="button"
        class="cookie-banner-reject"
        @click="answer(all(false))"
      >
        {{ rejectLabel }}
      </button>
      <button
        v-if="!customizing"
        type="button"
        class="cookie-banner-customize"
        :aria-expanded="customizing"
        @click="customizing = true"
      >
        {{ customizeLabel }}
      </button>
      <button
        v-else
        type="button"
        class="cookie-banner-save"
        @click="answer(choices)"
      >
        {{ saveLabel }}
      </button>
    </div>
  </div>
</template>
