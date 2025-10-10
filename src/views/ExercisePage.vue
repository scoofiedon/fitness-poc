<template>
  <div class="exercise-page">
    <AppHeader />

    <main class="exercise-main">
      <div v-if="exercise" class="exercise-content">
        <div class="left-column">
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
          <img style="display: block; margin: auto; border-radius: 6px;" src="https://cataas.com/cat?width=320">
        </div>
      </div>

      <div v-else class="loading-state">
        <p>Загрузка упражнения...</p>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getExerciseById } from '../data/exercises.js'
import VideoExplanation from '../components/VideoExplanation.vue'
import TextDescription from '../components/TextDescription.vue'
import PoseDetection from '../components/PoseDetection.vue'
import AppHeader from '../components/Header.vue'
import AppFooter from '../components/Footer.vue'

export default {
  name: 'ExercisePage',
  components: {
    VideoExplanation,
    TextDescription,
    PoseDetection,
    AppHeader,
    AppFooter
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const exercise = ref(null)

    onMounted(() => {
      const exerciseId = route.params.id
      exercise.value = getExerciseById(exerciseId)

      if (!exercise.value) {
        router.push('/')
      }
    })

    return {
      exercise
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

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 1.2rem;
  color: var(--text-secondary);
}

/* Dark theme styles */
.dark .loading-state {
  color: var(--text-secondary);
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
  .exercise-main {
    padding: 1rem;
  }
}
</style>
