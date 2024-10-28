<template>
    <div class="task-chat-page">
      <!-- Информация о задаче -->
      <div v-if="task" class="task-info">
        <h2>{{ task.title }}</h2>
        <p>{{ task.description }}</p>
        <p><strong>Приоритет:</strong> {{ getPriorityString(task.priority) }}</p>
        <p><strong>Дата создания:</strong> {{ task.dateCreated }}</p>
        <p><strong>Дата окончания:</strong> {{ task.dateEnd }}</p>
      </div>
      <p v-else>Загрузка данных задачи...</p>
       <!-- Сообщение об ошибке -->
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
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
            const errorData = await response.json();
            throw new Error(errorData.message || 'Произошла ошибка при отправке сообщения.');
          }
          
          const botReply = await response.json();
          const formattedText = marked(botReply.responseMessage.replace(/\n/g, '  \n'));
           
          this.conversation.push({ sender: 'bot', text: formattedText });
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
    flex-direction: column;
    height: 100vh;
  }

  
  .task-info {
    padding: 15px;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .task-info h2 {
    color: #1f2937;
    margin-bottom: 10px;
  }
  
  .chat-container {
    flex-grow: 1;
    overflow-y: auto;
  }
    </style>