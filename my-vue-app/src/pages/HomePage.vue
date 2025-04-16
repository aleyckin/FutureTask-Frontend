<template>
  <div class="home-page">
    <header class="header">
      <h1>Добро пожаловать в FutureTask!</h1>
      <p class="tagline">Инновационная система управления задачами с интеллектуальным помощником.</p>
    </header>

    <main class="content">

      <p>
        FutureTask помогает эффективно управлять проектами, автоматизировать рутину и принимать более взвешенные решения благодаря встроенному ИИ-помощнику.
      </p>

      <h2>Почему FutureTask?</h2>

      <div class="features">
        <div class="feature-card">
          <h3>📌 Умное планирование</h3>
          <p>ИИ-помощник предлагает оптимальные сроки и распределяет задачи по приоритетам.</p>
        </div>
        <div class="feature-card">
          <h3>💬 Интеграция с чат-ботом</h3>
          <p>Обсуждайте задачи прямо в системе, получайте советы от ИИ по формулировке и улучшению задач.</p>
        </div>
        <div class="feature-card">
          <h3>📊 Визуализация прогресса</h3>
          <p>Интерактивная доска задач и удобные метки помогут отслеживать статус в реальном времени.</p>
        </div>
        <div class="feature-card">
          <h3>🧠 Анализ и рекомендации</h3>
          <p>ИИ анализирует вашу продуктивность и предлагает улучшения в управлении временем и ресурсами.</p>
        </div>
      </div>

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
  color: #2c3e50;
}

.tagline {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.content {
  max-width: 1000px;
  width: 100%;
}

.banner-image {
  width: 100%;
  height: auto;
  border-radius: 10px;
  margin-bottom: 30px;
}

p {
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 20px;
}

h2 {
  margin-top: 30px;
  margin-bottom: 20px;
  color: #2c3e50;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  background-color: #f4f4f4;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  margin-bottom: 10px;
  color: #34495e;
}

.get-started-btn {
  display: inline-block;
  padding: 12px 24px;
  font-size: 1rem;
  color: white;
  background-color: #42b983;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.get-started-btn:hover {
  background-color: #2c8e63;
}
</style>
