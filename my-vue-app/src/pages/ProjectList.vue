<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">Список проектов</h1>
    <div class="text-center mb-4">
      <button class="btn btn-success" @click="openCreateModal">Создать новый проект</button>
    </div>

    <div class="row">
      <div class="col-md-4 mb-4" v-for="project in projects" :key="project.id">
        <div class="card shadow-sm">
          <div class="card-body" @click="goToProjectDetails(project.id)">
            <h5 class="card-title">{{ project.name }}</h5>
            <p class="card-text">{{ project.description }}</p>
          </div>
          <div class="card-footer">
            <button @click="openEditModal(project)" class="btn btn-secondary">Редактировать</button>
            <button @click="deleteProject(project.id)" class="btn btn-danger">Удалить проект</button>
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
import { Project } from '@/models/Project';
import DataService from '../service/DataService';
import ProjectModal from '@/components/ProjectModal.vue';

export default {
  components: { ProjectModal },
  data() {
    return {
      projects: [],
      projectForm: { name: '' },
      isEditing: false,
      showModal: false,
      editingProjectId: null,
    };
  },
  mounted() {
    this.loadProjects();
  },
  methods: {
    loadProjects() {
      DataService.readAll('/projects', item => new Project(item))
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
          this.loadProjects();
        })
        .catch((error) => console.log(error));
    },
    updateProject(projectData) {
      DataService.update(`/projects/${this.editingProjectId}`, projectData)
        .then(() => {
          this.loadProjects();
        })
        .catch((error) => console.log(error));
    },
    deleteProject(projectId) {
      if (confirm('Вы уверены, что хотите удалить этот проект?')) {
        DataService.delete(`/projects/${projectId}`)
          .then(() => {
            this.loadProjects();
          })
          .catch((error) => console.log(error));
      }
    },
    goToProjectDetails(projectId) {
      this.$router.push({ name: 'ProjectDetails', params: { id: projectId } });
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 900px;
}

.card {
  border-radius: 10px;
  border: 1px solid #dee2e6;
  cursor: pointer;
  transition: transform 0.2s;
  height: 200px; 
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #343a40;
}

.card-body {
  flex-grow: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-text {
  font-size: 1rem;
  color: #6c757d;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.btn {
  border-radius: 5px;
  padding: 10px 15px;
  flex: 1;
  margin: 0 5px;
}

.btn-secondary {
  background-color: #007bff;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #0056b3;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: #c82333;
}
</style>

