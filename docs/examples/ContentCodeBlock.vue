<template>
  <ContentCodeBlock
    title="hello.js"
    language="js"
    :code="`const greeting = 'Hello'\nconsole.log(greeting)`"
    line-numbers
    :highlight-lines="[2]"
  />
</template>
