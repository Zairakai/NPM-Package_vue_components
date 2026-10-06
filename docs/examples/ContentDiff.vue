<script setup>
  const diff = `@@ -1,3 +1,3 @@
 keep
-old line
+new line
 end`
</script>

<template>
  <ContentDiff
    :diff="diff"
    title="a.txt"
  />
</template>
