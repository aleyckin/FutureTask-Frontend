<template>
    <div class="chat-bot">
      <div class="chat-header">
        <h3>Чат с ботом</h3>
        <button @click="$emit('clearContext')">Очистить контекст</button>
      </div>
      <div class="chat-messages" ref="chatMessages">
        <div v-for="(msg, index) in conversation" :key="index" :class="['message', msg.sender]">
          <div v-html="msg.text"></div>
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
    mounted() {
      this.scrollToEnd();
    },
    methods: {
      sendMessage() {
        if (this.userMessage.trim()) {
          this.$emit('sendMessage', this.userMessage);
          this.userMessage = '';
          this.scrollToEnd();
        }
      },
      scrollToEnd() {
        this.$nextTick(() => {
          const chatMessages = this.$refs.chatMessages;
          chatMessages.scrollTop = chatMessages.scrollHeight;
        });
      },
    },
  };
  </script>
  
<style>
.chat-bot {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #f0f2f5, #d9e2ec);
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  transition: background-color 0.3s;
}

.chat-header button:hover {
  background-color: #c40039;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
  max-height: calc(100vh - 200px);
}

.message {
  padding: 12px;
  border-radius: 15px;
  margin-bottom: 12px;
  max-width: 75%;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease;
}

.message.user {
  align-self: flex-end;
  background-color: #007bff;
  color: #ffffff;
  text-align: right;
  border-top-right-radius: 0;
  margin-left: auto;
}

.message.bot {
  align-self: flex-start;
  background-color: #e5e7eb;
  color: #333333;
  text-align: left;
  border-top-left-radius: 0;
  margin-right: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-input {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #ffffff;
  border-top: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.05);
}

.chat-input input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.chat-input button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.chat-input button:hover {
  background-color: #0056b3;
}
</style>