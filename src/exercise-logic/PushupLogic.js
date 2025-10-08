import { ExerciseLogic } from './ExerciseLogic.js'

export class PushupLogic extends ExerciseLogic {
  constructor(exerciseData) {
    super(exerciseData)
  }

  analyzePose(landmarks) {
    const isInPosition = super.analyzePose(landmarks)
    
    if (!isInPosition) {
      this.feedbackMessage = 'Встаньте в горизонтальное положение для отжиманий'
      this.lastPosture = 'down'
      return false
    }
    
    return true
  }

  processAngle(angle) {
    if (angle < this.minAngle && this.lastPosture === 'up') {
      // Going down
      this.lastPosture = 'down'
      this.currentPhase = 'Опускание'
      this.feedbackMessage = 'Медленно опускайтесь'
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
    
    // Pushup-specific form corrections
    const leftShoulder = landmarks[this.keyPoints.shoulders?.[0] || 11]
    const rightShoulder = landmarks[this.keyPoints.shoulders?.[1] || 12]
    const leftElbow = landmarks[this.keyPoints.elbows?.[0] || 13]
    const rightElbow = landmarks[this.keyPoints.elbows?.[1] || 14]

    // Check elbow angle (should be 45-60 degrees to body)
    if (leftShoulder && rightShoulder && leftElbow && rightElbow) {
      const shoulderAvgX = (leftShoulder.x + rightShoulder.x) / 2
      const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2
      
      const leftElbowShoulderAngle = this.calculateAngle(leftElbow, leftShoulder, { x: shoulderAvgX, y: shoulderAvgY })
      const rightElbowShoulderAngle = this.calculateAngle(rightElbow, rightShoulder, { x: shoulderAvgX, y: shoulderAvgY })
      
      const avgElbowAngle = (leftElbowShoulderAngle + rightElbowShoulderAngle) / 2
      
      if (avgElbowAngle < 45 || avgElbowAngle > 60) {
        this.formCorrections.push('Локти должны быть под углом 45-60 градусов к телу')
      }
    }
  }
}