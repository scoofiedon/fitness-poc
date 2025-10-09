import { ExerciseLogic } from './ExerciseLogic.js'

export class SquatLogic extends ExerciseLogic {
  constructor() {
    super()
    this.minAngle = 70
    this.maxAngle = 160
    this.leftAngle 
    this.rightAngle
  }

  analyzePose(landmarks) {
      this.formCorrections = []
      this.showFormCorrection = false
      // Check if person is in exercise position
      const leftShoulder = landmarks[11]
      const rightShoulder = landmarks[12]
      const leftAnkle = landmarks[27]
      const rightAnkle = landmarks[28]

      if (leftShoulder && rightShoulder && leftAnkle && rightAnkle) {
        const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2
        const ankleAvgY = (leftAnkle.y + rightAnkle.y) / 2
        const bodyAngle = Math.abs(shoulderAvgY - ankleAvgY)
        this.isInExercisePosition = bodyAngle < 0.4
        
        if (!this.isInExercisePosition) {
          this.feedbackMessage = 'Встаньте в правильное положение для приседаний'
          this.feedbackClass = 'warning'
          this.lastPosture = 'up'
          return false
        } else {
          this.feedbackMessage = 'Начинайте приседания'
          this.feedbackClass = 'info'
          return true
        }
      }
      return false
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
    }
  }

  checkFormCorrections(landmarks) {
    // Squat-specific form corrections
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]

    // Check knee alignment (should not go past toes)
    if (leftKnee && rightKnee && leftAnkle && rightAnkle) {
      const kneeAvgX = (leftKnee.x + rightKnee.x) / 2
      const ankleAvgX = (leftAnkle.x + rightAnkle.x) / 2
      
      // If knee goes past ankle (toes), it's incorrect
      if (Math.abs(kneeAvgX - ankleAvgX) > 0.1) {
        this.formCorrections.push('Колени не должны выходить за носки')
        this.showFormCorrection = true
      }
    }

    // Check for knee valgus (knees caving inward)
    if (leftKnee && rightKnee && leftHip && rightHip) {
      const hipDistance = Math.abs(leftHip.x - rightHip.x)
      const kneeDistance = Math.abs(leftKnee.x - rightKnee.x)
      
      if (kneeDistance < hipDistance * 0.7) {
        this.formCorrections.push('Держите колени на одной линии со стопами')
        this.showFormCorrection = true
      }
    }

    // Check for proper squat depth
    if (leftHip && rightHip && leftKnee && rightKnee) {
      const hipAvgY = (leftHip.y + rightHip.y) / 2
      const kneeAvgY = (leftKnee.y + rightKnee.y) / 2
      
      // Calculate hip-knee angle for depth check
      const hipKneeAngle = this.calculateAngle(
        { x: leftHip.x, y: hipAvgY },
        { x: leftKnee.x, y: kneeAvgY },
        { x: leftKnee.x, y: kneeAvgY + 0.1 }
      )
      
      if (hipKneeAngle > 120) {
        this.formCorrections.push('Приседайте глубже, бедра должны быть параллельны полу')
        this.showFormCorrection = true
      }
    }

    // Check for back straightness during squat
    if (leftHip && rightHip && leftKnee && rightKnee) {
      const hipAvgY = (leftHip.y + rightHip.y) / 2
      const kneeAvgY = (leftKnee.y + rightKnee.y) / 2
      
      // If hips drop too much relative to knees, it indicates poor form
      if (Math.abs(hipAvgY - kneeAvgY) < 0.2) {
        this.formCorrections.push('Держите спину прямой и не округляйте позвоночник')
        this.showFormCorrection = true
      }
    }
  }

 analyzeExerciseAngles(landmarks) {
    const leftHip = landmarks[23]
    const leftKnee = landmarks[25]
    const leftAnkle = landmarks[27]
    const rightHip = landmarks[24]
    const rightKnee = landmarks[26]
    const rightAnkle = landmarks[28]
    
    if (leftHip && leftKnee && leftAnkle) {
      this.leftAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle)
    }

    if (rightHip && rightKnee && rightAnkle) {
      this.rightAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle)
    }
    
    if (this.rightAngle && this.leftAngle) {
      const angle = (this.leftAngle + this.rightAngle)/2
      this.processAngle(angle)
    }
  }

 getCorrectionClass(correction) {
    if (correction.includes('прямой')) return 'critical'
    if (correction.includes('глубже')) return 'warning'
    return 'info'
  }
}