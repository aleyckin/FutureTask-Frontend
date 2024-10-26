<template>
    <div class="container mt-5">
      <h1 class="text-center mb-4">Пользователи проекта</h1>
      <div class="text-center mb-4">
        <button class="btn btn-success" @click="openAddUserModal">Добавить пользователя</button>
      </div>
  
      <ul class="list-group">
      <li
        v-for="user in users"
        :key="user.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>
          {{ user.email }} - {{ roleText(user.roleOnProject) }}
        </div>
        <button class="btn btn-danger" @click="removeUserAsAdmin(user.id)">Удалить</button>
      </li>
    </ul>
  
      <AddUserModal ref="addUserModal" @addUser="addUserToProject" />
    </div>
  </template>
  
  <script>
  import { UsersOnProject } from '@/models/UsersOnProject';
  import DataService from '../service/DataService';
  import AddUserModal from '../components/AddUserModal.vue';
  
  export default {
    props: ['id'],
    components: {
        AddUserModal,
    },
    data() {
      return { users: [] };
    },
    methods: {
      loadUsers() {
        DataService.readAll(`/projects/projectUsers/${this.id}/users`, item => new UsersOnProject(item))
          .then(users => this.users = users)
          .catch(console.log);
      },
      openAddUserModal() {
        this.$refs.addUserModal.openModal();
      },
      addUserToProject(userId, roleOnProject) {
        const projectUserDto = { userId, projectId: this.id, roleOnProject };
        DataService.create('/projects/projectUsers/addUserToProjectAsAdmin', projectUserDto)
          .then(this.loadUsers) 
          .catch(console.log);
      },
      removeUserAsAdmin(userId) {
        DataService.delete(`/projects/projectUsers/deleteUserFromProjectAsAdmin/${userId}/${this.id}`)
          .then(this.loadUsers)
          .catch(console.log);
      },
      roleText(role) {
        return role === 0 ? 'DefaultWorker' : 'TeamLead';
      },
    },
    mounted() {
      this.loadUsers();
    }
  };
  </script>
  