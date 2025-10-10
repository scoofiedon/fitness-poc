<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo-section">
        <router-link to="/" class="logo-link">
          <h1>🤖✨AI Тренер</h1>
        </router-link>
        <p>Ваш персональный фитнес-ассистент</p>
      </div>
      <div class="header-actions">
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Светлая тема' : 'Тёмная тема'">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'AppHeader',
  setup() {
    const isDark = ref(false)

    const toggleTheme = () => {
      isDark.value = !isDark.value
      document.documentElement.classList.toggle('dark', isDark.value)
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }

    const loadTheme = () => {
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
      document.documentElement.classList.toggle('dark', isDark.value)
    }

    onMounted(() => {
      loadTheme()
    })

    return {
      isDark,
      toggleTheme
    }
  }
}
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #1e5128 0%, #4d7c0f 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.75rem;
  font-weight: bold;
}

.logo-link {
  text-decoration: none;
  color: inherit;
  display: inline-block;
}

.logo-link:hover h1 {
  opacity: 0.8;
  transform: scale(1.02);
  transition: all 0.3s ease;
}

.logo-section p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.3rem 0.4rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.6rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* Dark theme styles */
.dark .app-header {
  background: linear-gradient(135deg, #0d2818 0%, #1e5128 100%);
}

.dark .theme-toggle {
  background: rgba(255, 255, 255, 0.1);
}

.dark .theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .logo-section h1 {
    font-size: 1.5rem;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
