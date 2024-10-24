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
import eventBus from '../eventBus'; // Импортируем eventBus

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
        
        // Сохраняем токен в localStorage
        localStorage.setItem('token', response.data);
        localStorage.setItem('user', this.loginForm.email);
        localStorage.setItem('role', 'Administrator');

        // Сообщаем о логине
        eventBus.emit('login'); // Emit the login event

        // Перенаправляем пользователя на главную страницу или другую защищенную страницу
        this.$router.push({ name: 'home' });
      } catch (error) {
        // Если возникла ошибка, показываем сообщение об ошибке
        if (error.response && error.response.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else {
          this.errorMessage = 'An error occurred. Please try again later.';
        }
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
