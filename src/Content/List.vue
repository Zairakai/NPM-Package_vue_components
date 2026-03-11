<script setup>
  import ContentLink from '@content/Link.vue'
  import { computed } from 'vue'

  const getPicto = (picto) => {
    return picto
  }

  defineOptions({
    name: 'ContentList',
  })

  const props = defineProps({
    id: String,
    class: String,
    items: {
      type: Array,
      required: true,
    },
    ordered: {
      type: Boolean,
      default: false,
    },
  })

  const listTag = computed(() => (props.ordered ? 'ol' : 'ul'))

  const listProps = computed(() => ({
    id: props.id,
    class: props.class,
  }))

  const linkProps = (item) => {
    const result = {}

    if (item.route) {
      result.route = item.route
    }
    if (item.href) {
      result.href = item.href
    }
    if (item.target) {
      result.target = item.target
    }
    if (item.rel) {
      result.rel = item.rel
    }
    if (item.id) {
      result.id = item.id
    }
    if (item.class) {
      result.class = item.class
    }
    if (item.title) {
      result.title = item.title
    }
    if (item.ariaLabel) {
      result['aria-label'] = item.ariaLabel
    }
    if (item.download) {
      result.download = item.download
    }
    if (item.referrerpolicy) {
      result.referrerpolicy = item.referrerpolicy
    }
    if (item.hreflang) {
      result.hreflang = item.hreflang
    }
    if (item.type) {
      result.type = item.type
    }
    if (item.msr) {
      result.msr = item.msr
    }
    if (item.iconBefore) {
      result.iconBefore = item.iconBefore
    }
    if (item.iconAfter) {
      result.iconAfter = item.iconAfter
    }
    if (item.picto) {
      result.picto = item.picto
    }

    return result
  }
</script>

<template>
  <component
    :is="listTag"
    v-bind="listProps"
  >
    <li
      v-for="(item, index) in items"
      :key="index"
    >
      <ContentLink
        v-if="item.route || item.href"
        v-bind="linkProps(item)"
      >
        <span
          v-if="null !== item.picto"
          v-html="getPicto(item.picto)"
        />
        <template v-else>{{ item.name }}</template>
      </ContentLink>
      <template v-else>
        <span
          v-if="null !== item.picto"
          v-html="getPicto(item.picto)"
        />
        <template v-else>{{ item.name }}</template>
      </template>

      <template v-if="item.children">
        <content-list :items="item.children" />
      </template>
    </li>
  </component>
</template>
