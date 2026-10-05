<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useUid } from '@/composables/useUid'
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

  defineOptions({
    name: 'MediaPlayer',
  })

  const emit = defineEmits(['update:playing', 'update:time', 'ended', 'error'])

  const props = defineProps({
    id: String,
    class: String,
    src: String,
    // "video" or "audio".
    type: {
      type: String,
      default: 'video',
      validator(value) {
        return ['video', 'audio'].includes(value)
      },
    },
    poster: String,
    // Subtitles: { src, srclang, label, default }.
    tracks: {
      type: Array,
      default: () => [],
    },
    // Our own controls instead of the ones of the browser.
    customControls: {
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
    // Whether it plays. Start playing by setting it, a browser can refuse without a click.
    playing: {
      type: Boolean,
      default: undefined,
    },
    label: String,
    playLabel: {
      type: String,
      default: 'Play',
    },
    pauseLabel: {
      type: String,
      default: 'Pause',
    },
    muteLabel: {
      type: String,
      default: 'Mute',
    },
    unmuteLabel: {
      type: String,
      default: 'Unmute',
    },
    seekLabel: {
      type: String,
      default: 'Seek',
    },
    volumeLabel: {
      type: String,
      default: 'Volume',
    },
    speedLabel: {
      type: String,
      default: 'Speed',
    },
    fullscreenLabel: {
      type: String,
      default: 'Fullscreen',
    },
    speeds: {
      type: Array,
      default: () => [0.5, 1, 1.5, 2],
    },
  })

  const uid = useUid('player')
  const media = ref(null)
  const root = ref(null)
  const playing = useControllable(props, 'playing', emit, false)
  const time = ref(0)
  const duration = ref(0)
  const volume = ref(1)
  const isMuted = ref(props.muted)
  const speed = ref(1)
  const fullscreen = ref(false)

  const pad = (number) => String(Math.floor(number)).padStart(2, '0')

  // 3725 -> 1:02:05, 65 -> 1:05
  function format(seconds) {
    if (!Number.isFinite(seconds) || 0 > seconds) {
      return '0:00'
    }

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    return 0 < hours ? `${hours}:${pad(minutes)}:${pad(seconds % 60)}` : `${minutes}:${pad(seconds % 60)}`
  }

  async function toggle() {
    const element = media.value

    if (!element) {
      return
    }

    if (element.paused) {
      try {
        await element.play()
      } catch {
        // The browser refused (no click yet): the state stays paused.
        playing.value = false
      }
    } else {
      element.pause()
    }
  }

  const onPlay = () => (playing.value = true)
  const onPause = () => (playing.value = false)

  function onTimeUpdate() {
    time.value = media.value.currentTime
    emit('update:time', time.value)
  }

  const onMeta = () => (duration.value = media.value.duration)

  function seek(event) {
    media.value.currentTime = Number(event.target.value)
    time.value = media.value.currentTime
  }

  function setVolume(event) {
    volume.value = Number(event.target.value)
    media.value.volume = volume.value
    isMuted.value = 0 === volume.value
    media.value.muted = isMuted.value
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
    media.value.muted = isMuted.value
  }

  function setSpeed(event) {
    speed.value = Number(event.target.value)
    media.value.playbackRate = speed.value
  }

  const canFullscreen = computed(
    () => 'video' === props.type && 'undefined' !== typeof document && Boolean(document.fullscreenEnabled)
  )

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      root.value?.requestFullscreen?.()
    }
  }

  const onFullscreen = () => (fullscreen.value = document.fullscreenElement === root.value)

  // The keyboard on the player: Space plays, arrows seek and change the volume, M mutes, F goes fullscreen.
  function onKeydown(event) {
    if (!props.customControls || event.target.matches('input, select, button')) {
      return
    }

    const actions = {
      ' ': toggle,
      k: toggle,
      ArrowLeft: () => (media.value.currentTime = Math.max(0, media.value.currentTime - 5)),
      ArrowRight: () => (media.value.currentTime = Math.min(duration.value, media.value.currentTime + 5)),
      m: toggleMute,
      f: () => canFullscreen.value && toggleFullscreen(),
    }

    if (actions[event.key]) {
      event.preventDefault()
      actions[event.key]()
    }
  }

  onMounted(() => document.addEventListener('fullscreenchange', onFullscreen))
  onBeforeUnmount(() => document.removeEventListener('fullscreenchange', onFullscreen))

  const rootProps = computed(() => ({
    id: props.id,
    class: `player ${props.class ?? ''}`.trim(),
    role: 'group',
    'aria-label': props.label,
    'data-playing': playing.value ? '' : undefined,
    'data-fullscreen': fullscreen.value ? '' : undefined,
    'data-type': props.type,
  }))

  const mediaProps = computed(() => ({
    class: 'player-media',
    src: props.src,
    poster: 'video' === props.type ? props.poster : undefined,
    controls: !props.customControls,
    loop: props.loop,
    muted: props.muted,
    preload: 'metadata',
    playsinline: 'video' === props.type ? true : undefined,
  }))
</script>

<template>
  <div
    ref="root"
    v-bind="rootProps"
    @keydown="onKeydown"
  >
    <component
      :is="type"
      ref="media"
      v-bind="mediaProps"
      @play="onPlay"
      @pause="onPause"
      @ended="emit('ended')"
      @error="emit('error', $event)"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onMeta"
      @durationchange="onMeta"
    >
      <track
        v-for="track in tracks"
        :key="track.src"
        kind="subtitles"
        :src="track.src"
        :srclang="track.srclang"
        :label="track.label"
        :default="track.default"
      />
      <slot />
    </component>
    <div
      v-if="customControls"
      class="player-controls"
    >
      <button
        type="button"
        class="player-play"
        :aria-label="playing ? pauseLabel : playLabel"
        :aria-pressed="playing"
        @click="toggle"
      >
        {{ playing ? '❚❚' : '▶' }}
      </button>
      <input
        type="range"
        class="player-seek"
        min="0"
        :max="duration || 0"
        step="0.1"
        :value="time"
        :aria-label="seekLabel"
        :aria-valuetext="`${format(time)} / ${format(duration)}`"
        @input="seek"
      />
      <output
        class="player-time"
        :for="`${uid}-seek`"
      >
        {{ format(time) }} / {{ format(duration) }}
      </output>
      <button
        type="button"
        class="player-mute"
        :aria-label="isMuted ? unmuteLabel : muteLabel"
        :aria-pressed="isMuted"
        @click="toggleMute"
      >
        {{ isMuted ? '🔇' : '🔊' }}
      </button>
      <input
        type="range"
        class="player-volume"
        min="0"
        max="1"
        step="0.05"
        :value="isMuted ? 0 : volume"
        :aria-label="volumeLabel"
        @input="setVolume"
      />
      <select
        class="player-speed"
        :aria-label="speedLabel"
        :value="speed"
        @change="setSpeed"
      >
        <option
          v-for="rate in speeds"
          :key="rate"
          :value="rate"
        >
          {{ rate }}×
        </option>
      </select>
      <button
        v-if="canFullscreen"
        type="button"
        class="player-fullscreen"
        :aria-label="fullscreenLabel"
        :aria-pressed="fullscreen"
        @click="toggleFullscreen"
      >
        ⛶
      </button>
    </div>
  </div>
</template>
