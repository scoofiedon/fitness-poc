<template>
  <div v-if="exercise" class="video-section">
    <h2>Видеоурок</h2>
    <div class="video-container">
      <iframe 
        width="560" 
        height="315" 
        :src="exercise.videoUrl" 
        :title="exercise.videoTitle"
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    </div>
  </div>
  <div v-else class="loading-placeholder">
    <p>Загрузка видео...</p>
  </div>
</template>

<script>
export default {
  name: 'VideoExplanation',
  props: {
    exercise: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.video-section {
  margin-bottom: 2rem;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  overflow: hidden;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
}
</style>
