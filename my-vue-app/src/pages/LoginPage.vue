<template>
  <div class="login-container">
    <h1 class="form-title">Вход в систему</h1>
    <form @submit.prevent="loginUser" class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          v-model="loginForm.email"
          id="email"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Пароль</label>
        <input
          type="password"
          v-model="loginForm.password"
          id="password"
          class="form-control"
          required
        />
      </div>
      <button type="submit" class="btn btn-primary">Войти</button>
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
        if (error.response) {
            // Сервер ответил с ошибкой
            const errorData = error.response.data;
            this.errorMessage = errorData.error || 'Неизвестная ошибка сервера';
            
            // Дополнительная обработка специфичных статусов
            if (error.response.status === 401) {
                this.errorMessage = 'Неверные учетные данные';
            }
        } else if (error.request) {
            // Запрос был отправлен, но ответ не получен
            this.errorMessage = 'Сервер не ответил. Проверьте подключение к интернету';
        } else {
            // Ошибка при настройке запроса
            this.errorMessage = 'Ошибка при отправке запроса: ' + error.message;
        }
        
        // Автоматическое скрытие ошибки через 5 секунд
        setTimeout(() => {
            this.errorMessage = '';
        }, 5000);
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
  width: 100%;
  padding: 30px 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.login-form {
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

label {
  margin-bottom: 6px;
  font-weight: 500;
}

input.form-control {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.error-message {
  color: #dc3545;
  background: #f8d7da;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #f5c6cb;
  margin-top: 15px;
  text-align: center;
  animation: slideIn 0.3s ease-out;
}

.form-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
