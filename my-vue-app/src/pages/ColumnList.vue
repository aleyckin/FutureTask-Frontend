<template>
    <div>
      <h1>Columns for Project: {{ project.name }}</h1>
      <ul>
        <li v-for="column in columns" :key="column.id">
          {{ column.name }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        project: {},
        columns: []
      };
    },
    mounted() {
      axios.get(`/api/projects/${this.$route.params.id}/columns`)
        .then(response => {
          this.project = response.data.project;
          this.columns = response.data.columns;
        })
        .catch(error => {
          console.log(error);
        });
    }
  };
  </script>
  