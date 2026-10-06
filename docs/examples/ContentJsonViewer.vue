<template>
  <ContentJsonViewer
    :value="{ name: 'Ada', langs: ['en', 'fr'], address: { city: 'London' } }"
    :expanded="2"
  />
</template>
