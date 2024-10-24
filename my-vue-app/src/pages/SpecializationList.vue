<template>
    <div>
      <h1>Specializations</h1>
      <ul>
        <li v-for="specialization in specializations" :key="specialization.id">
          {{ specialization.name }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        specializations: []
      };
    },
    mounted() {
      axios.get('/api/specializations')
        .then(response => {
          this.specializations = response.data;
        })
        .catch(error => {
          console.log(error);
        });
    }
  };
  </script>
  