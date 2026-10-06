<script setup>
  const items = [{ label: 'Home', href: '/' }, { label: 'Components', href: '/components/' }, { label: 'Breadcrumb' }]
</script>

<template>
  <NavigationBreadcrumb :items="items" />
</template>
