<template>
    <div class="task-list">
      <h3>Ваши задачи</h3>
      <ul>
        <li 
          v-for="task in tasks" 
          :key="task.id"
          @click="$emit('selectTask', task.id)"
        >
          {{ task.title }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    props: ['tasks'],
  };
  </script>
  
  <style>
  .task-list {
    width: 30%;
    border-right: 1px solid #ddd;
    padding: 10px;
  }
  .task-list ul {
    list-style: none;
    padding: 0;
  }
  .task-list li {
    padding: 5px;
    cursor: pointer;
  }
  .task-list li:hover {
    background-color: #f0f0f0;
  }
  </style>
  