export class ExerciseLogic {
  constructor() {
    // Данные, используемые в PoseDetection.vue
    this.lastPosture = 'up'
    this.repetitionCount = 0
    this.currentPhase = 'Готовность'
    this.feedbackMessage = 'Запустите камеру для начала тренировки'
    this.feedbackClass = 'info'
    this.formCorrections = []
    this.showFormCorrection = false
    this.isInExercisePosition = false
  }

  analyzePose() {
  throw new Error('Method analyzePose() must be implemented in subclass')
  }

  analyzeExerciseAngles() {
    throw new Error('Method analyzeExerciseAngles() must be implemented in subclass')
  }

  calculateAngle(a, b, c) {
    // Calculate angle at point b
    const ab = { x: a.x - b.x, y: a.y - b.y }
    const cb = { x: c.x - b.x, y: c.y - b.y }
    
    const dot = ab.x * cb.x + ab.y * cb.y
    const cross = ab.x * cb.y - ab.y * cb.x
    
    const angle = Math.atan2(cross, dot) * (180 / Math.PI)
    return Math.abs(angle)
  }

  processAngle() {
    // Заглушка - должен быть переопределен в конкретных классах
    throw new Error('Method processAngle() must be implemented in subclass')
  }

  checkFormCorrections() {
    // Заглушка - должна быть переопределена в конкретных классах
    throw new Error('Method checkFormCorrections() must be implemented in subclass')
  }

  getCorrectionClass() {
    throw new Error('Method checkFormCorrections() must be implemented in subclass')
  }

  resetCounter() {
    this.repetitionCount = 0
    this.lastPosture = 'up'
    this.currentPhase = 'Готовность'
    this.feedbackMessage = 'Счетчик сброшен. Готовы к новому подходу!'
    this.feedbackClass = 'info'
  }

  getStats() {
    return {
      repetitionCount: this.repetitionCount,
      currentPhase: this.currentPhase,
      feedbackMessage: this.feedbackMessage,
      feedbackClass: this.feedbackClass,
      formCorrections: this.formCorrections,
      showFormCorrection: this.showFormCorrection
    }
  }
}