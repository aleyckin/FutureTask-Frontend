<template>
    <div class="container mt-5">
      <h1 class="text-center mb-4">Ваши проекты</h1>
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
      goToProjectPage(projectId) {
        this.$router.push({ name: 'ProjectPage', params: { projectId: projectId } });
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
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .card-title {
    font-size: 1.25rem;
    font-weight: bold;
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
  }
  </style>
  