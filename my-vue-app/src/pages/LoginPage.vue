<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="loginUser">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          v-model="loginForm.email"
          id="email"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          v-model="loginForm.password"
          id="password"
          required
        />
      </div>
      <button type="submit" class="btn btn-primary">Login</button>
    </form>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>

import DataService from '../service/DataService';
import eventBus from '../eventBus';
import { User } from '@/models/User';

export default {
  data() {
    return {
      loginForm: {
        email: '',
        password: ''
      },
      errorMessage: ''
    };
  },
  methods: {
    async loginUser() {
      try {
        // Отправляем данные на сервер
        const response = await DataService.create('/users/login', this.loginForm);
        const user = new User(response.data.user);
        // Сохраняем токен в localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', user.email);
        localStorage.setItem('role', this.setUserRole(user.userRole));
        
        // Сообщаем о логине
        eventBus.emit('login'); // Emit the login event

        // Перенаправляем пользователя на главную страницу или другую защищенную страницу
        this.$router.push({ name: 'home' });
      } catch (error) {
        // Если возникла ошибка, показываем сообщение об ошибке
        if (error.response && error.response.status === 401) {
          this.errorMessage = 'Неверные данные';
        } else {
          this.errorMessage = 'Произошла ошибка. Попробуйте позже.';
        }
      }
    },
    setUserRole(roleNumber) {
        switch (roleNumber) {
            case 0:
                return 'RegularUser';
            case 1:
                return 'Administrator';
            default:
                return 'Unknown';
        }
    }
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center; /* Центрирование по горизонтали */
  justify-content: center; /* Центрирование по вертикали */
  height: auto; /* Задаем высоту контейнера */
}

.form-group {
  margin-bottom: 15px;
  width: 100%; /* Занимаем всю ширину контейнера */
}

.error-message {
  color: red;
}
</style>
