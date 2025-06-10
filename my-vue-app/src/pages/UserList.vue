<template>
  <!-- Компонент уведомлений -->
    <Notification ref="notification" :message="notificationMessage" :type="notificationType" />
  <div class="container user-list-container mt-5">
    <h1 class="text-center mb-4">Пользователи</h1>
    <!-- Добавить кнопку для создания пользователя -->
    <div class="mb-3 text-end">
      <button class="btn btn-primary" @click="openCreateModal">Добавить пользователя</button>
    </div>
    <div class="user-list-table-wrapper">
      <table class="user-list-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Роль</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="user-row">
            <td class="user-email">{{ user.email }}</td>
            <td>
              <span
                class="user-role"
                :class="getRoleClass(user.userRole)"
              >{{ getRoleName(user.userRole) }}</span>
            </td>
            <td>
              <button class="btn btn-edit" @click="openEditModal(user)">Редактировать</button>
              <button class="btn btn-remove" @click="deleteUser(user.id)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Модальное окно для создания/редактирования пользователя -->
    <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="userModalLabel">{{ isEditing ? 'Редактировать пользователя' : 'Создать пользователя' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="isEditing ? updateUser() : createUser()">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" v-model="userForm.email" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Пароль</label>
                <input type="password" class="form-control" v-model="userForm.password" :required="!isEditing">
              </div>
              <div class="mb-3">
                <label for="specialization" class="form-label">Специализация</label>
                <select class="form-control" v-model="userForm.specializationId" required>
                  <option v-for="specialization in specializations" :key="specialization.id" :value="specialization.id">
                    {{ specialization.name }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label for="role" class="form-label">Роль</label>
                <select class="form-control" v-model="userForm.userRole" required>
                  <option value="0">Обычный пользователь</option>
                  <option value="1">Администратор</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary">{{ isEditing ? 'Сохранить изменения' : 'Создать пользователя' }}</button>
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
import Notification from '@/components/NotificationComponent.vue'

export default {
  components: {
    Notification
  },
  data() {
    return {
      users: [],
      specializations: [],
      isLoading: false,
      userForm: {
        email: '',
        password: '',
        specializationId: '',
        userRole: 0
      },
      isEditing: false,
      editingUserId: null,
      notificationMessage: '',
      notificationType: 'success',
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
        this.showNotification('Возникла ошибка при загрузке пользователей.', 'error');
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
        this.showNotification('Возникла ошибка при загрузке специализаций.', 'error');
        });
    },
    // Открытие модального окна для создания нового пользователя
    openCreateModal() {
      this.isEditing = false;
      this.userForm = {
        email: '',
        password: '',
        specializationId: '',
        userRole: 0
      };
      const modal = new Modal(document.getElementById('userModal'));
      modal.show();
    },
    // Открытие модального окна для редактирования пользователя
    openEditModal(user) {
      this.isEditing = true;
      this.editingUserId = user.id;
      this.userForm = {
        ...user,
        specializationId: user.specialization ? user.specialization.id : '',
        password: ''
      };
      const modal = new Modal(document.getElementById('userModal'));
      modal.show();
    },
    // Создание нового пользователя
    createUser() {
      this.userForm.userRole = Number(this.userForm.userRole);
      this.clearNotification();
      this.isLoading = true;
      const modal = Modal.getInstance(document.getElementById('userModal'));

      DataService.create('/users', this.userForm)
        .then(() => {
          this.loadUsers();
          this.showNotification('Создание пользователя прошло успешно!', 'success');
        })
        .catch(error => {
          this.handleError(error, 'Ошибка при создании пользователя');
        })
        .finally(() => {
          this.isLoading = false;
          modal.hide();
        });
    },

    // Обновление данных пользователя
    updateUser() {
      this.clearNotification();
      this.isLoading = true;
      this.userForm.userRole = Number(this.userForm.userRole);
      const modal = Modal.getInstance(document.getElementById('userModal'));

      DataService.update(`/users/${this.editingUserId}`, this.userForm)
      .then(() => {
          this.loadUsers();
          this.showNotification('Создание пользователя прошло успешно!', 'success');
        })
        .catch(error => {
          this.handleError(error, 'Ошибка при обновлении данных пользователя');
        })
        .finally(() => {
          this.isLoading = false;
          modal.hide();
        });
    },
    // Удаление пользователя
    deleteUser(userId) {
      if (confirm('Are you sure you want to delete this user?')) {
        DataService.delete(`/users/${userId}`)
          .then(() => {
            this.loadUsers();
            this.showNotification('Пользователь успешно удалён!', 'success');
          })
          .catch(error => {
            console.log(error);
            this.showNotification('Возникла ошибка при удалении пользователя.', 'error');
          });
      }
    },
    showNotification(message, type = 'success') {
      this.notificationMessage = message;
      this.notificationType = type;
      if (this.$refs.notification) {
        this.$refs.notification.visible = true;
      }
    },
    // Метод для очистки уведомления
    clearNotification() {
      this.notificationMessage = '';
      this.$refs.notification.visible = false;
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
    getRoleName(role) {
      // Преобразование числового значения роли в строку
      switch (role) {
        case 1:
        case '1':
          return 'Администратор';
        case 0:
        case '0':
          return 'Обычный пользователь';
        case 2:
        case '2':
          return 'Тимлид';
        default:
          return 'Неизвестно';
      }
    },
    getRoleClass(role) {
      // Для CSS-класса
      switch (role) {
        case 1:
        case '1':
          return 'Administrator';
        case 2:
        case '2':
          return 'TeamLead';
        case 0:
        case '0':
          return 'DefaultWorker';
        default:
          return '';
      }
    },
    }
};
</script>

<style scoped>
.user-list-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 16px 24px 16px;
  background: linear-gradient(120deg, #f7fafc 70%, #e3e9f7 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(60, 80, 180, 0.10), 0 2px 8px rgba(0,0,0,0.04);
  animation: fade-in-page 0.8s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-page {
  0% { opacity: 0; transform: translateY(30px) scale(0.98);}
  100% { opacity: 1; transform: translateY(0) scale(1);}
}

h1 {
  font-size: 1.7rem;
  color: #2d3a4a;
  margin-bottom: 2.2rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  animation: fade-in-title 1s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-title {
  0% { opacity: 0; letter-spacing: 0.2em; }
  100% { opacity: 1; letter-spacing: normal; }
}

.user-list-table-wrapper {
  overflow-x: auto;
  margin-top: 18px;
}

.user-list-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(60, 80, 180, 0.06);
  overflow: hidden;
  animation: fade-in-table 0.7s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-table {
  0% { opacity: 0; transform: translateY(30px);}
  100% { opacity: 1; transform: translateY(0);}
}

.user-list-table th, .user-list-table td {
  padding: 16px 18px;
  text-align: left;
  font-size: 1.05rem;
}

.user-list-table th {
  background: #f7fafc;
  color: #3576e6;
  font-weight: 700;
  border-bottom: 2px solid #e3e9f7;
}

.user-list-table tbody tr {
  transition: background 0.18s, box-shadow 0.18s;
}

.user-list-table tbody tr.user-row:hover {
  background: #f0f4ff;
  box-shadow: 0 4px 18px rgba(60, 80, 180, 0.10);
}

.user-email {
  font-weight: 500;
  color: #2d3a4a;
}

.user-role {
  font-size: 0.98rem;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 12px;
  background: #e3e9f7;
  color: #3576e6;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}
.user-role.Administrator {
  background: #43e97b;
  color: #fff;
}
.user-role.TeamLead {
  background: #4f8cff;
  color: #fff;
}
.user-role.DefaultWorker {
  background: #fbc531;
  color: #fff;
}

.btn {
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.01rem;
  min-width: 90px;
  padding: 10px 22px;
  margin-right: 8px;
  box-shadow: 0 1px 4px rgba(79, 140, 255, 0.07);
  transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s;
  outline: none;
  border: none;
}

.btn-primary {
  background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%);
  color: #fff;
}
.btn-primary:hover, .btn-primary:focus {
  background: linear-gradient(90deg, #388e3c 0%, #5cb85c 100%);
  color: #fff;
  transform: translateY(-1px) scale(1.03);
}

.btn-edit {
  background: linear-gradient(90deg, #4f8cff 0%, #6fd6ff 100%);
  color: #fff;
}
.btn-edit:hover, .btn-edit:focus {
  background: linear-gradient(90deg, #3576e6 0%, #4fd2ff 100%);
  color: #fff;
  transform: translateY(-1px) scale(1.03);
}

.btn-remove {
  background: linear-gradient(90deg, #ff5858 0%, #f09819 100%);
  color: #fff;
}
.btn-remove:hover, .btn-remove:focus {
  background: linear-gradient(90deg, #e53935 0%, #fbc531 100%);
  color: #fff;
  transform: translateY(-1px) scale(1.03);
}

@media (max-width: 700px) {
  .user-list-container {
    padding: 10px 2vw;
    border-radius: 10px;
  }
  .user-list-table th, .user-list-table td {
    padding: 10px 6px;
    font-size: 0.97rem;
  }
}
</style>
