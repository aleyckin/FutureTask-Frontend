<template>
    <div v-if="isVisible" class="modal fade show" tabindex="-1" role="dialog" style="display: block;">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Добавить пользователя в проект</h5>
            <button type="button" class="close" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="onSubmit">
              <div class="form-group">
                <label for="userSelect">Выберите пользователя:</label>
                <select v-model="selectedUserId" id="userSelect" class="form-control" required>
                  <option v-for="user in allUsers" :key="user.id" :value="user.id">
                    {{ user.email }}
                  </option>
                </select>
              </div>
  
              <div class="form-group">
                <label for="roleSelect">Роль в проекте:</label>
                <select v-model="selectedRole" id="roleSelect" class="form-control">
                  <option v-for="role in roles" :key="role.value" :value="role">
                      {{ role.name }}
                  </option>
                </select>
              </div>
  
              <button type="submit" class="btn btn-primary">Добавить</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { User } from '@/models/User';
  import DataService from '../service/DataService';
  
  export default {
    data() {
      return {
        isVisible: false,
        allUsers: [],
        selectedUserId: null,
        selectedRole: null,
        roles: [
            { name: 'DefaultWorker', value: 0 },
            { name: 'TeamLead', value: 1 }
        ]
      };
    },
    methods: {
      openModal() {
        this.isVisible = true;
        this.loadAllUsers();
      },
      closeModal() {
        this.isVisible = false;
      },
      loadAllUsers() {
        DataService.readAll('/users', item => new User(item))
          .then(users => {
            this.allUsers = users;
          })
          .catch(console.log);
      },
      onSubmit() {
        const projectUserDto = {
            userId: this.selectedUserId,
            roleOnProject: this.selectedRole ? this.selectedRole.value : null
        };
        this.$emit('addUser', projectUserDto.userId, projectUserDto.roleOnProject);
        this.closeModal();
      }
    }
  };
  </script>
  
  <style scoped>
  .modal-content {
    border-radius: 8px;
  }
  
  .modal.show {
    display: block;
    background-color: rgba(0, 0, 0, 0.5);
  }
  </style>
  