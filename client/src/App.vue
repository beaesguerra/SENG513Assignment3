<template>
  <div id="app">
    <h1>{{currentUser.nickname}}</h1>
    <ul class="users">
      <li v-for="user in onlineUsers" :key="user._id">
        {{user.nickname}}
      </li>
    </ul>
    <ul class="messages">
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

    this.client.service('users')
      .on('created', user => this.users.push(user));
    this.client.service('users')
      .on('patched', (user) => {
        console.log("PATCHED" );
        console.log(user);
        this.users = this.users.map((originalUser) => {
          // eslint-disable-next-line no-underscore-dangle
          if (originalUser._id === user.id) {
            return { ...originalUser, ...user };
          }
          return originalUser;
        });
      });
    this.users = await this.client.service('users').find({});

    // if no cookie, create users
    // eslint-disable-next-line no-underscore-dangle
    this.currentUserId = (await this.client.service('users').create({}))._id;

    // logged in
    socket.emit('log in', this.currentUser);

    this.client.service('messages')
      .on('created', message => this.messages.push(message));
    this.messages = await this.client.service('messages').find({});
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
    onlineUsers() {
      return this.users.filter(user => user.online === true);
    },
    currentUser() {
      // eslint-disable-next-line no-underscore-dangle
      const foundUser = this.users.find(user => user._id === this.currentUserId);

      return foundUser || { };
    },
  },
  data() {
    return {
      messages: [],
      users: [],
      inputField: '',
      client: null,
      currentUserId: '',
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
