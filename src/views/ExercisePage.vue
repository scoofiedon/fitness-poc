<template>
  <div class="exercise-page">
    <header class="exercise-header" v-if="exercise">
      <button class="back-btn" @click="goBack">← Назад</button>
      <div class="header-content">
        <h1>{{ exercise.name }}</h1>
        <div class="exercise-meta">
          <span class="category">{{ exercise.category }}</span>
          <span class="difficulty" :class="exercise.difficultyEn.toLowerCase()">
            {{ exercise.difficulty }}
          </span>
          <span class="name-en">{{ exercise.nameEn }}</span>
        </div>
      </div>
    </header>

    <main class="exercise-main">
      <div v-if="exercise" class="exercise-content">
        <div  class="left-column">
          <VideoExplanation :exercise="exercise" />
          <TextDescription :exercise="exercise" />
        </div>
        <div v-if="exercise.poseDetectionReady" class="right-column">
          <PoseDetection
            :exercise-data="exercise.poseDetection"
            :exercise-name="exercise.name"
          />
        </div>
        <div v-else class="right-column">
          <h2>Робот ещё не научился делать это упражнение,
            но ему очень жалко, и поэтому он попросил показать кота..
          </h2>
          <img style=" display: block; margin: auto; " src="https://cataas.com/cat?width=320">
        </div>
      </div>

      <div v-else class="loading-state">
        <p>Загрузка упражнения...</p>
      </div>
    </main>

    <footer class="app-footer">
      <p>© 2025 🤡</p>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getExerciseById } from '../data/exercises.js'
import VideoExplanation from '../components/VideoExplanation.vue'
import TextDescription from '../components/TextDescription.vue'
import PoseDetection from '../components/PoseDetection.vue'

export default {
  name: 'ExercisePage',
  components: {
    VideoExplanation,
    TextDescription,
    PoseDetection
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const exercise = ref(null)

    const goBack = () => {
      router.go(-1)
    }

    onMounted(() => {
      const exerciseId = route.params.id
      exercise.value = getExerciseById(exerciseId)

      if (!exercise.value) {
        router.push('/')
      }
    })

    return {
      exercise,
      goBack
    }
  }
}
</script>

<style scoped>
.exercise-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.exercise-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  /* position: sticky;  */
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: background 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header-content {
  text-align: center;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.exercise-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.category {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.difficulty {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: bold;
  text-transform: uppercase;
}

.difficulty.beginner {
  background: #d4edda;
  color: #155724;
}

.difficulty.medium {
  background: #fff3cd;
  color: #856404;
}

.difficulty.advanced {
  background: #f8d7da;
  color: #721c24;
}

.name-en {
  font-style: italic;
  opacity: 0.9;
}

.exercise-main {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

.exercise-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.right-column {
  position: sticky;
  top: 120px;
  height: fit-content;
}

/* .exercise-content h2 {
  text-align: center;
} */

.app-footer {
  background: #f8f9fa;
  text-align: center;
  padding: 1rem;
}

@media (max-width: 1024px) {
  .exercise-content {
    grid-template-columns: 1fr;
  }

  .right-column {
    position: static;
  }
}

@media (max-width: 768px) {
  .exercise-header {
    padding: 1rem;
  }

  .header-content h1 {
    font-size: 1.5rem;
  }

  .exercise-main {
    padding: 1rem;
  }

  .exercise-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.2rem;
  color: #666;
}
</style>
