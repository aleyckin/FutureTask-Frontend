<template>
    <div class="chat-bot">
      <div class="chat-header">
        <h3>Чат с ботом</h3>
        <button @click="$emit('clearContext')">Очистить контекст</button>
      </div>
      <div class="chat-messages">
        <div 
          v-for="(msg, index) in conversation" 
          :key="index" 
          :class="['message', msg.sender]"
        >
          <span>{{ msg.text }}</span>
        </div>
      </div>
      <div class="chat-input">
        <input 
          v-model="userMessage" 
          @keyup.enter="sendMessage" 
          placeholder="Введите сообщение"
        />
        <button @click="sendMessage">Отправить</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
        conversation: {
            type: Array,
            required: true
        }
    },
    data() {
      return {
        userMessage: '',
      };
    },
    methods: {
      sendMessage() {
        if (this.userMessage.trim()) {
          this.$emit('sendMessage', this.userMessage);
          this.userMessage = '';
        }
      },
    },
  };
  </script>
  
  <style>
  .chat-bot {
    width: 70%;
    padding: 10px;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .chat-messages {
    max-height: 400px;
    overflow-y: auto;
    margin: 10px 0;
    padding: 10px;
    background: #f7f7f7;
  }
  .message {
    margin-bottom: 10px;
  }
  .message.user {
    text-align: right;
    color: #007bff;
  }
  .message.bot {
    text-align: left;
    color: #333;
  }
  .chat-input {
    display: flex;
  }
  .chat-input input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
  }
  .chat-input button {
    padding: 10px;
    background: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }
  </style>
  