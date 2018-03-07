<template>
  <div id="app">
    <ul>
      <li v-for="message in messages" :key="message">
        {{message}}
      </li>
    </ul>
    <input>
    <button> Send </button>
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      messages: [
        'hi',
        'hello',
        'bye',
      ],

    };
  },
  methods: {
    addTwo: a => a + 2,
  },
};
</script>

<style>
</style>
