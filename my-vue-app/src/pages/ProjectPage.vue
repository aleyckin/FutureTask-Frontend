<template>
    <div class="container mt-5" v-if="project">
      <div v-if="roleOnProject !== null" class="role-badge">
        Ваша роль: {{ roleLabel }}
        <span class="badge bg-primary ms-2">{{ roleLabel }}</span>
      </div>
      <h1 class="text-center mb-4">Проект: {{ project.name }}</h1>
      <!-- Кнопка скачивания отчёта -->
      <div class="text-center mb-4" v-if="canManageTasks">
        <button 
          class="btn btn-outline-primary"
          @click="downloadProjectReport"
        >
          📄 Скачать отчёт по проекту
        </button>
      </div>
      <button class="btn btn-success mb-4"
        v-if="canManageTasks"
        @click="showAddColumnModal"
      >
        Добавить колонку
      </button>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Переключатель режима просмотра задач -->
    <div class="form-group">
      <label>
        <input type="checkbox" v-model="showAllTasks" @change="loadColumns">
        Показать все задачи
      </label>
    </div>

    <div class="row">
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
              <div v-if="canManageTasks">
                <button class="btn btn-outline-secondary btn-sm mr-2" @click="showEditColumnModal(column)">✏️</button>
                <button class="btn btn-outline-danger btn-sm" @click="deleteColumn(column.id)">🗑️</button>
              </div>
            </h5>
            <div
              v-for="task in column.tasks"
              :key="task.id"
              class="task border-top pt-2"
              draggable
              @dragstart="handleDragStart($event, task)"
              style="background: white;"
            >
            <div class="d-flex align-items-center">
                <div class="drag-handle" @mousedown.stop>
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
                        <button class="btn btn-chat"
                        @click="goToChatPage(task.id)">
                          💬 Чат задачи
                        </button>
                      </div>
                      <div class="d-flex gap-1" v-if="canManageTasks">
                        <button class="btn btn-outline-warning btn-sm"
                        @click="showEditTaskModal(task, column.id)">
                          ✏️
                        </button>
                        <button class="btn btn-outline-danger btn-sm"
                        @click="deleteTask(task.id)">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button class="btn btn-light btn-block mt-3"
              v-if="canManageTasks"  
              @click="showAddTaskModal(column.id)"
            >
              + Добавить задачу
            </button>
          </div>
        </div>
      </div>
    </div>
  
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
  
  export default {
    props: ['projectId'],
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
        metrics: { // для логов 
          modalOpenedAt: 0,
          recRequestAt: 0,
          recReceivedAt: 0,
          saveAt: 0,
        }
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
        } catch (error) {
          this.error = 'Ошибка при добавлении новой колонки';
          console.error('Error adding column:', error);
        }
      },
      async deleteColumn(columnId) {
        try {
          const projectId = this.$route.params.projectId;
          await DataService.delete(`/columns/${projectId}/${columnId}`);
          this.loadColumns();
        } catch (error) {
          this.error = 'Ошибка при удалении колонки';
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
          this.error = 'Ошибка при редактировании колонки';
            console.error('Error updating column:', error);
        }
      },
      showAddTaskModal(columnId) {
        this.currentColumnId = columnId;
        this.isTaskModalVisible = true;
        this.metrics.modalOpenedAt = performance.now();
      },
      closeTaskModal() {
        this.isTaskModalVisible = false;
        this.newTaskName = '';
        this.newTaskDescription = '';
        this.newTaskPriority = '';
        this.newTaskDateEnd = '';
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
        } catch (error) {
          this.error = 'Ошибка при добавлении задачи';
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
        } catch (error) {
            this.error = 'Ошибка при удалении задачи';
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
        } catch (error) {
          this.error = 'Ошибка при редактировании задачи';
        console.error('Ошибка редактирования задачи:', error);
        }
      },
      formatDate(dateString) {
        const options = { day: '2-digit', month: 'short', year: 'numeric' }
        return new Date(dateString).toLocaleDateString('ru-RU', options)
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
          this.error = 'Ошибка при перемещении задачи';
        console.error('Ошибка при перемещении задачи:', error);
        }
      },
      async fetchRecommendations() {
          this.metrics.recRequestAt = performance.now();
          this.isFetchingRecommendations = true;
          const projectId = this.projectId;
          const userMessage = `${this.newTaskName}. ${this.newTaskDescription}`;

          try {
              // Получаем данные с сервера как объект
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
                      this.newTaskPriority = '';
              }

              // Устанавливаем исполнителя (предполагая, что userEmail — это уникальный идентификатор пользователя)
              this.selectedUserId = recommendationData.userId || '';

              // Обновляем дату
              this.newTaskDateEnd = (() => {
                  let date = new Date();
                  const daysToAdd = parseInt(recommendationData.daysToTask, 10) || 0;
                  date.setDate(date.getDate() + daysToAdd);
                  return date.toISOString().split('T')[0]; // Возвращает дату в формате YYYY-MM-DD
              })();

              // Принудительно обновляем интерфейс (необязательно, но дополнительная гарантия)
              this.$forceUpdate();
          } catch (error) {
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

  .task {
    background: #fff !important;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    margin-bottom: 12px;
    transition: box-shadow 0.2s;
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
  </style>
  