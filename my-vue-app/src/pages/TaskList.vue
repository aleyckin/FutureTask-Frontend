<template>
    <div>
      <h1>Tasks in Column: {{ column.name }}</h1>
      <ul>
        <li v-for="task in tasks" :key="task.id">
          {{ task.name }} - Assigned to: {{ task.user.name }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        column: {},
        tasks: []
      };
    },
    mounted() {
      axios.get(`/api/columns/${this.$route.params.id}/tasks`)
        .then(response => {
          this.column = response.data.column;
          this.tasks = response.data.tasks;
        })
        .catch(error => {
          console.log(error);
        });
    }
  };
  </script>
  