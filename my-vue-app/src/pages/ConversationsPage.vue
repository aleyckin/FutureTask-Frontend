<template>
    <div class="task-chat-page">
      <!-- Информация о задаче -->
      <div v-if="task" class="task-info">
        <h2>{{ task.title }}</h2>
        <p>{{ task.description }}</p>
        <p>Приоритет: {{ getPriorityString(task.priority) }}</p>
        <p>Дата создания: {{ task.dateCreated }}</p>
        <p>Дата окончания: {{ task.dateEnd }}</p>
      </div>
      <p v-else>Загрузка данных задачи...</p>
  
      <!-- Чат-бот для задачи -->
      <div class="chat-container">
        <ChatBot
          v-if="task"
          :conversation="conversation"
          @sendMessage="sendMessage"
          @clearContext="clearContext"
        />
      </div>
    </div>
  </template>
  
  <script>
  import ChatBot from '@/components/ChatBot.vue';
  import DataService from '@/service/DataService';
  import { Task } from '@/models/Task';
  
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
      };
    },
    async created() {
      try {
        const taskData = await DataService.read(`/tasks/${this.taskId}`, item => new Task(item));
        this.task = taskData;

        const conversationData = await DataService.readString(`/tasks/${this.taskId}/chatBot/conversation`);
        this.conversation = (conversationData.responseMessage?.$values || []).map(text => ({
            sender: 'bot',
            text,
        }));
        console.log("conversation => " + JSON.stringify(this.conversation, null, 2));
        console.log("conversationData => " + JSON.stringify(conversationData, null, 2));

      } catch (error) {
        console.error('Ошибка загрузки данных для задачи:', error);
      }
    },
    methods: {
      getPriorityString(priority) {
        return priority === 1 ? 'Высокий' : priority === 2 ? 'Средний' : 'Низкий';
      },
      async sendMessage(userMessage) {
        try {
          this.conversation.push({ sender: 'user', text: userMessage });
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/tasks/${this.taskId}/chatBot`, {
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
            throw new Error('Network response was not ok');
          }

          const botReply = await response.json();
           
          this.conversation.push({ sender: 'bot', text: botReply.responseMessage });
        } catch (error) {
          console.error('Ошибка отправки сообщения:', error);
        }
      },
      async clearContext() {
        try {
          await DataService.delete(`/tasks/${this.taskId}/chatBot`);
          this.conversation = [];
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
        flex-direction: row;
        gap: 20px;
    }

    .task-info {
        flex: 1;
    }

    .chat-container {
        flex: 2;
        display: flex;
        flex-direction: column;
    }
  </style>
  