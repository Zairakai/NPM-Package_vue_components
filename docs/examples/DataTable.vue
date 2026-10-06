<script setup>
  const columns = [
    { key: 'name', label: 'Name', sortable: true, filter: 'text' },
    { key: 'age', label: 'Age', type: 'number', sortable: true, align: 'end', filter: 'range' },
    { key: 'status', label: 'Status', filter: 'select', options: ['open', 'closed'] },
  ]

  const rows = [
    { id: 1, name: 'Ada', age: 36, status: 'open' },
    { id: 2, name: 'Alan', age: 41, status: 'closed' },
    { id: 3, name: 'Grace', age: 85, status: 'open' },
    { id: 4, name: 'Linus', age: 55, status: 'open' },
  ]
</script>

<template>
  <DataTable
    :columns="columns"
    :rows="rows"
    caption="People"
    searchable
    selectable
    :page-size="3"
  />
</template>
