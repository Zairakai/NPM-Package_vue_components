<script setup>
  import ContentCodeBlock from '@content/CodeBlock.vue'
  import { groupSelection, selectInGroup } from '@content/codeGroup'
  import NavigationTab from '@navigation/Tab.vue'
  import NavigationTabList from '@navigation/TabList.vue'
  import NavigationTabPanel from '@navigation/TabPanel.vue'
  import NavigationTabs from '@navigation/Tabs.vue'
  import { computed, ref } from 'vue'

  defineOptions({
    name: 'ContentCodeGroup',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    // The tabs: { id, label, code, language, title }.
    tabs: {
      type: Array,
      default: () => [],
    },
    // The active tab. Without it the first one, or what the visitor chose in the group.
    modelValue: {
      type: String,
      default: undefined,
    },
    // Groups with the same name show the same choice (npm, yarn, pnpm...) and it is remembered.
    group: String,
    label: {
      type: String,
      default: 'Code',
    },
  })

  const own = ref(undefined)

  const current = computed(() => {
    const wanted = props.modelValue ?? (props.group ? groupSelection(props.group) : own.value)

    return props.tabs.some((tab) => tab.id === wanted) ? wanted : props.tabs[0]?.id
  })

  function select(id) {
    own.value = id

    if (props.group) {
      selectInGroup(props.group, id)
    }

    emit('update:modelValue', id)
  }

  const groupProps = computed(() => ({
    id: props.id,
    class: `code-group ${props.class ?? ''}`.trim(),
  }))
</script>

<template>
  <div v-bind="groupProps">
    <NavigationTabs
      :model-value="current"
      @update:model-value="select"
    >
      <NavigationTabList :label="label">
        <NavigationTab
          v-for="tab in tabs"
          :id="tab.id"
          :key="tab.id"
        >
          {{ tab.label }}
        </NavigationTab>
      </NavigationTabList>
      <NavigationTabPanel
        v-for="tab in tabs"
        :id="tab.id"
        :key="tab.id"
      >
        <ContentCodeBlock
          :code="tab.code"
          :language="tab.language"
          :title="tab.title"
        />
      </NavigationTabPanel>
    </NavigationTabs>
  </div>
</template>
