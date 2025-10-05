<template>
  <div class="text-section">
    <h2>tl;dw</h2>
    <div class="description">
      <h3>Важные моменты:</h3>
      <ul>
        <li>Тело должно образовывать прямую линию от головы до пяток</li>
        <li>Локти должны быть под углом 45-60 градусов к телу</li>
        <li>Опускайтесь до угла 90 градусов в локтях</li>
        <li>Держите корпус напряженным во время движения</li>
        <li>Дышите правильно: вдох при опускании, выдох при подъеме</li>
      </ul>
      
      <h3>Распространенные ошибки:</h3>
      <ul>
        <li>Прогиб в пояснице</li>
        <li>Неполная амплитуда движения</li>
        <li>Разведение локтей в стороны</li>
        <li>Задержка дыхания</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TextDescription'
}
</script>

<style scoped>
.text-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.description h3 {
  color: #2c3e50;
  margin-top: 1rem;
}

.description ul {
  text-align: left;
  margin-left: 1rem;
}

.description li {
  margin-bottom: 0.5rem;
}
</style>