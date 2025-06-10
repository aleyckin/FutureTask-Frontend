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
  animation: fade-in-page 0.8s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-page {
  0% { opacity: 0; transform: translateY(30px) scale(0.98);}
  100% { opacity: 1; transform: translateY(0) scale(1);}
}

.header {
  margin-bottom: 20px;
  animation: fade-in-header 0.9s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-header {
  0% { opacity: 0; transform: translateY(-30px);}
  100% { opacity: 1; transform: translateY(0);}
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  animation: fade-in-title 1s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-title {
  0% { opacity: 0; letter-spacing: 0.2em; }
  100% { opacity: 1; letter-spacing: normal; }
}

.tagline {
  font-size: 1.2rem;
  color: #7f8c8d;
  animation: fade-in-tagline 1.2s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-tagline {
  0% { opacity: 0; transform: translateY(-10px);}
  100% { opacity: 1; transform: translateY(0);}
}

.content {
  max-width: 1000px;
  width: 100%;
  animation: fade-in-content 1.1s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-content {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.banner-image {
  width: 100%;
  height: auto;
  border-radius: 10px;
  margin-bottom: 30px;
  animation: fade-in-banner 1.2s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-banner {
  0% { opacity: 0; transform: scale(0.98);}
  100% { opacity: 1; transform: scale(1);}
}

p {
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 20px;
  animation: fade-in-p 1.2s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-p {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

h2 {
  margin-top: 30px;
  margin-bottom: 20px;
  color: #2c3e50;
  animation: fade-in-h2 1.2s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-h2 {
  0% { opacity: 0; transform: translateY(10px);}
  100% { opacity: 1; transform: translateY(0);}
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
  transition: transform 0.3s, box-shadow 0.3s;
  animation: fade-in-card 0.8s cubic-bezier(0.4,0,0.2,1);
  opacity: 0;
  animation-fill-mode: forwards;
}

.feature-card:nth-child(1) { animation-delay: 0.2s; }
.feature-card:nth-child(2) { animation-delay: 0.4s; }
.feature-card:nth-child(3) { animation-delay: 0.6s; }
.feature-card:nth-child(4) { animation-delay: 0.8s; }

@keyframes fade-in-card {
  0% { opacity: 0; transform: translateY(30px) scale(0.97);}
  100% { opacity: 1; transform: translateY(0) scale(1);}
}

.feature-card:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 8px 24px rgba(66,185,131,0.10);
}

.feature-card h3 {
  margin-bottom: 10px;
  color: #34495e;
  animation: fade-in-card-title 1.1s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-card-title {
  0% { opacity: 0; }
  100% { opacity: 1; }
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
  animation: fade-in-btn 1.3s cubic-bezier(0.4,0,0.2,1);
}

@keyframes fade-in-btn {
  0% { opacity: 0; transform: scale(0.95);}
  100% { opacity: 1; transform: scale(1);}
}

.get-started-btn:hover {
  background-color: #2c8e63;
}
</style>
