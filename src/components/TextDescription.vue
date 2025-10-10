<template>
  <div v-if="exercise" class="text-section">
    <h2>tl;dw</h2>
    <div class="description">
      <h3>Важные моменты:</h3>
      <ul>
        <li v-for="point in exercise.importantPoints" :key="point">
          {{ point }}
        </li>
      </ul>

      <h3>Распространенные ошибки:</h3>
      <ul>
        <li v-for="mistake in exercise.commonMistakes" :key="mistake">
          {{ mistake }}
        </li>
      </ul>
    </div>
  </div>
  <div v-else class="loading-placeholder">
    <p>Загрузка описания...</p>
  </div>
</template>

<script>
export default {
  name: 'TextDescription',
  props: {
    exercise: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.text-section {
  background: var(--background-light);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.description h3 {
  color: var(--text-primary);
  margin-top: 1rem;
}

.description ul {
  text-align: left;
  margin-left: 1rem;
}

.description li {
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  background: var(--background-light);
  border-radius: 8px;
  color: var(--text-secondary);
}
</style>
