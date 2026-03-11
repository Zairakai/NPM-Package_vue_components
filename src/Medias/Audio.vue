<script setup>
  import { computed } from 'vue'

  import MediaSource from '@medias/Source.vue'
  import MediaTrack from '@medias/Track.vue'

  defineOptions({
    name: 'MediaAudio',
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

  const audioProps = computed(() => ({
    id: props.id,
    class: `wrapper ${props.class ?? ''}`.trim(),
    controls: props.controls,
    autoplay: props.autoplay,
    loop: props.loop,
    muted: props.muted,
    preload: props.preload,
  }))
</script>

<template>
  <audio v-bind="audioProps">
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
    Your browser does not support the audio tag.
  </audio>
</template>
