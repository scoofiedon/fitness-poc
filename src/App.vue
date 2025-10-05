<template>
  <div id="app">
    <header class="app-header">
      <h1>💪 Тренер: Отжимания</h1>
      <p>Proof of Concept</p>
    </header>
    
    <main class="app-main">
      <VideoExplanation />
      <TextDescription />
      <PoseDetection />
    </main>
    
    <footer class="app-footer">
      <p>© 2025 🤡</p>
    </footer>
  </div>
</template>

<script>
import VideoExplanation from './components/VideoExplanation.vue'
import TextDescription from './components/TextDescription.vue'
import PoseDetection from './components/PoseDetection.vue'

export default {
  name: 'App',
  components: {
    VideoExplanation,
    TextDescription,
    PoseDetection
  }
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
}

#app {
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

.app-main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

.app-footer {
  background: #f8f9fa;
  text-align: center;
  padding: 1rem;
  margin-top: 2rem;
}
</style>