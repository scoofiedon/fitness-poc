import { ExerciseLogic } from './ExerciseLogic.js'

export class SquatLogic extends ExerciseLogic {
  constructor(exerciseData) {
    super(exerciseData)
  }

  analyzePose(landmarks) {
    const isInPosition = super.analyzePose(landmarks)
    
    if (!isInPosition) {
      this.feedbackMessage = 'Встаньте в положение для приседаний'
      return false
    }
    
    return true
  }

  processAngle(angle) {
    if (angle < this.minAngle && this.lastPosture === 'up') {
      // Going down
      this.lastPosture = 'down'
      this.currentPhase = 'Опускание'
      this.feedbackMessage = 'Медленно приседайте'
      this.feedbackClass = 'info'
    } else if (angle > this.maxAngle && this.lastPosture === 'down') {
      // Going up - count repetition
      this.lastPosture = 'up'
      this.repetitionCount++
      this.currentPhase = 'Подъем'
      this.feedbackMessage = `Отлично! Повторение ${this.repetitionCount}`
      this.feedbackClass = 'success'
      
      // Haptic feedback if available
      // if (navigator.vibrate) {
      //   navigator.vibrate(50)
      // }
    }
  }

  checkFormCorrections(landmarks) {
    super.checkFormCorrections(landmarks)
    
    // Squat-specific form corrections
    const leftHip = landmarks[this.keyPoints.hips?.[0] || 23]
    const rightHip = landmarks[this.keyPoints.hips?.[1] || 24]
    const leftKnee = landmarks[this.keyPoints.knees?.[0] || 25]
    const rightKnee = landmarks[this.keyPoints.knees?.[1] || 26]
    const leftAnkle = landmarks[this.keyPoints.ankles?.[0] || 27]
    const rightAnkle = landmarks[this.keyPoints.ankles?.[1] || 28]

    // Check knee alignment (should not go past toes)
    if (leftKnee && rightKnee && leftAnkle && rightAnkle) {
      const kneeAvgX = (leftKnee.x + rightKnee.x) / 2
      const ankleAvgX = (leftAnkle.x + rightAnkle.x) / 2
      
      // If knee goes past ankle (toes), it's incorrect
      if (Math.abs(kneeAvgX - ankleAvgX) > 0.1) {
        this.formCorrections.push('Колени не должны выходить за носки')
      }
    }

    // Check for knee valgus (knees caving inward)
    if (leftKnee && rightKnee && leftHip && rightHip) {
      const hipDistance = Math.abs(leftHip.x - rightHip.x)
      const kneeDistance = Math.abs(leftKnee.x - rightKnee.x)
      
      if (kneeDistance < hipDistance * 0.7) {
        this.formCorrections.push('Держите колени на одной линии с стопами')
      }
    }
  }
}