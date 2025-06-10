<template>
  <nav v-if="token" class="navbar navbar-expand-lg navbar-light bg-light shadow">
    <div class="container-fluid">
      <router-link to="/home" class="navbar-brand d-flex align-items-center">
        <img src="../assets/logo.png" alt="Logo" width="40" height="40" class="me-2">
        <span class="fs-4 fw-bold">FutureTask</span>
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav justify-content-center flex-grow-1">
          <li class="nav-item">
            <router-link v-if="role === 'Administrator'" to="/users" class="nav-link">Пользователи</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/projects" class="nav-link">Управление проектами</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/projectsForUser" class="nav-link">Мои проекты</router-link>
          </li>
        </ul>
        <div class="d-flex align-items-center ms-auto">
          <span v-if="user" class="navbar-text me-3">Пользователь: <strong>{{ user }}</strong></span>
          <button type="button" class="btn btn-outline-secondary btn-sm logout-btn" @click="logout()">Выйти</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import eventBus from '../eventBus';

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
    eventBus.on('login', this.getUserData);
  },
  beforeUnmount() {
    eventBus.off('login', this.getUserData);
  },
  methods: {
    getUserData() {
      this.user = localStorage.getItem("user") || '';
      this.role = localStorage.getItem("role") || '';
      this.token = localStorage.getItem("token");
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
.navbar {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
    animation: navbar-fade-in 0.7s cubic-bezier(0.4,0,0.2,1);
}

@keyframes navbar-fade-in {
    0% {
        opacity: 0;
        transform: translateY(-30px) scale(0.98);
        box-shadow: none;
    }
    70% {
        opacity: 1;
        transform: translateY(5px) scale(1.01);
        box-shadow: 0 8px 24px rgba(0,0,0,0.10);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        box-shadow: 0 4px 16px rgba(0,0,0,0.07);
    }
}

.navbar-brand {
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    font-weight: bold;
}

.navbar-brand img {
    border-radius: 50%;
    transition: transform 0.3s ease;
}

.navbar-brand img:hover {
    transform: scale(1.1);
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

.logout-btn {
    border-radius: 20px;
    padding: 6px 18px;
    font-size: 0.95rem;
    font-weight: 500;
    border: 1px solid #adb5bd;
    background: transparent;
    color: #495057;
    transition: background 0.2s, color 0.2s, border 0.2s;
    margin-left: 10px;
}

.logout-btn:hover, .logout-btn:focus {
    background: #f8f9fa;
    color: #dc3545;
    border-color: #dc3545;
}

.btn-danger {
    transition: background-color 0.3s ease-in-out;
}

.btn-danger:hover {
    background-color: #c82333;
}
</style>