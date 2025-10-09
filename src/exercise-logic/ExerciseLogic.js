export class ExerciseLogic {
  constructor(exerciseData) {
    this.exerciseData = exerciseData
    this.minAngle = exerciseData.minAngle || 90
    this.maxAngle = exerciseData.maxAngle || 160
    this.bodyPositionThreshold = exerciseData.bodyPositionThreshold || 0.4
    this.keyPoints = exerciseData.keyPoints || {}
    this.lastPosture = 'up'
    this.repetitionCount = 0
    this.currentPhase = 'Готовность'
    this.feedbackMessage = 'Запустите камеру для начала тренировки'
    this.feedbackClass = 'info'
    this.formCorrections = []
    this.showFormCorrection = false
    this.isInExercisePosition = false
  }

  analyzePose(landmarks) {
    this.formCorrections = []
    this.showFormCorrection = false

    // Check if person is in exercise position
    const leftShoulder = landmarks[this.keyPoints.shoulders?.[0] || 11]
    const rightShoulder = landmarks[this.keyPoints.shoulders?.[1] || 12]
    const leftAnkle = landmarks[this.keyPoints.ankles?.[0] || 27]
    const rightAnkle = landmarks[this.keyPoints.ankles?.[1] || 28]

    if (leftShoulder && rightShoulder && leftAnkle && rightAnkle) {
      const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2
      const ankleAvgY = (leftAnkle.y + rightAnkle.y) / 2
      const bodyAngle = Math.abs(shoulderAvgY - ankleAvgY)
      this.isInExercisePosition = bodyAngle < this.bodyPositionThreshold
      
      if (!this.isInExercisePosition) {
        this.feedbackMessage = 'Встаньте в правильное положение для упражнения'
        this.feedbackClass = 'warning'
        return false
      } else {
        this.feedbackMessage = 'Начинайте упражнение'
        this.feedbackClass = 'info'
        return true
      }
    }
    return false
  }

  analyzeExerciseAngles(landmarks) {
    const leftShoulder = landmarks[this.keyPoints.shoulders?.[0] || 11]
    const leftElbow = landmarks[this.keyPoints.elbows?.[0] || 13]
    const leftWrist = landmarks[this.keyPoints.wrists?.[0] || 15]
    const rightShoulder = landmarks[this.keyPoints.shoulders?.[1] || 12]
    const rightElbow = landmarks[this.keyPoints.elbows?.[1] || 14]
    const rightWrist = landmarks[this.keyPoints.wrists?.[1] || 16]

    if (leftShoulder && leftElbow && leftWrist) {
      const leftAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist)
      this.processAngle(leftAngle)
    }

    if (rightShoulder && rightElbow && rightWrist) {
      const rightAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist)
      this.processAngle(rightAngle)
    }
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

  processAngle(angle) {
    // Base implementation - can be overridden by specific exercise classes
    if (angle < this.minAngle && this.lastPosture === 'up') {
      this.lastPosture = 'down'
      this.currentPhase = 'Опускание'
      this.feedbackMessage = 'Медленно опускайтесь'
      this.feedbackClass = 'info'
    } else if (angle > this.maxAngle && this.lastPosture === 'down') {
      this.lastPosture = 'up'
      this.repetitionCount++
      this.currentPhase = 'Подъем'
      this.feedbackMessage = `Отлично! Повторение ${this.repetitionCount}`
      this.feedbackClass = 'success'
    }
  }

  checkFormCorrections(landmarks) {
    const leftShoulder = landmarks[this.keyPoints.shoulders?.[0] || 11]
    const rightShoulder = landmarks[this.keyPoints.shoulders?.[1] || 12]
    const leftHip = landmarks[this.keyPoints.hips?.[0] || 23]
    const rightHip = landmarks[this.keyPoints.hips?.[1] || 24]
    const nose = landmarks[0]

    // Check back alignment
    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2
      const hipAvgY = (leftHip.y + rightHip.y) / 2
      
      if (Math.abs(shoulderAvgY - hipAvgY) > 0.05) {
        this.formCorrections.push('Держите спину прямой! Избегайте прогиба в пояснице')
      }
    }

    // Check head position
    if (nose && leftShoulder && rightShoulder) {
      const shoulderAvgX = (leftShoulder.x + rightShoulder.x) / 2
      if (Math.abs(nose.x - shoulderAvgX) > 0.1) {
        this.formCorrections.push('Держите голову на одной линии с позвоночником')
      }
    }

    if (this.formCorrections.length > 0) {
      this.showFormCorrection = true
      this.feedbackClass = 'warning'
    }
  }

  getCorrectionClass(correction) {
    if (correction.includes('прямой')) return 'critical'
    if (correction.includes('голову')) return 'warning'
    return 'info'
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