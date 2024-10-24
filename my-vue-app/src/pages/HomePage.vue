<template>
    <div class="home-page">
      <header class="header">
        <h1>Welcome to TaskTracker!</h1>
        <p class="tagline">Manage your tasks, boost your productivity, and stay organized.</p>
      </header>
  
      <main class="content">
        <img class="banner-image" src="https://source.unsplash.com/800x400/?task,work" alt="Task Management">
        <p>
          TaskTracker is your personal project manager. Easily create, track, and manage your tasks all in one place.
        </p>
        <p>
          Ready to take control of your tasks and projects? Let's get started!
        </p>
        <router-link to="/tasks" class="get-started-btn">Get Started</router-link>
      </main>
    </div>
  </template>

<script>
export default {
  name: 'HomePage'
};
</script>



<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.header {
  margin-bottom: 20px;
}

h1 {
  font-size: 2.5rem;
  color: #333;
}

.tagline {
  font-size: 1.2rem;
  color: #666;
}

.content {
  max-width: 800px;
}

.banner-image {
  width: 100%;
  height: auto;
  border-radius: 10px;
  margin-bottom: 20px;
}

p {
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 20px;
}

.get-started-btn {
  display: inline-block;
  padding: 10px 20px;
  font-size: 1rem;
  color: white;
  background-color: #42b983;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.get-started-btn:hover {
  background-color: #2c8e63;
}
</style>


