<template>
  <div id="app">
    <h1>{{myMessage}}</h1>
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      myMessage: 'Hi there Bea',

    };
  },
  methods: {
    addTwo: a => a + 2,
  }
};
</script>

<style>
</style>
