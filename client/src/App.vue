<template>
  <div id="app">
    <h1>{{this.currentUser.nickname}}</h1>
    <ul>
      <li v-for="message in formattedMessages" :key="message._id">
        <b>{{message.from.nickname}}</b>
        {{message.timestamp}}
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
import * as moment from 'moment';

export default {
  name: 'App',
  async created() {
    const socket = io('http://localhost:3030');
    this.client = feathers();
    this.client.configure(socketio(socket));
    this.client.service('messages')
      .on('created', message => this.messages.push(message));
    this.messages = await this.client.service('messages').find({});

    this.client.service('users')
      .on('created', user => this.users.push(user));
    this.users = await this.client.service('users').find({});

    // if no cookie, create users
    this.currentUser = await this.client.service('users').create({
    });
  },
  computed: {
    inputIsEmpty() {
      return this.inputField.length === 0;
    },
    formattedMessages() {
      return this.messages.map((message) => {
        const formattedMessage = { ...message };
        formattedMessage.timestamp = moment(message.createdAt).format('MMM D h:mm a');
        return formattedMessage;
      });
    },
  },
  data() {
    return {
      messages: [],
      users: [],
      inputField: '',
      client: null,
      currentUser: '',
    };
  },
  methods: {
    send() {
      if (this.inputField.length > 0) {
        this.client.service('messages').create({
          text: this.inputField,
          from: this.currentUser,
        });
        this.inputField = '';
      }
    },
  },
};
</script>

<style>
</style>
