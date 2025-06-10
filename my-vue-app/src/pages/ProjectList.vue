<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">Список проектов</h1>

    <!-- Компонент уведомлений -->
    <Notification ref="notification" :message="notificationMessage" :type="notificationType" />

    <div class="text-center mb-4">
      <button class="btn btn-success" @click="openCreateModal">Создать новый проект</button>
    </div>

    <div class="row">
      <div class="col-md-4 mb-4" v-for="project in filteredProjects" :key="project.id">
        <div class="card shadow-sm">
          <div class="card-body" @click="goToProjectDetails(project.id)">
            <h5 class="card-title">{{ project.name }}</h5>

          </div>
          <div class="card-footer">
            <button @click="openEditModal(project)" class="btn btn-secondary">Редактировать</button>
            <button @click="deleteProject(project.id)" class="btn btn-danger">Удалить</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно для создания/редактирования проекта -->
    <ProjectModal
      :isVisible="showModal"
      :isEditing="isEditing"
      :projectForm="projectForm"
      @save="handleSave"
      @close="showModal = false"
    />
  </div>
</template>

<script>
import { ProjectsOnUser } from '@/models/ProjectsOnUser';
import DataService from '../service/DataService';
import ProjectModal from '@/components/ProjectModal.vue';
import Notification from '@/components/NotificationComponent.vue';

export default {
  components: { ProjectModal,  Notification },
  data() {
    return {
      projects: [],
      projectForm: { name: '' },
      isEditing: false,
      showModal: false,
      editingProjectId: null,
      notificationMessage: '',
      notificationType: 'success',
    };
  },
  mounted() {
     const role = localStorage.getItem('role');
      if (role === 'Administrator') {
        this.loadProjects();
      } else {
        this.loadUserProjects();
      }
  },
  computed: {
    filteredProjects() {
      return this.projects.filter(p => p.roleOnProject === 1 || localStorage.getItem('role') === 'Administrator');
    }
  },
  methods: {
    loadProjects() {
      DataService.readAll('/users/projectUsers/projects', item => new ProjectsOnUser(item))
        .then((projects) => {
          this.projects = projects;
        })
        .catch((error) => console.log(error));
    },
    loadUserProjects() {
        DataService.readAll('/users/projectUsers/projectsForRegularUser', item => new ProjectsOnUser(item))
          .then((projects) => {
            this.projects = projects;
          })
          .catch((error) => console.log(error));
    },
    openCreateModal() {
      this.isEditing = false;
      this.projectForm = { name: '' };
      this.showModal = true;
    },
    openEditModal(project) {
      this.isEditing = true;
      this.editingProjectId = project.id;
      this.projectForm = { ...project };
      this.showModal = true;
    },
    handleSave(projectData) {
      if (this.isEditing) {
        this.updateProject(projectData);
      } else {
        this.createProject(projectData);
      }
      this.showModal = false;
    },
    createProject(projectData) {
      DataService.create('/projects', projectData)
        .then(() => {
          this.checkAdministratorRoleThenLoadProjects();
          this.showNotification('Проект успешно создан.', 'success');
        })
        .catch(error => {
          this.handleError(error, 'Ошибка при создании проекта');
        });
    },
    updateProject(projectData) {
      DataService.update(`/projects/${this.editingProjectId}`, projectData)
        .then(() => {
          this.checkAdministratorRoleThenLoadProjects();
          this.showNotification('Проект успешно обновлен.', 'success');
        })
        .catch(error => {
          this.handleError(error, 'Ошибка при обновлении данных проекта.');
        });
    },
    deleteProject(projectId) {
      if (confirm('Вы уверены, что хотите удалить этот проект?')) {
        DataService.delete(`/projects/${projectId}`)
          .then(() => {
            this.checkAdministratorRoleThenLoadProjects();
            this.showNotification('Проект успешно удален.', 'success');
          })
          .catch((error) => {
            this.showNotification('Ошибка при удалении проекта.', 'error');
            console.log(error);
          });
      }
    },
    checkAdministratorRoleThenLoadProjects(){
      const role = localStorage.getItem('role');
          if (role === 'Administrator') {
            this.loadProjects();
          } else {
            this.loadUserProjects();
          }
    },
    goToProjectDetails(projectId) {
      this.$router.push({ name: 'ProjectDetails', params: { id: projectId } });
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
  },
};
</script>

<style scoped>

.container {
  max-width: 1100px;
  animation: fade-in-page 0.8s cubic-bezier(0.4,0,0.2,1);
  margin: 0 auto;
  padding: 32px 16px 24px 16px;
  background: linear-gradient(120deg, #f7fafc 70%, #e3e9f7 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(60, 80, 180, 0.10), 0 2px 8px rgba(0,0,0,0.04);
}

@keyframes fade-in-page {
  0% { opacity: 0; transform: translateY(30px) scale(0.98);}
  100% { opacity: 1; transform: translateY(0) scale(1);}
}

h1 {
  font-size: 2rem;
  color: #2d3a4a;
  margin-bottom: 2.2rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  animation: fade-in-title 1s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-title {
  0% { opacity: 0; letter-spacing: 0.2em; }
  100% { opacity: 1; letter-spacing: normal; }
}

.text-center > .btn {
  animation: fade-in-btn 1.1s cubic-bezier(0.4,0,0.2,1);
  background: linear-gradient(90deg, #4f8cff 0%, #6fd6ff 100%);
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 16px;
  padding: 12px 32px;
  font-size: 1.08rem;
  box-shadow: 0 2px 12px rgba(79, 140, 255, 0.10);
  transition: background 0.18s, box-shadow 0.18s, transform 0.18s;
  letter-spacing: 0.01em;
  outline: none;
}
.text-center > .btn:hover, .text-center > .btn:focus {
  background: linear-gradient(90deg, #3576e6 0%, #4fd2ff 100%);
  box-shadow: 0 4px 18px rgba(79, 140, 255, 0.18);
  color: #fff;
  transform: translateY(-2px) scale(1.03);
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 32px 0;
  margin-left: 0 !important;
  margin-right: 0 !important;
  animation: fade-in-row 1.1s cubic-bezier(0.4,0,0.2,1);
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
  min-height: 180px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 32px;
  opacity: 0;
  animation: fade-in-card 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
}

.card:nth-child(1) { animation-delay: 0.15s; }
.card:nth-child(2) { animation-delay: 0.3s; }
.card:nth-child(3) { animation-delay: 0.45s; }
.card:nth-child(4) { animation-delay: 0.6s; }

@keyframes fade-in-card {
  0% { opacity: 0; transform: translateY(30px) scale(0.97);}
  100% { opacity: 1; transform: translateY(0) scale(1);}
}

.card:hover {
  box-shadow: 0 12px 36px rgba(60, 80, 180, 0.13), 0 2px 8px rgba(0,0,0,0.06);
  background: linear-gradient(135deg, #f0f4ff 60%, #dbeafe 100%);
  transform: translateY(-3px) scale(1.015);
}

.card-body {
  flex-grow: 1;
  padding: 28px 22px 18px 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3a4a;
  margin-bottom: 0;
  letter-spacing: 0.01em;
  animation: fade-in-card-title 1.1s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-card-title {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 14px 18px;
  background-color: #f7fafc;
  border-top: 1px solid #e3e9f7;
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
  gap: 10px;
}

.card-footer .btn {
  flex: 1 1 0;
  min-width: 0;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 0;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.18s;
  border-radius: 12px; 
  margin: 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.btn-secondary {
  background: linear-gradient(90deg, #4f8cff 0%, #6fd6ff 100%);
  color: #fff;
  border: none;
}
.btn-secondary:hover, .btn-secondary:focus {
  background: linear-gradient(90deg, #3576e6 0%, #4fd2ff 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(79,140,255,0.10);
  transform: translateY(-1px) scale(1.03);
}

.btn-danger {
  background: linear-gradient(90deg, #ff5858 0%, #f09819 100%);
  color: #fff;
  border: none;
}
.btn-danger:hover, .btn-danger:focus {
  background: linear-gradient(90deg, #e53935 0%, #fbc531 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(220,53,69,0.10);
  transform: translateY(-1px) scale(1.03);
}

@media (max-width: 900px) {
  .container {
    padding: 12px 2vw;
  }
  .col-md-4 {
    min-width: 90vw;
    max-width: 100vw;
    padding-left: 0;
    padding-right: 0;
  }
  .row {
    gap: 18px 0;
  }
  .card {
    min-width: 0;
    margin-bottom: 18px;
  }
  .card-body, .card-footer {
    padding-left: 10px;
    padding-right: 10px;
  }
}

@media (max-width: 600px) {
  .container {
    padding: 4px 0;
    border-radius: 0;
  }
  .card {
    border-radius: 10px;
  }
  .card-footer {
    border-radius: 0 0 10px 10px;
  }
}
</style>

