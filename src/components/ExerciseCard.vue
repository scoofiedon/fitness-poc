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
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.exercise-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  color: #2c3e50;
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
  color: #666;
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
  background: #e3f2fd;
  color: #1565c0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.name-en {
  color: #666;
  font-style: italic;
}

.card-footer {
  text-align: center;
}

.start-btn {
  background: #667eea;
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
  background: #5a67d8;
}
</style>