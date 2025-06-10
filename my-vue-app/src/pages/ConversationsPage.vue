<template>
    <div class="task-chat-page">
      <!-- Фиксированный индикатор ожидания ответа сверху -->
      <transition name="fade-slide-down">
        <div v-if="isLoading" class="loading-indicator-fixed-top">
          <span class="spinner"></span> Ожидание ответа...
        </div>
      </transition>
      <!-- Информация о задаче или загрузка -->
      <transition name="fade-slide-up">
        <template v-if="task">
          <div class="task-info">
            <h2>{{ task.title }}</h2>
            <p>{{ task.description }}</p>
            <p><strong>Приоритет:</strong> {{ getPriorityString(task.priority) }}</p>
            <p><strong>Дата создания:</strong> {{ formatDate(task.dateCreated) }}</p>
            <p><strong>Дата окончания:</strong> {{ formatDate(task.dateEnd) }}</p>
          </div>
        </template>
        <template v-else>
          <p>Загрузка данных задачи...</p>
        </template>
      </transition>
      <!-- Сообщение об ошибке -->
      <transition name="fade-shake">
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </transition>
      <!-- Чат-бот для задачи -->
      <transition name="fade-slide-up" mode="out-in">
        <div class="chat-container" ref="chatContainer" v-if="task">
          <ChatBot
            :conversation="conversation"
            :isLoading="isLoading"
            @sendMessage="sendMessage"
            @clearContext="clearContext"
          />
        </div>
      </transition>
    </div>
  </template>
  
  <script>
  import ChatBot from '@/components/ChatBot.vue';
  import DataService from '@/service/DataService';
  import { Task } from '@/models/Task';
  import { Conversation } from '@/models/Conversation';
  import { marked } from 'marked'
  
  export default {
    components: { ChatBot },
    props: {
      taskId: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        task: null,
        conversation: [],
        errorMessage: null,
        isLoading: false,
      };
    },
    async created() {
      try {
        const taskData = await DataService.read(`/tasks/${this.taskId}`, item => new Task(item));
        this.task = taskData;

        const conversationData = await DataService.readAll(`/tasks/${this.taskId}/chatBot/conversation`, item => {
          const formattedText = marked(item.text.replace(/\n/g, '  \n'));
          return new Conversation({ ...item, text: formattedText });
        });
        this.conversation = conversationData || [];
        console.log("conversation => " + JSON.stringify(this.conversation, null, 2));
        console.log("conversationData => " + JSON.stringify(conversationData, null, 2));

      } catch (error) {
        console.error('Ошибка загрузки данных для задачи:', error);
      }
    },
    mounted() {
      this.scrollChatToBottom();
    },
    updated() {
      this.scrollChatToBottom();
    },
    methods: {
      getPriorityString(priority) {
        return priority === 1 ? 'Высокий' : priority === 2 ? 'Средний' : 'Низкий';
      },
      formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr;
        return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      async sendMessage(userMessage) {
        this.errorMessage = null;
        this.isLoading = true;
        try {
          this.conversation.push({ sender: 'user', text: userMessage });
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5050/api/tasks/${this.taskId}/chatBot`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify(userMessage)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Произошла ошибка при отправке сообщения.');
          }
          
          const botReply = await response.json();
          const formattedText = marked(botReply.responseMessage.replace(/\n/g, '  \n'));
          this.conversation.push({ sender: 'bot', text: formattedText });
        } catch (error) {
          console.error('Ошибка отправки сообщения:', error);
          this.errorMessage = error.message || 'Произошла ошибка при отправке сообщения.';
        } finally {
          this.isLoading = false;
        }
      },
      scrollChatToBottom() {
        this.$nextTick(() => {
          const container = this.$refs.chatContainer;
          if (container) {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            });
          }
        });
      },
      async clearContext() {
        try {
          await DataService.delete(`/tasks/${this.taskId}/chatBot`);
          this.conversation = [];
          this.$nextTick(() => {
            this.scrollChatToBottom();
          });
        } catch (error) {
          console.error('Ошибка очистки контекста чата:', error);
        }
      },
    },
  };
  </script>
  
  <style>
  .task-chat-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(120deg, #f5f7fa 60%, #c3cfe2 100%);
  padding: 32px 0;
}

.task-info {
  width: 100%;
  max-width: 900px;
  margin-bottom: 28px;
  padding: 28px 32px 20px 32px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(60, 80, 180, 0.08), 0 1.5px 6px rgba(0,0,0,0.04);
  border: 1px solid #e3e9f7;
}

.task-info h2 {
  color: #2d3a4a;
  margin-bottom: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.task-info p {
  color: #3a4a5d;
  margin-bottom: 8px;
  font-size: 1.08rem;
}

.task-info strong {
  color: #255ed6;
}

.error {
  color: #b71c1c;
  background: #ffeaea;
  border-radius: 8px;
  padding: 8px 14px;
  margin-bottom: 16px;
  max-width: 700px;
  width: 100%;
  box-sizing: border-box;
}

.loading-indicator-fixed-top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  color: #255ed6;
  background: #e3e9f7;
  border-radius: 0 0 12px 12px;
  padding: 14px 0;
  margin: 0 auto;
  max-width: 400px;
  width: 90%;
  box-sizing: border-box;
  font-weight: 500;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(60, 80, 180, 0.10);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid #b3c6f7;
  border-top: 3px solid #255ed6;
  border-radius: 50%;
  margin-right: 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}

.chat-container {
  width: 100%;
  max-width: 900px;
  flex-grow: 1;
  background: #f8fafc;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(60, 80, 180, 0.06);
  padding: 24px 18px 18px 18px;
  margin-bottom: 24px;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

@media (max-width: 800px) {
  .task-info, .chat-container {
    max-width: 98vw;
    padding: 16px 6vw;
  }
  .task-chat-page {
    padding: 12px 0;
  }
}

/* Fade + Slide Down (для индикатора загрузки) */
.fade-slide-down-enter-active, .fade-slide-down-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.fade-slide-down-enter-from, .fade-slide-down-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
.fade-slide-down-enter-to, .fade-slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Fade + Slide Up (для task-info и chat-container) */
.fade-slide-up-enter-active, .fade-slide-up-leave-active {
  transition: opacity 0.6s cubic-bezier(.55,0,.1,1), transform 0.6s cubic-bezier(.55,0,.1,1);
}
.fade-slide-up-enter-from, .fade-slide-up-leave-to {
  opacity: 0;
  transform: translateY(40px);
}
.fade-slide-up-enter-to, .fade-slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Fade (для простых fade) */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}

/* Fade + Shake (для ошибок) */
.fade-shake-enter-active {
  animation: fadeInShake 0.7s;
}
.fade-shake-leave-active {
  transition: opacity 0.3s;
  opacity: 0;
}
@keyframes fadeInShake {
  0% { opacity: 0; transform: translateX(-20px);}
  40% { opacity: 1; transform: translateX(8px);}
  60% { transform: translateX(-6px);}
  80% { transform: translateX(4px);}
  100% { opacity: 1; transform: translateX(0);}
}
    </style>