<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'ContentLink',
})

const router = useRouter()

const props = defineProps({
  route: String,
  routeParams: {
    type: Array,
    default: () => [],
  },
  href: String,
  target: String,
  rel: String,
  id: String,
  class: String,
  title: String,
  ariaLabel: String,
  download: [Boolean, String],
  referrerpolicy: String,
  hreflang: String,
  type: String,
  msr: String,
  iconBefore: String,
  iconAfter: String,
})

const isRouterLink = computed(() => props.route && router.hasRoute(props.route))

const hrefComp = computed(() => {
  if (props.route) {
    return router.hasRoute(props.route)
      ? router.resolve({ name: props.route }).href
      : null
  }

  return props.href ?? '#'
})

const relComp = computed(() => {
  return props.target === '_blank' && !props.rel
    ? 'noopener noreferrer'
    : (props.rel ?? null)
})

const isExternalLink = computed(() => {
  const regex = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//

  return !hrefComp.value ? false : regex.test(hrefComp.value)
})

const linkProps = computed(() => {
  const result = {}

  if (props.id) {
    result.id = props.id
  }

  if (isExternalLink.value) {
    result.target = '_blank'
    result.rel = 'noopener noreferrer'
  } else if (props.target) {
    result.target = props.target
  }

  if (props.title) {
    result.title = props.title
  }
  if (props.rel && !result.rel) {
    result.rel = relComp.value
  }
  if (props.class) {
    result.class = props.class
  }
  if (props.ariaLabel) {
    result['aria-label'] = props.ariaLabel
  }
  if (props.download) {
    result.download = props.download
  }
  if (props.referrerpolicy) {
    result.referrerpolicy = props.referrerpolicy
  }
  if (props.hreflang) {
    result.hreflang = props.hreflang
  }
  if (props.type) {
    result.type = props.type
  }

  return result
})

const needSlotSpan = computed(() => {
  return props.iconBefore !== null ||
    props.msr !== null ||
    props.iconAfter !== null
    ? true
    : false
})

onMounted(() => {
  if (!props.route && !props.href) {
    throw new Error('You must provide either "route" or "href" prop.')
  }
})
</script>

<template>
  <router-link v-if="isRouterLink" :to="{ name: route }" v-bind="linkProps">
    <span v-if="iconBefore || $slots['icon-before']" class="msr icon-before"
      ><slot name="icon-before">{{ iconBefore }}</slot></span
    >

    <span v-if="msr" class="msr">{{ msr }}</span>

    <template v-if="needSlotSpan">
      <span>
        <slot />
      </span>
    </template>

    <template v-else>
      <slot />
    </template>

    <span v-if="iconAfter || $slots['icon-after']" class="msr icon-after"
      ><slot name="icon-after">{{ iconAfter }}</slot></span
    >
  </router-link>

  <a v-else-if="hrefComp" :href="hrefComp" v-bind="linkProps">
    <span v-if="iconBefore || $slots['icon-before']" class="msr icon-before"
      ><slot name="icon-before">{{ iconBefore }}</slot></span
    >

    <span v-if="msr" class="msr">{{ msr }}</span>

    <template v-if="needSlotSpan">
      <span>
        <slot />
      </span>
    </template>

    <template v-else>
      <slot />
    </template>

    <span v-if="iconAfter || $slots['icon-after']" class="msr icon-after"
      ><slot name="icon-after">{{ iconAfter }}</slot></span
    >
  </a>

  <span v-else>
    <span v-if="iconBefore || $slots['icon-before']" class="msr icon-before"
      ><slot name="icon-before">{{ iconBefore }}</slot></span
    >

    <span v-if="msr" class="msr">{{ msr }}</span>

    <template v-if="needSlotSpan">
      <span>
        <slot />
      </span>
    </template>

    <template v-else>
      <slot />
    </template>

    <span v-if="iconAfter || $slots['icon-after']" class="msr icon-after"
      ><slot name="icon-after">{{ iconAfter }}</slot></span
    >
  </span>
</template>
