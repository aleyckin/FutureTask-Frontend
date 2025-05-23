<template>
  <div class="container mt-5 project-details-container">
    <h1 class="text-center mb-4">Пользователи проекта</h1>

    <!-- Компонент уведомлений -->
    <Notification ref="notification" :message="notificationMessage" :type="notificationType" />

    <div class="text-center mb-4">
      <button class="btn btn-add-user" @click="openAddUserModal">Добавить пользователя</button>
    </div>

    <ul class="user-list">
      <li
        v-for="user in users"
        :key="user.id"
        class="user-list-item"
      >
        <div class="user-info">
          <span class="user-email">{{ user.email }}</span>
          <span class="user-role" :class="roleText(user.roleOnProject)">{{ roleText(user.roleOnProject) }}</span>
        </div>
        <button class="btn btn-remove-user" @click="removeUser(user.id)">Удалить</button>
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
    return { 
      notificationMessage: '',
      notificationType: 'success',
      users: [] };
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
      DataService.create(`/projects/projectUsers/addUserToProject/${this.id}`, projectUserDto)
        .then(() => {
          this.loadUsers();
          this.showNotification('Пользователь успешно добавлен.', 'success');
      }) 
        .catch(() => { 
          this.showNotification('Произошла ошибка при добавлении пользователя.', 'error');
      });
    },
    removeUser(userId) {
      DataService.delete(`/projects/projectUsers/deleteUserFromProject/${userId}/${this.id}`)
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

<style scoped>
.project-details-container {
  max-width: 700px;
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

.btn-add-user {
  background: linear-gradient(90deg, #4f8cff 0%, #6fd6ff 100%);
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 16px;
  padding: 12px 32px;
  font-size: 1.08rem;
  box-shadow: 0 2px 12px rgba(79, 140, 255, 0.10);
  transition: background 0.18s, box-shadow 0.18s, transform 0.18s;
  letter-spacing: 0.01em;
  outline: none;
}
.btn-add-user:hover, .btn-add-user:focus {
  background: linear-gradient(90deg, #3576e6 0%, #4fd2ff 100%);
  box-shadow: 0 4px 18px rgba(79, 140, 255, 0.18);
  color: #fff;
  transform: translateY(-2px) scale(1.03);
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 24px;
  animation: fade-in-row 1.1s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-row {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.user-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f7fafc;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(60, 80, 180, 0.06);
  padding: 18px 22px;
  margin-bottom: 18px;
  border: 1px solid #e3e9f7;
  transition: box-shadow 0.18s, transform 0.18s, background 0.18s;
  animation: fade-in-card 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
  opacity: 0;
}
.user-list-item:nth-child(1) { animation-delay: 0.1s; }
.user-list-item:nth-child(2) { animation-delay: 0.2s; }
.user-list-item:nth-child(3) { animation-delay: 0.3s; }
.user-list-item:nth-child(4) { animation-delay: 0.4s; }

@keyframes fade-in-card {
  0% { opacity: 0; transform: translateY(30px) scale(0.97);}
  100% { opacity: 1; transform: translateY(0) scale(1);}
}

.user-list-item:hover {
  box-shadow: 0 8px 24px rgba(60, 80, 180, 0.13);
  background: #f0f4ff;
  transform: translateY(-2px) scale(1.01);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 18px;
}

.user-email {
  font-size: 1.08rem;
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
  margin-left: 8px;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}
.user-role.TeamLead {
  background: #43e97b;
  color: #fff;
}
.user-role.DefaultWorker {
  background: #fbc531;
  color: #fff;
}

.btn-remove-user {
  background: linear-gradient(90deg, #ff5858 0%, #f09819 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 8px 22px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 1px 4px rgba(220,53,69,0.07);
  transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s;
  outline: none;
}
.btn-remove-user:hover, .btn-remove-user:focus {
  background: linear-gradient(90deg, #e53935 0%, #fbc531 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(220,53,69,0.10);
  transform: translateY(-1px) scale(1.03);
}

@media (max-width: 700px) {
  .project-details-container {
    padding: 10px 2vw;
    border-radius: 10px;
  }
  .user-list-item {
    padding: 12px 8px;
  }
  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>
