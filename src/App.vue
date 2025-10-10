<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Dark theme styles */
.dark {
  color: #e5e7eb;
  background-color: #111827;
}

.dark body {
  background-color: #111827;
  color: #e5e7eb;
}

/* Light theme colors */
:root {
  --primary-color: #4d7c0f;
  --primary-light: #65a30d;
  --primary-dark: #365314;
  --secondary-color: #1e5128;
  --accent-color: #84cc16;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --background-light: #f8f9fa;
  --background-card: #ffffff;
  --border-color: #e5e7eb;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

/* Dark theme colors */
.dark {
  --primary-color: #65a30d;
  --primary-light: #84cc16;
  --primary-dark: #365314;
  --secondary-color: #0d2818;
  --accent-color: #4ade80;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --background-light: #111827;
  --background-card: #1f2937;
  --border-color: #374151;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

/* Utility classes */
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.bg-primary { background-color: var(--primary-color); }
.bg-secondary { background-color: var(--secondary-color); }
.bg-card { background-color: var(--background-card); }
.border-primary { border-color: var(--primary-color); }
.shadow-primary { box-shadow: 0 4px 6px var(--shadow-color); }

/* Smooth transitions for theme changes */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>
