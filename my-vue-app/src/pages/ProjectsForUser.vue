<template>
    <div class="container mt-5">
      <h1 class="text-center mb-4">Ваши проекты</h1>
      <div class="text-center mb-4">
          <!-- Кнопка скачивания своего отчёта слева -->
        <button
          class="btn btn-outline-secondary btn-sm me-3"
          @click="downloadUserReport"
          title="Скачать отчёт по вашим проектам"
        >
          📄 Сформировать отчёт
        </button>
      </div>
      <div class="row">
        <div class="col-md-4" v-for="project in projects" :key="project.id">
          <div 
            class="card mb-4 shadow-sm" 
            @click="goToProjectPage(project.id)" 
            @mouseover="hovering = project.id" 
            @mouseleave="hovering = null"
            :class="{ 'hover-card': hovering === project.id }"
          >
            <div class="card-body">
              <h5 class="card-title">{{ project.name }}</h5>
                <div>
                    {{ getRoleName(project.roleOnProject) }}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>

  import { ProjectsOnUser } from '@/models/ProjectsOnUser';
  import DataService from '../service/DataService';
  
  export default {
    data() {
      return {
        projects: [],
        hovering: null,
      };
    },
    mounted() {
      this.loadUserProjects();
    },
    methods: {
      loadUserProjects() {
        DataService.readAll('/users/projectUsers/projectsForRegularUser', item => new ProjectsOnUser(item))
          .then((projects) => {
            this.projects = projects;
          })
          .catch((error) => console.log(error));
      },
      getRoleName(role) {
        switch (role) {
            case 0:
            return 'DefaultWorker';
            case 1:
            return 'TeamLead';
            default:
            return 'Unknown Role';
        }
      },
      async downloadUserReport() {
        try {
          // Запросим PDF в виде Blob
          const blob = await DataService.downloadBlob(`/metrics/ReportForUser`);
          // Сформируем временную ссылку и имя файла
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Report_${this.user}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error('Ошибка при скачивании отчёта пользователя:', err);
        }
      },
      goToProjectPage(projectId) {
        this.$router.push({ name: 'ProjectPage', params: { projectId: projectId } });
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 900px;
    animation: fade-in-page 0.8s cubic-bezier(0.4,0,0.2,1);
  }

  @keyframes fade-in-page {
    0% { opacity: 0; transform: translateY(30px) scale(0.98);}
    100% { opacity: 1; transform: translateY(0) scale(1);}
  }

  h1 {
    font-size: 2.2rem;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    animation: fade-in-title 1s cubic-bezier(0.4,0,0.2,1);
  }

  @keyframes fade-in-title {
    0% { opacity: 0; letter-spacing: 0.2em; }
    100% { opacity: 1; letter-spacing: normal; }
  }

  .text-center > .btn {
    animation: fade-in-btn 1.1s cubic-bezier(0.4,0,0.2,1);
  }

  @keyframes fade-in-btn {
    0% { opacity: 0; transform: scale(0.95);}
    100% { opacity: 1; transform: scale(1);}
  }

  .row {
    animation: fade-in-row 1.1s cubic-bezier(0.4,0,0.2,1);
  }

  @keyframes fade-in-row {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  .card {
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
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

  .card-title {
    font-size: 1.25rem;
    font-weight: bold;
    color: #34495e;
    margin-bottom: 0.5rem;
    animation: fade-in-card-title 1.1s cubic-bezier(0.4,0,0.2,1);
  }

  @keyframes fade-in-card-title {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  .card-text {
    font-size: 1rem;
    color: #6c757d;
  }

  .shadow-sm {
    box-shadow: 0 .125rem .25rem rgba(0, 0, 0, 0.075);
  }

  .hover-card {
    background-color: #e9ecef;
    transform: translateY(-5px) scale(1.03);
    box-shadow: 0 8px 24px rgba(66,185,131,0.10);
    transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
  }
  </style>
