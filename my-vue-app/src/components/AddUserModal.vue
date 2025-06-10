<template>
  <div v-if="isVisible" class="modal-backdrop">
    <div class="modal-dialog modal-fade-in" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Добавить пользователя в проект</h5>
          <button type="button" class="close" @click="closeModal" aria-label="Закрыть">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="onSubmit">
            <div class="form-group mb-3">
              <label for="userSelect" class="form-label">Выберите пользователя:</label>
              <select v-model="selectedUserId" id="userSelect" class="form-control custom-select" required>
                <option value="" disabled selected>Выберите пользователя</option>
                <option v-for="user in allUsers" :key="user.id" :value="user.id">
                  {{ user.email }}
                </option>
              </select>
            </div>

            <div class="form-group mb-4">
              <label for="roleSelect" class="form-label">Роль в проекте:</label>
              <select v-model="selectedRole" id="roleSelect" class="form-control custom-select">
                <option value="" disabled selected>Выберите роль</option>
                <option v-for="role in roles" :key="role.value" :value="role">
                  {{ role.name }}
                </option>
              </select>
            </div>

            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-outline-secondary" @click="closeModal">Отмена</button>
              <button type="submit" class="btn btn-primary">Добавить</button>
            </div>
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
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-dialog {
  max-width: 400px;
  width: 100%;
  margin: 0;
}

.modal-content {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 0;
  background: #fff;
  animation: modal-fade-in 0.25s;
}

@keyframes modal-fade-in {
  from { opacity: 0; transform: translateY(-30px);}
  to { opacity: 1; transform: translateY(0);}
}

.modal-header {
  border-bottom: none;
  padding: 1.2rem 1.5rem 0.5rem 1.5rem;
  background: #f7f8fa;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.modal-title {
  font-weight: 600;
  font-size: 1.2rem;
  color: #343a40;
}

.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #888;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.close:hover {
  opacity: 1;
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.3rem;
  color: #495057;
}

.custom-select {
  border-radius: 8px;
  border: 1px solid #dee2e6;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  background: #f8f9fa;
  transition: border-color 0.2s;
}
.custom-select:focus {
  border-color: #007bff;
  outline: none;
  background: #fff;
}

.btn {
  border-radius: 8px;
  min-width: 100px;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}

.btn-primary {
  background: #007bff;
  border: none;
  color: #fff;
}
.btn-primary:hover {
  background: #0056b3;
}

.btn-outline-secondary {
  border: 1px solid #ced4da;
  background: #fff;
  color: #495057;
}
.btn-outline-secondary:hover {
  background: #f1f3f5;
  color: #007bff;
}

.d-flex {
  display: flex;
}
.justify-content-end {
  justify-content: flex-end;
}
.gap-2 {
  gap: 0.5rem;
}
.mb-3 {
  margin-bottom: 1rem;
}
.mb-4 {
  margin-bottom: 1.5rem;
}
</style>
  