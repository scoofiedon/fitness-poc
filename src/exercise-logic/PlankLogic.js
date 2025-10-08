import { ExerciseLogic } from './ExerciseLogic.js'

export class PlankLogic extends ExerciseLogic {
  constructor(exerciseData) {
    super(exerciseData)
    this.plankStartTime = null
    this.plankDuration = 0
  }

  analyzePose(landmarks) {
    const isInPosition = super.analyzePose(landmarks)
    
    if (!isInPosition) {
      this.feedbackMessage = 'Примите положение планки: прямая линия от головы до пяток'
      return false
    }
    
    // Start counting plank time when in correct position
    if (!this.plankStartTime) {
      this.plankStartTime = Date.now()
    }
    
    return true
  }

  processAngle() {
    // Plank doesn't use angle-based repetition counting
    // Instead, we track time in plank position
    if (this.plankStartTime) {
      this.plankDuration = Math.floor((Date.now() - this.plankStartTime) / 1000)
      this.currentPhase = 'Планка'
      this.feedbackMessage = `Удерживайте планку: ${this.plankDuration} секунд`
      this.feedbackClass = 'success'
    }
  }

  checkFormCorrections(landmarks) {
    super.checkFormCorrections(landmarks)
    
    // Plank-specific form corrections
    const leftShoulder = landmarks[this.keyPoints.shoulders?.[0] || 11]
    const rightShoulder = landmarks[this.keyPoints.shoulders?.[1] || 12]
    const leftHip = landmarks[this.keyPoints.hips?.[0] || 23]
    const rightHip = landmarks[this.keyPoints.hips?.[1] || 24]
    const leftKnee = landmarks[this.keyPoints.knees?.[0] || 25]
    const rightKnee = landmarks[this.keyPoints.knees?.[1] || 26]

    // Check for hip sagging or raising
    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2
      const hipAvgY = (leftHip.y + rightHip.y) / 2
      
      // If hips are too far from shoulders, it's incorrect
      if (Math.abs(hipAvgY - shoulderAvgY) > 0.08) {
        this.formCorrections.push('Держите тело в прямой линии, без прогиба или подъема таза')
      }
    }

    // Check for elbow angle (should be around 90 degrees)
    if (leftShoulder && rightShoulder && leftKnee && rightKnee) {
      const leftElbowShoulderAngle = this.calculateAngle(leftKnee, leftShoulder, { x: leftShoulder.x, y: leftShoulder.y + 0.1 })
      const rightElbowShoulderAngle = this.calculateAngle(rightKnee, rightShoulder, { x: rightShoulder.x, y: rightShoulder.y + 0.1 })
      
      const avgElbowAngle = (leftElbowShoulderAngle + rightElbowShoulderAngle) / 2
      
      if (avgElbowAngle < 80 || avgElbowAngle > 100) {
        this.formCorrections.push('Локти должны быть под углом 90 градусов к телу')
      }
    }
  }

  getStats() {
    const baseStats = super.getStats()
    return {
      ...baseStats,
      plankDuration: this.plankDuration,
      currentPhase: this.plankDuration > 0 ? `Планка: ${this.plankDuration}s` : 'Готовность'
    }
  }

  resetCounter() {
    super.resetCounter()
    this.plankStartTime = null
    this.plankDuration = 0
  }
}