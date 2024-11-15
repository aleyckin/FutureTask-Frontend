<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">User List</h1>

    <!-- Кнопка для создания нового пользователя -->
    <div class="text-center mb-4">
      <button class="btn btn-success" @click="openCreateModal">Create New User</button>
    </div>

    <!-- Список пользователей -->
    <div class="row">
      <div class="col-md-4" v-for="user in users" :key="user.id">
        <div class="card mb-4 shadow-sm">
          <div class="card-body" @click="openEditModal(user)">
            <h5 class="card-title">{{ user.email }}</h5>
            <p class="card-text">
              Specialization: 
              <span v-if="user.specializationName">{{ user.specializationName }}</span>
              <span v-else>No specialization</span>
            </p>
            <p class="card-text">
              UserRole: 
              <span v-if="user.userRole === 0">RegularUser</span>
              <span v-else-if="user.userRole === 1">Administrator</span>
              <span v-else>No UserRole</span>
            </p>
            <!-- Кнопка удаления -->
            <button class="btn btn-danger" @click.stop="deleteUser(user.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для создания/редактирования пользователя -->
    <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="userModalLabel">{{ isEditing ? 'Edit User' : 'Create User' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="isEditing ? updateUser() : createUser()">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" v-model="userForm.email" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" v-model="userForm.password" :required="!isEditing">
              </div>
              <div class="mb-3">
                <label for="specialization" class="form-label">Specialization</label>
                <select class="form-control" v-model="userForm.specializationId" required>
                  <option v-for="specialization in specializations" :key="specialization.id" :value="specialization.id">
                    {{ specialization.name }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label for="role" class="form-label">User Role</label>
                <select class="form-control" v-model="userForm.userRole" required>
                  <option value="0">RegularUser</option>
                  <option value="1">Administrator</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary">{{ isEditing ? 'Save Changes' : 'Create User' }}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DataService from '../service/DataService';
import { User } from '../models/User';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Modal } from 'bootstrap';
import { Specialization } from '@/models/Specialization';

export default {
  data() {
    return {
      users: [],
      specializations: [], // Список специализаций
      userForm: {
        email: '',
        password: '',
        specializationId: '', // Используем specializationId вместо объекта
        userRole: 0
      },
      isEditing: false,
      editingUserId: null
    };
  },
  mounted() {
    this.loadSpecializations();
    this.loadUsers();
  },
  methods: {
    // Загрузка всех пользователей
    loadUsers() {
      DataService.readAll('/users', item => new User(item))
        .then(users => {
          this.users = users;
        })
        .catch(error => {
          console.log(error);
        });
    },
    // Загрузка всех специализаций
    loadSpecializations() {
      DataService.readAll('/specializations', item => new Specialization(item))
        .then(specializations => {
          this.specializations = specializations;
        })
        .catch(error => {
          console.log(error);
        });
    },
    // Открытие модального окна для создания нового пользователя
    openCreateModal() {
      this.isEditing = false;
      this.userForm = {
        email: '',
        password: '',
        specializationId: '', // Сброс поля специализации
        userRole: 0
      };
      const modal = new Modal(document.getElementById('userModal'));
      modal.show();
    },
    // Открытие модального окна для редактирования пользователя
    openEditModal(user) {
      this.isEditing = true;
      this.editingUserId = user.id;
      this.userForm = { ...user, specializationId: user.specialization.id }; // Устанавливаем specializationId
      const modal = new Modal(document.getElementById('userModal'));
      modal.show();
    },
    // Создание нового пользователя
    createUser() {
      this.userForm.userRole = Number(this.userForm.userRole);

      DataService.create('/users', this.userForm)
        .then(() => {
          this.loadUsers();
          const modal = Modal.getInstance(document.getElementById('userModal'));
          modal.hide();
        })
        .catch(error => console.log(error));
    },
    // Обновление данных пользователя
    updateUser() {
      this.userForm.userRole = Number(this.userForm.userRole);

      DataService.update(`/users/${this.editingUserId}`, this.userForm)
        .then(() => {
          this.loadUsers();
          const modal = Modal.getInstance(document.getElementById('userModal'));
          modal.hide();
        })
        .catch(error => console.log(error));
    },
    // Удаление пользователя
    deleteUser(userId) {
      if (confirm('Are you sure you want to delete this user?')) {
        DataService.delete(`/users/${userId}`)
          .then(() => {
            this.loadUsers();
          })
          .catch(error => console.log(error));
      }
    },
  }
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

.btn-success {
  padding: 10px 20px;
  font-size: 1.1rem;
}
</style>
