<template>
  <div class="exercise-card" @click="$emit('select', exercise)">
    <div class="card-header">
      <h3>{{ exercise.name }}</h3>
      <span class="difficulty-badge" :class="exercise.difficulty.toLowerCase()">
        {{ exercise.difficulty }}
      </span>
    </div>

    <div class="card-content">
      <p class="description">{{ exercise.description }}</p>
      <div class="exercise-meta">
        <span class="category">{{ exercise.category }}</span>
        <span class="name-en">{{ exercise.nameEn }}</span>
      </div>
    </div>

    <div class="card-footer">
      <button class="start-btn">Начать тренировку</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExerciseCard',
  props: {
    exercise: {
      type: Object,
      required: true
    }
  },
  emits: ['select']
}
</script>

<style scoped>
.exercise-card {
  background: var(--background-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px var(--shadow-color);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.exercise-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px var(--shadow-color);
  border-color: var(--primary-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.25rem;
}

.difficulty-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: bold;
  text-transform: uppercase;
}

.difficulty-badge.beginner {
  background: #d4edda;
  color: #155724;
}

.difficulty-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.difficulty-badge.advanced {
  background: #f8d7da;
  color: #721c24;
}

.card-content {
  margin-bottom: 1.5rem;
}

.description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.exercise-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.category {
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.name-en {
  color: var(--text-secondary);
  font-style: italic;
}

.card-footer {
  text-align: center;
}

.start-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  width: 100%;
}

.start-btn:hover {
  background: var(--primary-dark);
}
</style>
