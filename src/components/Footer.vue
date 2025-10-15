<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>AI Тренер</h3>
        <p>Ваш персональный фитнес-ассистент</p>
      </div>
      <div class="footer-section">
        <h4>Контакты</h4>
        <p>Здесь может быть ваша реклама))))</p>
        <h4>Сделано с ❤️ для вашего здоровья</h4>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2025 AI Тренер.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.app-footer {
  background: linear-gradient(135deg, #1e5128 0%, #4d7c0f 100%);
  color: white;
  padding: 2rem 0 1rem 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h3,
.footer-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: bold;
}

.footer-section p {
  margin: 0 0 0.5rem 0;
  opacity: 0.9;
  line-height: 1.5;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  margin: 0.5rem 0;
  opacity: 0.9;
}

.footer-bottom {
  text-align: center;
  padding: 1rem 2rem 0 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 2rem;
}

.footer-bottom p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

/* Dark theme styles */
.dark .app-footer {
  background: linear-gradient(135deg, #0d2818 0%, #1e5128 100%);
}

.dark .footer-section h3,
.dark .footer-section h4 {
  color: #4ade80;
}

.dark .footer-section p,
.dark .footer-section li {
  opacity: 0.95;
}

.dark .footer-bottom {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.dark .footer-bottom p {
  opacity: 0.7;
}

@media (max-width: 768px) {
  .app-footer {
    padding: 1.5rem 0 0.5rem 0;
  }

  .footer-content {
    padding: 0 1rem;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .footer-section h3,
  .footer-section h4 {
    font-size: 1.1rem;
  }

  .footer-bottom {
    padding: 1rem 1rem 0 1rem;
    margin-top: 1.5rem;
  }
}
</style>
