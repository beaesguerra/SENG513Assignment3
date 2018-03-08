<template>
  <div id="app">
    <h1>{{currentUser.nickname}}</h1>
    <ul class="users">
      <li v-for="user in onlineUsers" :key="user._id">
        {{user.nickname}}
      </li>
    </ul>
    <ul class="messages">
      <li v-for="message in formattedMessages" :key="message._id" :style="{ color: message.from.color }">
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

const COMMANDS = {
  NICKNAME: '/nick ',
  NICKCOLOR: '/nickcolor ',
};

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
        // eslint-disable-next-line no-underscore-dangle
        if (user._id === this.currentUser._id) {
          this.currentUser = user;
        }
        this.users = this.users.map((originalUser) => {
          // eslint-disable-next-line no-underscore-dangle
          if (originalUser._id === user._id) {
            return { ...originalUser, ...user };
          }
          return originalUser;
        });
      });
    this.users = await this.client.service('users').find({});

    // if no cookie, create users
    // eslint-disable-next-line no-underscore-dangle
    this.currentUser = (await this.client.service('users').create({}));

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
        formattedMessage.from = this.users.find(user => user._id === message.from);
        formattedMessage.timestamp = moment(message.createdAt).format('MMM D h:mm a');
        return formattedMessage;
      });
    },
    onlineUsers() {
      return this.users.filter(user => user.online === true);
    },
  },
  data() {
    return {
      messages: [],
      users: [],
      inputField: '',
      client: null,
      currentUser: {},
    };
  },
  methods: {
    isValidNickname(nickname) {
      const sameNickname = this.users.filter(user => user.nickname === nickname);
      return sameNickname.length === 0;
    },
    send() {
      if (this.inputField.length > 0) {
        if (this.inputField.startsWith(COMMANDS.NICKNAME)) {
          const nickname = this.inputField.substring(COMMANDS.NICKNAME.length);
          if (this.isValidNickname(nickname)) {
            // eslint-disable-next-line no-underscore-dangle
            this.client.service('users').patch(this.currentUser._id, { nickname });
          } else {
            // eslint-disable-next-line no-alert
            alert(`${nickname} already exists. Please choose another nickname.`);
          }
        } else if (this.inputField.startsWith(COMMANDS.NICKCOLOR)) { 
          const color = `#${this.inputField.substring(COMMANDS.NICKCOLOR.length)}`;
          // TODO validate
          this.client.service('users').patch(this.currentUser._id, { color });
        }else {
          this.client.service('messages').create({
            text: this.inputField,
            from: this.currentUser._id,
          });
        }
        this.inputField = '';
      }
    },
  },
};
</script>

<style>
</style>
