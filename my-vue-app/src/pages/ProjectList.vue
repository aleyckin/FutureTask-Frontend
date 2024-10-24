<template>
    <div>
      <h1>Projects</h1>
      <ul>
        <li v-for="project in projects" :key="project.id">
          {{ project.name }}
          <ul>
            <li v-for="user in project.users" :key="user.id">
              {{ user.name }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        projects: []
      };
    },
    mounted() {
      axios.get('/api/projects')
        .then(response => {
          this.projects = response.data;
        })
        .catch(error => {
          console.log(error);
        });
    }
  };
  </script>
  