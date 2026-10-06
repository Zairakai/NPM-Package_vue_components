<template>
  <OverlayDropdown label="Actions">
    <template #trigger="{ attrs }">
      <button
        type="button"
        v-bind="attrs"
      >
        Actions
      </button>
    </template>
    <OverlayDropdownItem>Edit</OverlayDropdownItem>
    <OverlayDropdownItem>Duplicate</OverlayDropdownItem>
    <OverlayDropdownItem disabled>Delete</OverlayDropdownItem>
  </OverlayDropdown>
</template>
