<template>
  <div class="exercise-list">
    <header class="app-header">
      <h1>🤖✨AI Тренер</h1>
      <p>Выберите упражнение для начала тренировки</p>
    </header>

    <main class="main-content">
      <div class="filters">
        <div class="filter-group">
          <label for="category-filter">Категория:</label>
          <select id="category-filter" v-model="selectedCategory" @change="filterExercises">
            <option value="">Все категории</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="difficulty-filter">Сложность:</label>
          <select id="difficulty-filter" v-model="selectedDifficulty" @change="filterExercises">
            <option value="">Все уровни</option>
            <option v-for="difficulty in difficulties" :key="difficulty" :value="difficulty">
              {{ difficulty }}
            </option>
          </select>
        </div>
      </div>

      <div class="exercises-grid">
        <div 
          v-for="exercise in filteredExercises" 
          :key="exercise.id"
          class="exercise-card"
          @click="goToExercise(exercise.id)"
        >
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
      </div>

      <div v-if="filteredExercises.length === 0" class="no-results">
        <p>Упражнений не найдено по выбранным критериям</p>
      </div>
    </main>

    <footer class="app-footer">
      <p>© 2025 🤡</p>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { exercises, getAllCategories, getAllDifficulties } from '../data/exercises.js'

export default {
  name: 'ExerciseList',
  setup() {
    const router = useRouter()
    const selectedCategory = ref('')
    const selectedDifficulty = ref('')
    const categories = ref([])
    const difficulties = ref([])
    const filteredExercises = ref([])

    const filterExercises = () => {
      filteredExercises.value = exercises.filter(exercise => {
        const categoryMatch = !selectedCategory.value || exercise.category === selectedCategory.value
        const difficultyMatch = !selectedDifficulty.value || exercise.difficulty === selectedDifficulty.value
        return categoryMatch && difficultyMatch
      })
    }

    const goToExercise = (exerciseId) => {
      router.push(`/exercise/${exerciseId}`)
    }

    onMounted(() => {
      categories.value = getAllCategories()
      difficulties.value = getAllDifficulties()
      filteredExercises.value = exercises
    })

    return {
      selectedCategory,
      selectedDifficulty,
      categories,
      difficulties,
      filteredExercises,
      filterExercises,
      goToExercise
    }
  }
}
</script>

<style scoped>
.exercise-list {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 2rem;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

.filters {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: bold;
  color: #2c3e50;
}

.filter-group select {
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.filter-group select:focus {
  outline: none;
  border-color: #667eea;
}

.exercises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

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

.no-results {
  text-align: center;
  padding: 3rem;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
}

.app-footer {
  background: #f8f9fa;
  text-align: center;
  padding: 1rem;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .filters {
    flex-direction: column;
    gap: 1rem;
  }
  
  .exercises-grid {
    grid-template-columns: 1fr;
  }
}
</style>