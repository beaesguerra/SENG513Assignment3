<template>
  <div id="app">
    <ul>
      <li v-for="message in messages" :key="message._id">
        {{message.from}}
        <br>
        {{message.text}}
      </li>
    </ul>
    <input v-model="inputField" v-on:keyup.enter="send">
    <button v-on:click="send" :disabled='inputIsEmpty'> Send </button>
  </div>
</template>

<script>

import * as io from 'socket.io-client';
import * as feathers from '@feathersjs/feathers';
import * as socketio from '@feathersjs/socketio-client';

export default {
  name: 'App',
  async created() {
    const socket = io('http://localhost:3030');
    this.client = feathers();
    this.client.configure(socketio(socket));
    this.client.service('messages')
      .on('created', message => this.messages.push(message));
    this.messages = await this.client.service('messages').find({});
  },
  computed: {
    inputIsEmpty() {
      return this.inputField.length == 0
    }
  },
  data() {
    return {
      messages: [
      ],
      inputField: '',
      client: null,
    };
  },
  methods: {
    send() {
      if (this.inputField.length > 0) {
        this.client.service('messages').create({
          text: this.inputField,
          from: 'Bea',
        });
        this.inputField = '';
      }
    },
  },
};
</script>

<style>
</style>
