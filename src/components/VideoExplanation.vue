<template>
  <div class="video-section">
    <h2>Обучение отжиманиям</h2>
    <div class="video-container">
      <iframe 
        width="560" 
        height="315" 
        src="https://rutube.ru/play/embed/ff46fa6927f5d532de1429dee83d3273/" 
        title="Отжимания обучение"
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoExplanation'
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
</style>
