<template>
    <div class="container mt-5" v-if="project">
      <h1 class="text-center mb-4">Проект: {{ project.name }}</h1>
      <button class="btn btn-primary mb-3" @click="showAddColumnModal">Добавить колонку</button>
      <div class="row">
        <div class="col-md-4" v-for="column in columns" :key="column.id">
          <div class="card mb-4">
            <div class="card-body">
              <h5 class="card-title d-flex justify-content-between">
                {{ column.title }}
                <button class="btn btn-danger btn-sm" @click="deleteColumn(column.id)">Удалить</button>
              </h5>
              <div v-for="task in column.tasks" :key="task.id" class="task">
                <p>{{ task.title }}</p>
              </div>
              <button class="btn btn-secondary" @click="showAddTaskModal(column.id)">Добавить задачу</button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Модальное окно для добавления колонки -->
      <div v-if="isColumnModalVisible" class="modal fade show" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Добавить колонку</h5>
              <button type="button" class="close" @click="closeColumnModal">&times;</button>
            </div>
            <div class="modal-body">
              <input type="text" v-model="newColumnName" class="form-control" placeholder="Название колонки">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeColumnModal">Закрыть</button>
              <button type="button" class="btn btn-primary" @click="addColumn">Сохранить</button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Модальное окно для добавления задачи -->
        <div v-if="isTaskModalVisible" class="modal fade show" style="display: block;">
            <div class="modal-dialog">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Добавить задачу</h5>
                    <button type="button" class="close" @click="closeTaskModal">&times;</button>
                </div>
                <div class="modal-body">
                    <input type="text" v-model="newTaskName" class="form-control mb-2" placeholder="Название задачи">
                    <textarea v-model="newTaskDescription" class="form-control mb-2" placeholder="Описание задачи"></textarea>
                    <select v-model="newTaskPriority" class="form-control mb-2">
                    <option value="" disabled selected>Выберите приоритет</option>
                    <option v-for="priority in priorities" :key="priority" :value="priority">{{ priority }}</option>
                    </select>
                    <input type="date" v-model="newTaskDateEnd" class="form-control mb-2" placeholder="Дата окончания">

                    <!-- Добавлен выбор пользователя -->
                    <select v-model="selectedUserId" class="form-control mb-2">
                    <option value="" disabled selected>Выберите пользователя</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">{{ user.email }}</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeTaskModal">Закрыть</button>
                    <button type="button" class="btn btn-primary" @click="addTask(currentColumnId)">Сохранить</button>
                </div>
                </div>
            </div>
        </div>
    </div>
  </template>
  
  <script>

  import { Column } from '@/models/Column'
  import DataService from '../service/DataService';
  import { Project } from '@/models/Project';
  import { UsersOnProject } from '@/models/UsersOnProject';
  
  export default {
    props: ['projectId'],
    data() {
      return {
        project: null,
        columns: [],
        newColumnName: '',
        newTaskName: '',
        newTaskDescription: '',
        newTaskPriority: '',
        newTaskDateEnd: '',
        isColumnModalVisible: false,
        isTaskModalVisible: false,
        currentColumnId: null,
        priorities: ['Low', 'Medium', 'High'],
        users: [],
        selectedUserId: null,
      };
    },
    mounted() {
      this.loadProject();
      this.loadColumns();
      this.loadUsers();
    },
    methods: {
      async loadProject() {
        try {
          const projectId = this.$route.params.projectId;
          const project = await DataService.read(`/projects/${projectId}`, item => new Project(item));
          this.project = project;
        } catch (error) {
          console.error('Error loading project:', error);
        }
      },
      async loadColumns() {
        try {
            const projectId = this.$route.params.projectId;
            const response = await DataService.readAll(`/columns/forProject/${projectId}`, item => new Column(item));
            
            const columnPromises = response.map(async item => {
            const column = new Column(item);

            column.tasks = await this.loadTasks(column.id);
            return column;
            });

            this.columns = await Promise.all(columnPromises);
            
        } catch (error) {
            console.error('Error loading columns:', error);
        }
      },
      async loadTasks(columnId) {
        try {
          return await DataService.readAll(`/tasks/userTasksInColumn/${columnId}`, task => task);
        } catch (error) {
          console.error(`Error loading tasks for column ${columnId}:`, error);
          return [];
        }
      },
      async loadUsers() {
        try {
            const projectId = this.$route.params.projectId;
            this.users = await DataService.readAll(`/projects/projectUsers/${projectId}/users`, item => new UsersOnProject(item));
        } catch (error) {
            console.error('Error loading users:', error);
        }
      },
      showAddColumnModal() {
        this.isColumnModalVisible = true;
      },
      closeColumnModal() {
        this.isColumnModalVisible = false;
        this.newColumnName = '';
      },
      async addColumn() {
        try {
          const projectId = this.$route.params.projectId;
          const columnDtoForCreate = { title: this.newColumnName, projectId: projectId };
          await DataService.create(`/columns/${projectId}`, columnDtoForCreate);
          this.loadColumns();
          this.closeColumnModal();
        } catch (error) {
          console.error('Error adding column:', error);
        }
      },
      async deleteColumn(columnId) {
        try {
          const projectId = this.$route.params.projectId;
          await DataService.delete(`/columns/${projectId}/${columnId}`);
          this.loadColumns();
        } catch (error) {
          console.error('Error deleting column:', error);
        }
      },
      showAddTaskModal(columnId) {
        console.log("users => " + JSON.stringify(this.users, null, 2));
        this.currentColumnId = columnId;
        this.isTaskModalVisible = true;
      },
      closeTaskModal() {
        this.isTaskModalVisible = false;
        this.newTaskName = '';
        this.newTaskDescription = '';
        this.newTaskPriority = '';
        this.newTaskDateEnd = '';
      },
      async addTask(columnId) {
        try {
          const projectId = this.$route.params.projectId;
          const taskDtoForCreate = {
            title: this.newTaskName,
            description: this.newTaskDescription,
            priority: this.getPriorityValue(this.newTaskPriority),
            dateEnd: this.newTaskDateEnd,
            columnId: columnId,
            userId: this.selectedUserId,
          };
          console.log("taskDtoForCreate => " + JSON.stringify(taskDtoForCreate, null, 2));
          await DataService.create(`/tasks/${projectId}`, taskDtoForCreate);
          this.loadColumns();
          this.closeTaskModal();
        } catch (error) {
          console.error('Error adding task:', error);
        }
      },
      getPriorityValue(priority) {
        switch (priority) {
            case 'Low':
                return 0;
            case 'Medium':
                return 1;
            case 'High':
                return 2;
            default:
                return 0;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Стили для страницы */
  </style>
  