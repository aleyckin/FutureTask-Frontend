<template>
    <div class="container mt-5">
      <h1 class="text-center mb-4">Пользователи проекта</h1>

        <!-- Компонент уведомлений -->
      <Notification ref="notification" :message="notificationMessage" :type="notificationType" />

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
  import Notification from '@/components/NotificationComponent.vue';
  
  export default {
    props: ['id'],
    components: {
        AddUserModal,
        Notification,
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
          .then(() => {
            this.loadUsers();
            this.showNotification('Пользователь успешно добавлен.', 'success');
        }) 
          .catch(() => { 
            this.showNotification('Произошла ошибка при добавлении пользователя.', 'error');
        });
      },
      removeUserAsAdmin(userId) {
        DataService.delete(`/projects/projectUsers/deleteUserFromProjectAsAdmin/${userId}/${this.id}`)
          .then(() => { 
            this.loadUsers();
            this.showNotification('Пользователь успешно удалён.', 'success');
          })
          .catch(() => { 
            this.showNotification('Произошла ошибка при удалении пользователя', 'error');
          });
      },
      roleText(role) {
        return role === 0 ? 'DefaultWorker' : 'TeamLead';
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
    mounted() {
      this.loadUsers();
    }
  };
  </script>
  