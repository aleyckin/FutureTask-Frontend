<template>
    <div class="container mt-5" v-if="project">
      <!-- Компонент уведомлений -->
      <Notification ref="notification" :message="notificationMessage" :type="notificationType" />
      <h1 class="text-center mb-4">Проект: {{ project.name }}</h1>
      <div class="text-center mb-3 small text-muted">
        Ваша роль: <span class="badge bg-primary">{{ roleLabel }}</span>
      </div>
      <!-- Кнопка скачивания отчёта -->
      <div class="text-center mb-4" v-if="canManageTasks">
        <button 
          class="btn btn-outline-primary"
          @click="downloadProjectReport"
        >
          📄 Скачать отчёт по проекту
        </button>
      </div>
      <div class="d-flex justify-content-end mb-4" v-if="canManageTasks">
        <button class="btn btn-add-column"
          @click="showAddColumnModal"
        >
          Добавить колонку
        </button>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Переключатель режима просмотра задач -->
    <div class="form-group custom-switch mb-4">
      <label>
        <input
          type="checkbox"
          v-model="showAllTasks"
          @change="onShowAllTasksChange"
          :disabled="isTasksLoading"
        >
        <span class="slider"></span>
        <span class="switch-label">
          Показать задачи всех пользователей
          <span v-if="isTasksLoading" class="spinner-switch"></span>
        </span>
      </label>
    </div>

    <!-- Анимированные колонки -->
    <transition-group name="column-list" tag="div" class="row">
      <div 
        class="col-md-4" 
        v-for="column in columns" 
        :key="column.id" 
        @drop="handleDrop($event, column.id)" 
        @dragover.prevent
      >
        <div class="card mb-4 shadow-sm">
          <div class="card-body">
            <h5 class="card-title d-flex justify-content-between align-items-center">
              {{ column.title }}
              <div v-if="canManageTasks" class="column-actions">
                <button
                  class="btn btn-task-action btn-edit"
                  @click="showEditColumnModal(column)"
                  title="Редактировать колонку"
                >
                  ✏️
                </button>
                <button
                  class="btn btn-task-action btn-delete"
                  @click="deleteColumn(column.id)"
                  title="Удалить колонку"
                >
                  🗑️
                </button>
              </div>
            </h5>
            <!-- Анимированные задачи -->
            <transition-group name="task-list" tag="div">
              <div
                v-for="task in column.tasks"
                :key="task.id"
                class="task border-top pt-2"
                draggable="true"
                @dragstart="handleDragStart($event, task)"
                style="background: white;"
              >
              <div class="d-flex align-items-center">
                  <div class="drag-handle">
                    <i class="fas fa-grip-lines"></i>
                  </div>
                  <div class="task-content ml-3 w-100 p-3"> <!-- Добавлен padding -->
                    <div class="d-flex justify-content-between align-items-center mb-3"> <!-- Увеличен margin -->
                      <h4 class="mb-0 task-title">{{ task.title }}</h4>
                      <div class="task-priority" 
                          :class="'priority-' + getPriorityValueString(task.priority).toLowerCase()">
                        {{ getPriorityValueString(task.priority) }}
                      </div>
                    </div>
                    
                    <div class="task-details">
                      <p class="mb-3 text-muted small">{{ task.description }}</p> <!-- Увеличен margin -->
                      <div class="d-flex justify-content-between align-items-end">
                        <div class="d-flex flex-column gap-2"> <!-- Добавлены промежутки -->
                          <div class="d-flex gap-2">
                            <span class="badge">
                              📅 {{ formatDate(task.dateCreated) }}
                            </span>
                            <span class="badge">
                              ⏳ {{ formatDate(task.dateEnd) }}
                            </span>
                          </div>
                          <button
                            class="btn btn-task-action btn-chat-action btn-chat-highlight"
                            @click="goToChatPage(task.id)"
                            title="Чат задачи"
                          >
                            💬
                          </button>
                        </div>
                        <div class="d-flex gap-1" v-if="canManageTasks">
                          <button
                            class="btn btn-task-action btn-edit"
                            @click="showEditTaskModal(task, column.id)"
                            title="Редактировать"
                          >
                            ✏️
                          </button>
                          <button
                            class="btn btn-task-action btn-delete"
                            @click="deleteTask(task.id)"
                            title="Удалить"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition-group>
            <button class="btn btn-light btn-block mt-3"
              v-if="canManageTasks"  
              @click="showAddTaskModal(column.id)"
            >
              + Добавить задачу
            </button>
          </div>
        </div>
      </div>
    </transition-group>
  
      <!-- Модальное окно для добавления колонки -->
        <transition name="modal-fade">
            <div v-if="isColumnModalVisible" class="modal-backdrop">
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
            <div v-if="isEditColumnModalVisible" class="modal-backdrop">
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
        <div v-if="isTaskModalVisible" class="modal-backdrop">
            <div class="modal fade show d-block">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Добавить задачу</h5>
                      <button type="button" class="close" @click="closeTaskModal">&times;</button>
                  </div>
                  <div class="modal-body">
                      <input
                        type="text"
                        v-model="newTaskName"
                        class="form-control mb-2"
                        :class="{ 'input-error': showTaskNameError }"
                        placeholder="Название задачи (обязательно для рекомендаций)"
                        @input="showTaskNameError = false"
                      >
                      <small v-if="showTaskNameError" class="text-danger">Заполните название задачи</small>
                      <textarea
                        v-model="newTaskDescription"
                        class="form-control mb-2"
                        :class="{ 'input-error': showTaskDescriptionError }"
                        placeholder="Описание задачи (обязательно для рекомендаций)"
                        @input="showTaskDescriptionError = false"
                      ></textarea>
                      <small v-if="showTaskDescriptionError" class="text-danger">Заполните описание задачи</small>
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
                    <button 
                        class="btn btn-info"
                        :class="{ 'loading': isFetchingRecommendations }"
                        @click="fetchRecommendations"
                        :disabled="!(newTaskName.trim() && newTaskDescription.trim())"
                    >
                        <span class="button-content">
                            <span v-if="!isFetchingRecommendations">Получить рекомендации</span>
                            <span v-else class="spinner"></span>
                        </span>
                    </button>
                    <button 
                        class="btn btn-primary"
                        :class="{ 'loading': isSaving }"
                        @click="addTask(currentColumnId)"
                        :disabled="isSaving"
                    >
                        <span class="button-content">
                            <span v-if="!isSaving">Сохранить</span>
                            <span v-else class="spinner"></span>
                        </span>
                    </button>
                  </div>
                </div>
            </div>
            </div>
        </div>
      </transition>


      <!-- Модальное окно для редактирования задачи -->
      <transition name="modal-fade">
        <div v-if="isEditTaskModalVisible" class="modal-backdrop">
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
  import Notification from '@/components/NotificationComponent.vue';
  
  export default {
    props: ['projectId'],
    components: { Notification },
    data() {
      return {
        error: '',
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
        currentTaskIdForEdit: null,
        isSaving: false, // для анимации загрузки, после нажатия на кнопку "Сохранить"
        rolesOnProject: ['TeamLead', 'DefaultWorker'],
        roleOnProject: null,
        isFetchingRecommendations: false,
        notificationMessage: '', // для уведомлений
        notificationType: 'success', // для уведомлений
        isTasksLoading: false, // для анимации загрузки задач
        metrics: { // для логов 
          modalOpenedAt: 0,
          recRequestAt: 0,
          recReceivedAt: 0,
          saveAt: 0,
        },
        showTaskNameError: false,
        showTaskDescriptionError: false,
      };
    },
    mounted() {
      this.loadProject();
      this.loadRoleOnProject();
      this.loadColumns();
      this.loadUsers();
    },
    computed: {
      canManageTasks() {
        const isAdmin = localStorage.getItem('role') === 'Administrator';
        return isAdmin || this.roleOnProject === 'TeamLead'; // Сравниваем со строкой
      },
      roleLabel() {
        if (localStorage.getItem('role') === 'Administrator') return 'Administrator';
        return this.roleOnProject; // Возвращаем уже преобразованное значение
      }
    },
    methods: {
      async loadProject() {
        try {
          const projectId = this.$route.params.projectId;
          const project = await DataService.read(`/projects/${projectId}`, item => new Project(item));
          this.project = project;
        } catch (error) {
          this.error = 'Ошибка при загрузке данных о проекте';
          console.error('Error loading project:', error);
        }
      },
      async loadRoleOnProject() {
        try {
          const projectId = this.$route.params.projectId;
          const role = await DataService.readString(`/projects/${projectId}/role`);
          
          this.roleOnProject = Number(role) === 1 ? 'TeamLead' : 'DefaultWorker';
          
          console.log('Processed role:', this.roleOnProject);
        } catch (error) {
          console.error('Ошибка загрузки роли:', error);
          this.roleOnProject = 'DefaultWorker';
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
            this.error = 'Ошибка при загрузке колонок проекта';
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
              this.error = `Ошибка при загрузке задач у колонки c идентификатором: ${columnId}.`;
                console.error(`Error loading tasks for column ${columnId}:`, error);
                return [];
            }
      },
      async loadUsers() {
        try {
            const projectId = this.$route.params.projectId;
            this.users = await DataService.readAll(`/projects/projectUsers/${projectId}/users`, item => new UsersOnProject(item));
        } catch (error) {
            this.error = 'Ошибка при загрузке пользователей';
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
          this.showNotification('Новая колонка добавлена.', 'success');
        } catch (error) {
          this.showNotification('Ошибка при удалении колонки.', 'error');
          console.error('Error adding column:', error);
        }
      },
      async deleteColumn(columnId) {
        try {
          const projectId = this.$route.params.projectId;
          await DataService.delete(`/columns/${projectId}/${columnId}`);
          this.loadColumns();
          this.showNotification('Колонка успешно удалена.', 'success');
        } catch (error) {
          this.showNotification('При удалении колонки произошла ошибка.', 'error');
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
            this.showNotification('Данные для колонки успешно изменены.', 'success');
        } catch (error) {
          this.showNotification('Произошла ошибка при изменении данных для колонки.', 'error');
            console.error('Error updating column:', error);
        }
      },
      showAddTaskModal(columnId) {
        this.currentColumnId = columnId;
        this.isTaskModalVisible = true;
        this.metrics.modalOpenedAt = performance.now();
        this.showTaskNameError = false;
        this.showTaskDescriptionError = false;
      },
      closeTaskModal() {
        this.isTaskModalVisible = false;
        this.newTaskName = '';
        this.newTaskDescription = '';
        this.newTaskPriority = '';
        this.newTaskDateEnd = '';
        this.selectedUserId = null;
        this.showTaskNameError = false;
        this.showTaskDescriptionError = false;
      },
      async addTask(columnId) {
        if(this.isSaving) return;
        this.metrics.saveAt = performance.now(); 
        this.isSaving = true;
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
          this.logMetrics();  
          this.closeTaskModal();
          this.showNotification('Задача успешно создана.', 'success');
        } catch (error) {
          this.showNotification('Произошла ошибка при создании задачи.', 'error');
          console.error('Error adding task:', error);
        }
        finally {
            this.isSaving = false;
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
            this.showNotification('Задача успешно удалена.', 'success');
        } catch (error) {
            this.showNotification('Произошла ошибка при удалении задачи.', 'error');
            console.error('Error deleting task:', error);
        }
      },
      async logMetrics() {
        const { modalOpenedAt, recRequestAt, recReceivedAt, saveAt } = this.metrics;
        const payload = {
          openToRec: recRequestAt && modalOpenedAt ? recRequestAt - modalOpenedAt : 0, // сколько до клика «рекомендации»
          recResponseTime: recRequestAt && recReceivedAt ? recReceivedAt - recRequestAt : 0, // задержка AI
          recToSave: recReceivedAt && saveAt ? saveAt - recReceivedAt : 0, // заполнение после рекомендаций
          totalTime: saveAt && modalOpenedAt ? saveAt - modalOpenedAt : 0, // общее время
          usedRecommendations: !!recRequestAt // true, если была попытка получения рекомендаций
        };

        try{
          await DataService.create(`/metrics/task`, payload);
          this.resetMetrics();
        }
        catch (error)
        {
          this.error = 'Ошибка при сохранении логов';
            console.error('Error with saving logs data:', error);
        }
      },
      resetMetrics() {
        this.metrics = {
          modalOpenedAt: null,
          recRequestAt: null,
          recReceivedAt: null,
          saveAt: null
        };
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
        this.showNotification('Задача успешно изменена.', 'success');
        } catch (error) {
          this.showNotification('Прозошла ошибка при изменении задачи.', 'error');
        console.error('Ошибка редактирования задачи:', error);
        }
      },
      formatDate(dateString) {
        const options = { day: '2-digit', month: 'short', year: 'numeric' }
        return new Date(dateString).toLocaleDateString('ru-RU', options)
      },
      async onShowAllTasksChange() {
        this.isTasksLoading = true;
        await this.loadColumns();
        this.isTasksLoading = false;
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
            this.showNotification('Задача успешно перемещена.', 'success');
        } catch (error) {
          this.showNotification('Произошла ошибка при перемещении задачи.', 'success');
        console.error('Ошибка при перемещении задачи:', error);
        }
      },
      async fetchRecommendations() {
        // Проверяем заполненность полей
        if (!this.newTaskName.trim()) {
          this.showTaskNameError = true;
        }
        if (!this.newTaskDescription.trim()) {
          this.showTaskDescriptionError = true;
        }
        if (!this.newTaskName.trim() || !this.newTaskDescription.trim()) {
          this.showNotification('Пожалуйста, заполните название и описание задачи для получения рекомендаций.', 'error');
          return;
        }
        this.metrics.recRequestAt = performance.now();
        this.isFetchingRecommendations = true;
        const projectId = this.$route.params.projectId;
        const userMessage = `${this.newTaskName}. ${this.newTaskDescription}`;

        try {
          const recommendationData = await DataService.read(`/tasks/${projectId}/recommendations?userMessage=${encodeURIComponent(userMessage)}`, data => data);
          this.metrics.recReceivedAt = performance.now();

          // Логируем ответ сервера для диагностики
          console.log('Received recommendation data:', recommendationData);
          // Установка данных из рекомендаций
          // Преобразовываем числовой приоритет в строку
          switch (recommendationData.priority) {
              case 0:
                  this.newTaskPriority = 'Low';
                  break;
              case 1:
                  this.newTaskPriority = 'Medium';
                  break;
              case 2:
                  this.newTaskPriority = 'High';
                  break;
              default:
                  this.newTaskPriority = 'Low';
          }
          // Исполнитель
          this.selectedUserId = recommendationData.userId || (this.users.length > 0 ? this.users[0].id : '');
          // Дата окончания
          this.newTaskDateEnd = (() => {
            let date = new Date();
            const daysToAdd = parseInt(recommendationData.daysToTask, 10) || 1;
            date.setDate(date.getDate() + daysToAdd);
            return date.toISOString().split('T')[0];
          })();
          this.$forceUpdate();
          // Сброс ошибок
          this.showTaskNameError = false;
          this.showTaskDescriptionError = false;
        } catch (error) {
          // Ошибка — ставим значения по умолчанию
          this.newTaskPriority = 'Low';
          this.newTaskDateEnd = (() => {
            let date = new Date();
            date.setDate(date.getDate() + 1);
            return date.toISOString().split('T')[0];
          })();
          this.selectedUserId = this.users.length > 0 ? this.users[0].id : '';
          this.showNotification('Не удалось получить рекомендации. Установлены значения по умолчанию.', 'error');
          this.showTaskNameError = false;
          this.showTaskDescriptionError = false;
          console.error('Ошибка при получении рекомендаций:', error.message || error);
        } finally {
          this.isFetchingRecommendations = false;
        }
      },
      async downloadProjectReport() {
        try {
          // Получаем projectId из текущего маршрута
          const projectId = this.$route.params.projectId;
          // Загружаем PDF как Blob
          const blob = await DataService.downloadBlob(`/metrics/ReportForProject/${projectId}`);
          // Создаём URL для скачивания
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          // Задаём имя файла
          link.download = `Report_${projectId}.pdf`;
          document.body.appendChild(link);
          link.click();
          // Убираем ссылку и сбрасываем объект
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Ошибка при скачивании отчёта:', error);
          this.error = 'Не удалось скачать отчёт';
        }
      },
      showNotification(message, type = 'success') {
        this.notificationMessage = message;
        this.notificationType = type;
        if (this.$refs.notification) {
          this.$refs.notification.visible = true;
        }
      },
      handleError(error, defaultMessage) {
        if (error.response && error.response.status === 400 && error.response.data.errors) {
          const errors = error.response.data.errors;
          if (errors["$id"]) delete errors["$id"];

          const errorMessages = Object.values(errors).flat().join(' ');
          this.showNotification(`Ошибка: ${errorMessages}`, 'error');
        } else {
          this.showNotification(defaultMessage, 'error');
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
  
  /* --- Улучшенный дизайн модального окна добавления/изменения задач --- */
.modal-content {
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(60, 80, 180, 0.18), 0 2px 8px rgba(0,0,0,0.10);
  background: linear-gradient(120deg, #f7fafc 70%, #e3e9f7 100%);
  border: none;
  opacity: 1 !important;
  padding: 0;
  overflow: hidden;
  animation: modal-pop-in 0.35s cubic-bezier(.4,0,.2,1);
  max-width: 440px;
  margin: 0 auto;
}

@keyframes modal-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.92) translateY(30px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  background: linear-gradient(90deg, #4f8cff 0%, #6fd6ff 100%);
  color: #fff;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  padding: 18px 28px 14px 28px;
  border-bottom: none;
  box-shadow: 0 2px 8px rgba(79, 140, 255, 0.07);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-weight: 700;
  font-size: 1.18rem;
  letter-spacing: 0.01em;
  color: #fff;
}

.modal-header .close {
  display: block;
  background: transparent;
  border: none;
  font-size: 1.6rem;
  color: #fff;
  opacity: 0.7;
  transition: opacity 0.18s;
  margin-left: 10px;
  margin-right: -8px;
  outline: none;
}
.modal-header .close:hover {
  opacity: 1;
  color: #fff;
}

.modal-body {
  padding: 28px 28px 18px 28px;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.modal-body input[type="text"],
.modal-body input[type="date"],
.modal-body textarea,
.modal-body select {
  border-radius: 10px;
  border: 1px solid #e3e9f7;
  background: #f7fafc;
  padding: 10px 14px;
  font-size: 1rem;
  margin-bottom: 0;
  transition: border 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 2px rgba(60,80,180,0.03);
  outline: none;
}

.modal-body input[type="text"]:focus,
.modal-body input[type="date"]:focus,
.modal-body textarea:focus,
.modal-body select:focus {
  border: 1.5px solid #4f8cff;
  background: #f0f6ff;
  box-shadow: 0 2px 8px rgba(79, 140, 255, 0.08);
}

.modal-body textarea {
  min-height: 70px;
  resize: vertical;
}

.modal-body select {
  cursor: pointer;
}

.modal-body option[disabled] {
  color: #b0b8c9;
}

.modal-footer {
  background: #f7fafc;
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
  border-top: 1px solid #e3e9f7;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  padding-bottom: 18px;
}

.btn-primary, .btn-info, .btn-secondary {
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.01rem;
  min-width: 110px;
  padding: 8px 0;
  box-shadow: 0 1px 4px rgba(79, 140, 255, 0.07);
  transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s;
}

.btn-primary {
  background: linear-gradient(90deg, #4f8cff 0%, #6fd6ff 100%);
  border: none;
  color: #fff;
}
.btn-primary:hover, .btn-primary:focus {
  background: linear-gradient(90deg, #3576e6 0%, #4fd2ff 100%);
  color: #fff;
  transform: translateY(-1px) scale(1.03);
}

.btn-info {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
  border: none;
  color: #fff;
}
.btn-info:hover, .btn-info:focus {
  background: linear-gradient(90deg, #2ecf6b 0%, #1fd9c2 100%);
  color: #fff;
  transform: translateY(-1px) scale(1.03);
}

.btn-secondary {
  background: #e3e9f7;
  color: #3b4a6b;
  border: none;
}
.btn-secondary:hover, .btn-secondary:focus {
  background: #dbeafe;
  color: #1a237e;
}

.modal-body label {
  font-weight: 500;
  color: #3b4a6b;
  margin-bottom: 4px;
  display: block;
  font-size: 0.98rem;
}

@media (max-width: 600px) {
  .modal-content {
    max-width: 98vw;
    min-width: 0;
    padding: 0;
  }
  .modal-body, .modal-footer, .modal-header {
    padding-left: 10px;
    padding-right: 10px;
  }
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
  transition: opacity 0.28s cubic-bezier(.4,0,.2,1), transform 0.28s cubic-bezier(.4,0,.2,1);
  will-change: opacity, transform;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(30px);
}

.modal-fade-enter-to, .modal-fade-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

  .task {
    background: #fff !important;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    margin-bottom: 12px;
    transition: box-shadow 0.2s;
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    cursor: grab;
  }

  .task:active {
    cursor: grabbing;
  }

  .task:hover {
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  }

  .btn-chat {
    color: #1a73e8;
    border: 1px solid #1a73e8;
    border-radius: 8px;
    padding: 2px 12px;
    text-decoration: none !important;
    transition: all 0.2s;
  }

  .btn-chat:hover {
    background: #1a73e8;
    color: white !important;
  }

  .badge {
    background-color: #f8f9fa !important;
    border: 1px solid #dee2e6;
    font-weight: 500;
    padding: 5px 10px;
    color: #495057 !important;
  }

  .task-details {
    color: #606060;
    font-size: 0.88em;
  }

  .task-content h4 {
    color: #2d2d2d;
    font-size: 1.05rem;
  }

  .task-priority {
    font-size: 0.85rem;
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 12px;
    background: #f0f0f0;
  }

  .task-priority::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
  }

  .priority-high::before { background-color: #ff4444; }
  .priority-medium::before { background-color: #ffc107; }
  .priority-low::before { background-color: #4caf50; }

  .priority-high { color: #ff4444; }
  .priority-medium { color: #ffc107; }
  .priority-low { color: #4caf50; }

  .task h4 {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .card {
    background-color: #f7f8fa;
  }

  .btn {
    margin-right: 5px;
  }

  .btn-primary {
    background-color: #007bff;
    border-color: #007bff;
    padding: 8px 20px;
    transition: all 0.3s ease;
    position: relative;
}

.btn-primary:hover {
    background-color: #0069d9;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.btn-primary:disabled {
    opacity: 1;
    background-color: #b3d7ff;
    border-color: #b3d7ff;
}

.spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.button-content {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 8px;
    margin-right: 8px;
}

.loading .button-content {
    opacity: 0.8;
}

.role-badge {
  position: absolute;
  top: 70px;
  right: 20px;
  padding: 8px 15px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
}

.text-muted {
  font-size: 0.9em;
  color: #6c757d;
}

.custom-switch {
  display: flex;
  align-items: center;
  font-size: 1.1em;
  user-select: none;
}

.custom-switch label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 12px;
}

.custom-switch input[type="checkbox"] {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.custom-switch .slider {
  position: relative;
  width: 44px;
  height: 24px;
  background: #dee2e6;
  border-radius: 24px;
  transition: background 0.3s;
  margin-right: 8px;
  flex-shrink: 0;
}

.custom-switch .slider::before {
  content: "";
  position: absolute;
  left: 3px;
  top: 3px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.custom-switch input[type="checkbox"]:checked + .slider {
  background: #007bff;
}

.custom-switch input[type="checkbox"]:checked + .slider::before {
  transform: translateX(20px);
}

.switch-label {
  font-weight: 500;
  color: #343a40;
}

.spinner-switch {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #007bff;
  border-radius: 50%;
  border-top: 2px solid transparent;
  animation: spin 0.7s linear infinite;
  margin-left: 8px;
  vertical-align: middle;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Анимация для колонок */
.column-list-enter-active, .column-list-leave-active {
  transition: all 0.38s cubic-bezier(.4,0,.2,1);
}
.column-list-enter-from, .column-list-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(40px);
  filter: blur(2px);
}
.column-list-enter-to, .column-list-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
  filter: blur(0);
}

/* Анимация для карточек задач */
.task-list-enter-active, .task-list-leave-active {
  transition: all 0.28s cubic-bezier(.4,0,.2,1);
}
.task-list-enter-from, .task-list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.97) rotateZ(-2deg);
  filter: blur(1.5px);
}
.task-list-enter-to, .task-list-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1) rotateZ(0);
  filter: blur(0);
}

/* --- Улучшенный дизайн колонок --- */
.column-list {
  gap: 32px 0;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.col-md-4 {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-left: 12px;
  padding-right: 12px;
  min-width: 340px;
  max-width: 400px;
  margin-bottom: 0;
}

.card {
  background: linear-gradient(135deg, #f7fafc 60%, #e3e9f7 100%);
  border-radius: 18px;
  box-shadow: 0 6px 24px rgba(60, 80, 180, 0.08), 0 1.5px 4px rgba(0,0,0,0.04);
  border: none;
  transition: box-shadow 0.22s, transform 0.22s, background 0.22s;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 32px;
}

.card:hover {
  box-shadow: 0 12px 36px rgba(60, 80, 180, 0.13), 0 2px 8px rgba(0,0,0,0.06);
  background: linear-gradient(135deg, #f0f4ff 60%, #dbeafe 100%);
  transform: translateY(-3px) scale(1.015);
}

.card-body {
  padding: 22px 18px 18px 18px;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-title {
  font-size: 1.18rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #2d3a4a;
  margin-bottom: 18px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e3e9f7;
}

.task-list {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 60px;
  max-height: 420px;
  padding-right: 2px;
  margin-bottom: 10px;
  scrollbar-width: thin;
  scrollbar-color: #b3c0e0 #f7fafc;
}
.task-list::-webkit-scrollbar {
  width: 7px;
  background: #f7fafc;
}
.task-list::-webkit-scrollbar-thumb {
  background: #b3c0e0;
  border-radius: 6px;
}

.btn-light.btn-block {
  border-radius: 12px;
  margin-top: 18px;
  font-weight: 500;
  background: #f5f8ff;
  border: 1px solid #e3e9f7;
  color: #3b4a6b;
  transition: background 0.18s, color 0.18s;
}
.btn-light.btn-block:hover {
  background: #e3e9f7;
  color: #1a237e;
}

.btn-add-column {
  background: linear-gradient(90deg, #4f8cff 0%, #6fd6ff 100%);
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 16px;
  padding: 10px 28px;
  font-size: 1.08rem;
  box-shadow: 0 2px 12px rgba(79, 140, 255, 0.10);
  transition: background 0.18s, box-shadow 0.18s, transform 0.18s;
  letter-spacing: 0.01em;
  outline: none;
}

.btn-add-column:hover, .btn-add-column:focus {
  background: linear-gradient(90deg, #3576e6 0%, #4fd2ff 100%);
  box-shadow: 0 4px 18px rgba(79, 140, 255, 0.18);
  color: #fff;
  transform: translateY(-2px) scale(1.03);
}

.btn-add-column:active {
  background: linear-gradient(90deg, #3576e6 0%, #4fd2ff 100%);
  box-shadow: 0 2px 8px rgba(79, 140, 255, 0.12);
  color: #fff;
  transform: scale(0.98);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(60, 80, 180, 0.13);
  z-index: 1040;
  backdrop-filter: blur(2px);
  transition: background 0.25s;
}

.input-error {
  border: 1.5px solid #ff4444 !important;
  background: #fff0f0 !important;
}
.text-danger {
  color: #ff4444 !important;
  font-size: 0.93em;
  margin-bottom: 6px;
  margin-top: -10px;
  display: block;
}

.btn-task-action {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f5f8ff;
  color: #4f8cff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s;
  font-size: 1.15rem;
  box-shadow: 0 1px 4px rgba(79, 140, 255, 0.07);
  outline: none;
  padding: 0;
}
.btn-task-action:last-child {
  margin-right: 0;
}
.btn-task-action.btn-edit {
  background: linear-gradient(90deg, #e3e9f7 0%, #f7fafc 100%);
  color: #43a047;
}
.btn-task-action.btn-edit:hover, .btn-task-action.btn-edit:focus {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
  transform: translateY(-1px) scale(1.08);
}
.btn-task-action.btn-delete {
  background: linear-gradient(90deg, #e3e9f7 0%, #f7fafc 100%);
  color: #ff4444;
}
.btn-task-action.btn-delete:hover, .btn-task-action.btn-delete:focus {
  background: linear-gradient(90deg, #ff4444 0%, #ffb199 100%);
  color: #fff;
  transform: translateY(-1px) scale(1.08);
}
.btn-task-action.btn-chat-action {
  background: linear-gradient(90deg, #e3e9f7 0%, #f7fafc 100%);
  color: #1a73e8;
}
.btn-task-action.btn-chat-action:hover, .btn-task-action.btn-chat-action:focus {
  background: linear-gradient(90deg, #1a73e8 0%, #81d4fa 100%);
  color: #fff;
  transform: translateY(-1px) scale(1.08);
}
/* Более заметная кнопка чата */
.btn-task-action.btn-chat-highlight {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
  box-shadow: 0 2px 12px rgba(67, 233, 123, 0.18), 0 1px 4px rgba(56, 249, 215, 0.10);
  font-size: 1.25rem;
  border: 2px solid #38f9d7;
  animation: chat-pop 0.5s;
}
.btn-task-action.btn-chat-highlight:hover, .btn-task-action.btn-chat-highlight:focus {
  background: linear-gradient(90deg, #1a73e8 0%, #38f9d7 100%);
  color: #fff;
  border-color: #1a73e8;
  box-shadow: 0 4px 18px rgba(26, 115, 232, 0.18);
  transform: translateY(-2px) scale(1.12);
}
@keyframes chat-pop {
  0% { transform: scale(0.85); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.column-actions {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}
  </style>
