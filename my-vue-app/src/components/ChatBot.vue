<template>
    <div class="chat-bot">
      <div class="chat-header">
        <h3>Чат с ботом</h3>
        <button @click="$emit('clearContext')">Очистить контекст</button>
      </div>
      <div class="chat-messages">
        <div v-for="(msg, index) in conversation" :key="index" :class="['message', msg.sender]">
          <span>{{ msg.text }}</span>
        </div>
      </div>
      <div class="chat-input">
        <input v-model="userMessage" @keyup.enter="sendMessage" placeholder="Введите сообщение" />
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
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chat-header h3 {
  margin: 0;
  color: #1f2937;
}

.chat-header button {
  padding: 6px 10px;
  border: none;
  background-color: #e11d48;
  color: #ffffff;
  border-radius: 5px;
  cursor: pointer;
}

.chat-messages {
  max-height: 400px;
  overflow-y: auto;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 15px;
}

.message {
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  max-width: 75%;
}

.message.user {
  align-self: flex-end;
  background-color: #007bff;
  color: #ffffff;
}

.message.bot {
  align-self: flex-start;
  background-color: #e5e7eb;
  color: #333333;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: inset 0px 2px 4px rgba(0, 0, 0, 0.05);
}

.chat-input button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>