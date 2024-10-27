<template>
    <div class="container mt-5" v-if="project">
      <h1 class="text-center mb-4">Проект: {{ project.name }}</h1>
      <button class="btn btn-success mb-4" @click="showAddColumnModal">Добавить колонку</button>

    <!-- Переключатель режима просмотра задач -->
    <div class="form-group">
      <label>
        <input type="checkbox" v-model="showAllTasks" @change="loadColumns">
        Показать все задачи
      </label>
    </div>

    <div class="row">
      <div class="col-md-4" v-for="column in columns" :key="column.id" @drop="handleDrop($event, column.id)" @dragover.prevent>
        <div class="card mb-4 shadow-sm">
          <div class="card-body">
            <h5 class="card-title d-flex justify-content-between align-items-center">
              {{ column.title }}
              <div>
                <button class="btn btn-outline-secondary btn-sm mr-2" @click="showEditColumnModal(column)">✏️</button>
                <button class="btn btn-outline-danger btn-sm" @click="deleteColumn(column.id)">🗑️</button>
              </div>
            </h5>
            <div v-for="task in column.tasks" :key="task.id" class="task border-top pt-2" draggable @dragstart="handleDragStart($event, task)" :style="getTaskStyle(getPriorityValueString(task.priority))">
              <h4>{{ task.title }}</h4>
              <h5>Описание: {{ task.description }}</h5>
              <p>Приоритетность: {{ getPriorityValueString(task.priority) }}</p>
              <p>Дата создания: {{ task.dateCreated }}</p>
              <p>Дата окончания: {{ task.dateEnd }}</p>
              <button class="btn btn-outline-warning btn-sm" @click="showEditTaskModal(task, column.id)">✏️ Редактировать</button>
              <button class="btn btn-outline-danger btn-sm" @click="deleteTask(task.id)">Удалить</button>
              <button 
                  class="btn btn-outline-primary btn-sm" 
                  @click="goToChatPage(task.id)">
                  💬 Перейти к чату
              </button>
            </div>
            <button class="btn btn-light btn-block mt-3" @click="showAddTaskModal(column.id)">+ Добавить задачу</button>
          </div>
        </div>
      </div>
    </div>
  
      <!-- Модальное окно для добавления колонки -->
        <transition name="modal-fade">
            <div v-if="isColumnModalVisible" class="modal-backdrop" @click="closeColumnModal">
                <div class="modal fade show d-block">
                <div class="modal-dialog modal-dialog-centered">
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
            </div>
        </transition>

        <!-- Модальное окно для редактирования колонки -->
        <transition name="modal-fade">
            <div v-if="isEditColumnModalVisible" class="modal-backdrop" @click="closeEditColumnModal">
                <div class="modal fade show d-block">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Редактировать колонку</h5>
                        <button type="button" class="close" @click="closeEditColumnModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <input type="text" v-model="editedColumnName" class="form-control" placeholder="Новое название колонки">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeEditColumnModal">Закрыть</button>
                        <button type="button" class="btn btn-primary" @click="editColumn">Сохранить</button>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </transition>
  
      <!-- Модальное окно для добавления задачи -->
      <transition name="modal-fade">
        <div v-if="isTaskModalVisible" class="modal-backdrop" @click="closeTaskModal">
            <div class="modal fade show d-block">
            <div class="modal-dialog modal-dialog-centered">
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
                    <select v-model="selectedUserId" class="form-control mb-2">
                    <option value="" disabled selected>Выберите пользователя</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">{{ user.email }}</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeTaskModal">Закрыть</button>
                    <button @click="addTask(currentColumnId)">Сохранить</button>
                </div>
                </div>
            </div>
            </div>
        </div>
      </transition>


      <!-- Модальное окно для редактирования задачи -->
      <transition name="modal-fade">
        <div v-if="isEditTaskModalVisible" class="modal-backdrop" @click="closeEditTaskModal">
            <div class="modal fade show d-block">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                        <h5 class="modal-title">Редактировать задачу</h5>
                        <button type="button" class="close" @click="closeEditTaskModal">&times;</button>
                        </div>
                        <div class="modal-body">
                        <input type="text" v-model="editedTaskName" class="form-control mb-2" placeholder="Название задачи">
                        <textarea v-model="editedTaskDescription" class="form-control mb-2" placeholder="Описание задачи"></textarea>
                        <select v-model="editedTaskPriority" class="form-control mb-2">
                            <option value="" disabled selected>Выберите приоритет</option>
                            <option v-for="priority in priorities" :key="priority" :value="priority">{{ priority }}</option>
                        </select>
                        <input type="date" v-model="editedTaskDateEnd" class="form-control mb-2" placeholder="Дата окончания">
                        <select v-model="selectedEditUserId" class="form-control mb-2">
                            <option value="" disabled selected>Выберите пользователя</option>
                            <option v-for="user in users" :key="user.id" :value="user.id">{{ user.email }}</option>
                        </select>
                        </div>
                        <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeEditTaskModal">Закрыть</button>
                        <button type="button" class="btn btn-primary" @click="editTask(currentColumnId)">Сохранить</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </transition>
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
        isEditTaskModalVisible: false,
        editedTaskName: '',
        editedTaskDescription: '',
        editedTaskPriority: '',
        editedTaskDateEnd: '',
        selectedEditUserId: null,
        currentTaskId: null,
        editedColumnName: '',
        isColumnModalVisible: false,
        isEditColumnModalVisible: false,
        currentColumnIdForEdit: null,
        currentColumnId: null,
        priorities: ['Low', 'Medium', 'High'],
        users: [],
        selectedUserId: null,
        showAllTasks: false,
        isTaskModalVisible: false,
        currentTaskIdForEdit: null
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
                const url = this.showAllTasks 
                ? `/tasks/allTasksInColumn/${columnId}` 
                : `/tasks/userTasksInColumn/${columnId}`;
                return await DataService.readAll(url, task => task);
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
      showEditColumnModal(column) {
        this.editedColumnName = column.title;
        this.currentColumnIdForEdit = column.id;
        this.isEditColumnModalVisible = true;
      },
      closeEditColumnModal() {
        this.isEditColumnModalVisible = false;
        this.editedColumnName = '';
      },
      async editColumn() {
        try {
            const columnDtoForUpdate = { title: this.editedColumnName };
            await DataService.update(`/columns/${this.currentColumnIdForEdit}`, columnDtoForUpdate);
            this.loadColumns();
            this.closeEditColumnModal();
        } catch (error) {
            console.error('Error updating column:', error);
        }
      },
      showAddTaskModal(columnId) {
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
          console.log("taskDtoForUpdate => " + JSON.stringify(taskDtoForCreate, null, 2));
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
            case '0':
                return 0;
            case '1':
                return 1;
            case '2':
                return 2;
            default:
                return 0;
        }
      },
      getPriorityValueString(priority) {
        switch (priority) {
            case 0:
                return 'Low';
            case 1:
                return 'Medium';
            case 2:
                return 'High';
            default:
                return 'Low';
        }
      },
      getTaskStyle(priority) {
        switch (priority) {
            case 'High':
                return { background: 'linear-gradient(to right, #ff7e5f, #feb47b)' };
            case 'Medium':
                return { background: 'linear-gradient(to right, #fbc2eb, #a6c1ee)' };
            case 'Low':
                return { background: 'linear-gradient(to right, #d4fc79, #96e6a1)' };
            default:
                return {};
        }
      },
      async deleteTask(taskId) {
        try {
            const projectId = this.$route.params.projectId;
            await DataService.delete(`/tasks/${taskId}/${projectId}`);
            this.loadColumns();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
      },
      showEditTaskModal(task, columnId) {
        this.editedTaskName = task.title;
        this.editedTaskDescription = task.description;
        this.editedTaskPriority = this.getPriorityValueString(task.priority);
        this.editedTaskDateEnd = task.dateEnd;
        this.selectedEditUserId = task.userId;
        this.currentTaskId = task.id;
        this.isEditTaskModalVisible = true;
        this.currentColumnId = columnId;
      },
      closeEditTaskModal() {
        this.isEditTaskModalVisible = false;
        this.editedTaskName = '';
        this.editedTaskDescription = '';
        this.editedTaskPriority = '';
        this.editedTaskDateEnd = '';
        this.selectedEditUserId = null;
      },
      async editTask(columnId) {
        try {
        const taskDtoForUpdate = {
            title: this.editedTaskName,
            description: this.editedTaskDescription,
            priority: this.getPriorityValue(this.editedTaskPriority),
            dateEnd: this.editedTaskDateEnd,
            userId: this.selectedEditUserId,
            columnId: columnId,
        };
        console.log("taskDtoForUpdate => " + JSON.stringify(taskDtoForUpdate, null, 2));
        await DataService.update(`/tasks/${this.currentTaskId}`, taskDtoForUpdate);
        this.loadColumns();
        this.closeEditTaskModal();
        } catch (error) {
        console.error('Ошибка редактирования задачи:', error);
        }
      },
      handleDragStart(event, task) {
        event.dataTransfer.setData('taskId', task.id);
        event.dataTransfer.setData('title', task.title);
        event.dataTransfer.setData('description', task.description);
        event.dataTransfer.setData('priority', task.priority);
        event.dataTransfer.setData('dateEnd', task.dateEnd);
        event.dataTransfer.setData('userId', task.userId);
      },
      async handleDrop(event, newColumnId) {
        const taskId = event.dataTransfer.getData('taskId');
        const title = event.dataTransfer.getData('title');
        const description = event.dataTransfer.getData('description');
        const priority = event.dataTransfer.getData('priority');
        const dateEnd = event.dataTransfer.getData('dateEnd');
        const userId = event.dataTransfer.getData('userId');
        
        const currentColumn = this.columns.find(column => 
        column.tasks.some(task => task.id === taskId)
        );
        
        if (currentColumn && currentColumn.id === newColumnId) return;

        const taskDtoForUpdate = 
        { 
            columnId: newColumnId,
            title: title,
            description: description,
            priority: this.getPriorityValue(priority),
            dateEnd: dateEnd,
            userId: userId,
         };
        console.log("taskId => " + JSON.stringify(taskId, null, 2));
        console.log("taskDtoForUpdate => " + JSON.stringify(taskDtoForUpdate, null, 2));
        try {
            await DataService.update(`/tasks/${taskId}`, taskDtoForUpdate);
            this.loadColumns();
        } catch (error) {
        console.error('Ошибка при перемещении задачи:', error);
        }
      },
      goToChatPage(taskId) {
        this.$router.push({ name: 'TaskChatPage', params: { taskId } });
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .card {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
  }
  
  .card-body {
    padding: 15px;
  }
  
  .card-title {
    font-size: 18px;
    font-weight: bold;
  }
  
  .btn {
    border-radius: 20px;
  }
  
  .modal-content {
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    opacity: 1 !important;
  }

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1040;
  }
  
  .close {
    font-size: 1.2rem;
    color: #333;
    opacity: 1;
  }
  
  .modal-header,
  .modal-footer {
    border: none;
  }

  .modal-header .close {
    display: none;
  }
  
  .modal-header {
    background-color: #007bff;
    color: #fff;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  .modal-footer {
    display: flex;
    justify-content: space-between;
  }
  
  .modal-title {
    font-weight: bold;
  }

  .modal-fade-enter-active, .modal-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .modal-fade-enter, .modal-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  .modal-fade-enter {
    opacity: 0;
    transform: translateY(-10px);
  }

  .modal-fade-enter-to {
    opacity: 1;
    transform: translateY(0);
  }

  .tasks {
    margin-top: 10px;
  }

  .task {
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 10px;
  }

  </style>
  