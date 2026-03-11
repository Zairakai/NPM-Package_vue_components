<script setup>
  import { computed } from 'vue'

  import MediaSource from '@medias/Source.vue'
  import MediaTrack from '@medias/Track.vue'

  defineOptions({
    name: 'MediaVideo',
  })

  const props = defineProps({
    id: String,
    class: String,
    controls: {
      type: Boolean,
      default: true,
    },
    autoplay: {
      type: Boolean,
      default: false,
    },
    loop: {
      type: Boolean,
      default: false,
    },
    muted: {
      type: Boolean,
      default: false,
    },
    width: String,
    height: String,
    poster: String,
    preload: String,
    sources: {
      type: Array,
      required: true,
    },
    tracks: {
      type: Array,
      default: () => [],
    },
  })

  const videoProps = computed(() => ({
    id: props.id,
    class: props.class,
    controls: props.controls,
    autoplay: props.autoplay,
    loop: props.loop,
    muted: props.muted,
    width: props.width,
    height: props.height,
    poster: props.poster,
    preload: props.preload,
  }))
</script>

<template>
  <video v-bind="videoProps">
    <MediaSource
      v-for="(source, index) in sources"
      :key="index"
      v-bind="source"
    />

    <template v-if="tracks.length">
      <MediaTrack
        v-for="(track, index) in tracks"
        :key="index"
        v-bind="track"
      />
    </template>
    Your browser does not support the video tag.
  </video>
</template>
