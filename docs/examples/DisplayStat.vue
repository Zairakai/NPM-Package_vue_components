<template>
  <DisplayStat
    label="Sales"
    value="1 280"
    :change="12.5"
  />
  <DisplayStat
    label="Errors"
    value="14"
    :change="3"
    :up-is-good="false"
  />
</template>
