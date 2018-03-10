<template>
  <div id="app">
    <div id="header">
      <!-- <h1>{{currentUser.nickname}}</h1> -->
    </div>
    <div id="usersArea">
      <h1>messenger</h1>
    <h3>Users ({{ onlineUsers.length }})</h3>
    <ul class="users">
      <li v-for="user in users" :key="user._id" :style="{
        color: user.online ? user.color : '#696969',
        fontWeight: user._id === currentUser._id ? 'bold' : undefined
        }">
        {{user.nickname}} {{ user._id === currentUser._id ? ' (you)' : '' }}
      </li>
    </ul>
    </div>
    <div id="messenger">
      <div id="spacer"></div>
      <div id="messagesArea">
      <ul class="messages">
        <li v-for="message in formattedMessages" :key="message._id"
        :style="{
          backgroundColor: message.from.color,
          alignSelf: message.from._id === currentUser._id ? 'flex-end' : 'flex-start'
        }">
          <b>{{message.from.nickname}}</b>
          <span class="timestamp">{{message.timestamp}}</span>
          <br>
            {{message.text}}
        </li>
      </ul>
      </div>
      <div id="inputArea">
    <textarea v-model="inputField" v-on:keyup.enter="send" placeholder="Message"/>
    <button v-on:click="send" :disabled='inputIsEmpty' id="sendButton">
      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
    <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
</svg>
       </button>
    </div>
    </div>
  </div>
</template>

<script>
import * as io from 'socket.io-client';
import * as feathers from '@feathersjs/feathers';
import * as socketio from '@feathersjs/socketio-client';
import * as moment from 'moment';
import Cookies from 'js-cookie';

const COMMANDS = {
  NICKNAME: '/nick ',
  NICKCOLOR: '/nickcolor ',
};

const COOKIE_KEY = 'messenger_user_id';

export default {
  name: 'App',
  async created() {
    const socket = io('http://localhost:3030');
    this.client = feathers();
    this.client.configure(socketio(socket));

    this.client.service('users').on('created', user => this.users.push(user));
    this.client.service('users').on('patched', (user) => {
      if (user._id === this.currentUser._id) {
        this.currentUser = user;
      }
      this.users = this.users.map((originalUser) => {
        if (originalUser._id === user._id) {
          return { ...originalUser, ...user };
        }
        return originalUser;
      });
    });
    this.users = await this.client.service('users').find({});

    const userId = Cookies.get(COOKIE_KEY);
    if (userId) {
      const results = this.users.filter(user => user._id === userId);
      if (results.length > 0) {
        this.currentUser = results[0];
      }
    } else {
      this.currentUser = await this.client.service('users').create({});
      Cookies.set(COOKIE_KEY, this.currentUser._id);
    }

    // logged in
    socket.emit('log in', this.currentUser);

    this.client
      .service('messages')
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
        formattedMessage.from = this.users.find(
          user => user._id === message.from,
        );
        formattedMessage.timestamp = moment(message.createdAt).format(
          'MMM D h:mm a',
        );
        return formattedMessage;
      }).reverse();
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
      scrollToBottom: true,
    };
  },
  updated() {
    this.scrollMessengerToBottom();
    this.scrollToBottom = false;
  },
  methods: {
    isValidNickname(nickname) {
      const sameNickname = this.users.filter(
        user => user.nickname === nickname,
      );
      return sameNickname.length === 0;
    },
    isValidColor(colorToCheck) {
      return colorToCheck.length === 6 && !isNaN(parseInt(colorToCheck, 16));
    },
    scrollMessengerToBottom() {
      // scroll to bottom
      const scroll = document.getElementById('messagesArea');
      scroll.scrollTop = scroll.scrollHeight;
      scroll.animate({ scrollTop: scroll.scrollHeight });
    },
    send() {
      if (this.inputField.length > 0) {
        if (this.inputField.startsWith(COMMANDS.NICKNAME)) {
          const nickname = this.inputField.substring(COMMANDS.NICKNAME.length);
          if (this.isValidNickname(nickname)) {
            this.client
              .service('users')
              .patch(this.currentUser._id, { nickname });
          } else {
            // eslint-disable-next-line no-alert
            alert(
              `${nickname} already exists. Please choose another nickname.`,
            );
          }
        } else if (this.inputField.startsWith(COMMANDS.NICKCOLOR)) {
          const colorValue = this.inputField.substring(
            COMMANDS.NICKCOLOR.length,
          ).trim();
          if (this.isValidColor(colorValue)) {
            this.client.service('users').patch(this.currentUser._id, { color: `#${colorValue}` });
          } else {
            // eslint-disable-next-line no-alert
            alert(`${colorValue} is not a valid color. Please try again in the format rrggbb.`);
          }
        } else {
          this.client.service('messages').create({
            text: this.inputField,
            from: this.currentUser._id,
          });
        }
        this.inputField = '';
        this.scrollToBottom = true;
      }
    },
  },
};
</script>

<style>
body {
  margin: 0px;
  padding: 0px;
}
#app {
  background-color: #f7f7f7;
  display: flex;
  height: 100vh;
  font-family: 'Arima Madurai', cursive;

  /* justify-content: center; */
  /* flex-direction: column; */
}
.messages {
  color: black;
  padding: 0px;
  display: flex;
  flex-direction: column-reverse;
  /* overflow-y: auto; */
}

.messages li {
  list-style: none;
  border-radius: 10px;
  padding: 10px;
  margin: 10px;
  max-width: 50%;
  word-wrap: break-word;
}

.messages li p {
  padding: 0px;
  margin: 0px;
}
#messenger {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

#messagesArea {
  overflow-y: auto;
}

#inputArea {
  margin: 0px;
  padding: 10px;
  height: 9%;
  display: flex;
  flex: 0 0 auto;
  background-color: white;
}

#inputArea textarea {
  height: 100%;
  width: 100%;
  padding: 0px;
  border: none;
      overflow: auto;
    outline: none;

    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;
    resize: none;
}

#inputArea button {
  height: 100%;
  background-color: white;
  padding: 10px;
  margin: 0px;
  border: none;
  box-sizing: none;
}
#spacer {
  height: 0;
  flex-grow: 1;
}
#usersArea {
  padding: 10px;
  background-color: #a8a8a8;
  flex: 1 0 auto;
  width: 13%;
   overflow-y: auto;
}

.users {
  margin: 0px;
}
.users li {
  list-style: none;
}

#usersArea ul {
  padding: 0px;
}

h3 {
  color: white;
  /* padding: 5px; */
  margin: 0px;
  /* border-bottom: 1px solid white; */
}

.timestamp {
  font-size: 12px;
}

#sendButton:disabled {
  fill: gray;
}

#sendButton:disabled {
  fill: lightgray;
}

h1 {
  font-family: 'Dancing Script', cursive;
  color: white;
  text-align: center;

}
</style>
