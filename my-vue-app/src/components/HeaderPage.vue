<template>
  <nav v-if="token" class="navbar navbar-expand-lg navbar-light bg-light shadow">
    <div class="container-fluid">
      <router-link to="/home" class="navbar-brand">
        <img src="../assets/logo.png" alt="Logo" width="30" height="30" class="d-inline-block align-text-top">
        FutureTask
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav justify-content-center">
          <li class="nav-item">
            <router-link v-if="role === 'Administrator'" to="/users" class="nav-link">Пользователи</router-link>
          </li>
          <li class="nav-item">
            <button type="button" class="btn btn-danger ms-3" @click="logout()">Разлогиниться</button>
          </li>
        </ul>
        <div class="navbar-text ms-auto">
          <span v-if="user">Пользователь: <strong>{{ user }}</strong></span>
          <span v-if="role"> | Роль: <strong>{{ role }}</strong></span>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import eventBus from '../eventBus'; // Импортируем eventBus

export default {
  data() {
    return {
      token: localStorage.getItem("token"),
      user: '',
      role: ''
    };
  },
  mounted() {
    this.getUserData();
    eventBus.on('login', this.getUserData); // Слушаем событие логина
  },
  beforeUnmount() {
    eventBus.off('login', this.getUserData); // Убираем слушателя при уничтожении
  },
  methods: {
    getUserData() {
      this.user = localStorage.getItem("user") || '';
      this.role = localStorage.getItem("role") || '';
      this.token = localStorage.getItem("token"); // Обновляем токен
    },
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      this.token = null;
      this.user = '';
      this.role = '';
      this.$router.push('/login');
    }
  }
}
</script>

<style>
.navbar-brand {
    font-size: 1.5rem;
    font-weight: bold;
}

.nav-link {
    color: black;
    font-weight: bold;
    text-transform: uppercase;
    transition: color 0.3s ease-in-out;
}

.nav-link:hover {
    color: #dc3545;
}

.navbar-text {
    font-size: 1rem;
}

.btn-danger {
    transition: background-color 0.3s ease-in-out;
}

.btn-danger:hover {
    background-color: #c82333; /* Темнее цвет для ховера */
}
</style>