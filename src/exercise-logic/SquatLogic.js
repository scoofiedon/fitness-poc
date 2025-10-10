import { ExerciseLogic } from './ExerciseLogic.js'

export class SquatLogic extends ExerciseLogic {
  constructor() {
    super()
    this.minAngle = 70
    this.maxAngle = 160
    this.leftAngle = 160
    this.rightAngle = 160
  }

  analyzePose(landmarks) {
      this.formCorrections = []
      this.showFormCorrection = false
      // Check if person is in exercise position
      const leftShoulder = landmarks[11]
      const rightShoulder = landmarks[12]
      const leftAnkle = landmarks[27]
      const rightAnkle = landmarks[28]
      const leftHip = landmarks[23]
      const rightHip = landmarks[24]

      if (leftShoulder && rightShoulder && leftAnkle && rightAnkle && leftHip && rightHip) {
        // Check shoulder-ankle alignment for proper stance width
        const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x)
        const ankleWidth = Math.abs(leftAnkle.x - rightAnkle.x)

        // Check if feet are approximately shoulder-width apart (allowing some tolerance)
        const widthRatio = ankleWidth / shoulderWidth
        console.log(widthRatio)
        this.isInExercisePosition = widthRatio > 0.4 && widthRatio < 2

        if (!this.isInExercisePosition) {
          this.feedbackMessage = 'Ноги должны быть на ширине плеч'
          this.feedbackClass = 'warning'
          this.lastPosture = 'up'
          return false
        } else {
          // Check for straight back
          const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2
          const hipAvgY = (leftHip.y + rightHip.y) / 2
          const backAngle = Math.abs(shoulderAvgY - hipAvgY)
          console.log(backAngle)
          // If back is too curved, it's incorrect
          if (backAngle > 0.95) {
            this.feedbackMessage = 'Держите спину прямой'
            this.feedbackClass = 'warning'
            this.lastPosture = 'up'
            return false
          } else {
            this.feedbackMessage = 'Отличное положение! Начинайте приседания'
            this.feedbackClass = 'success'
            return true
          }
        }
      }
      return false
    }

  processAngle(angle) {
    if (this.lastPosture === 'up') {
      // Going down - от 0% до 50%
      if (angle < this.minAngle) {
        this.lastPosture = 'down'
      }
      // Прогресс опускания: от 0% (угол 160°) до 50% (угол 70°)
      let progress = ((this.maxAngle - angle) / (this.maxAngle - this.minAngle)) * 50
      this.currentPhase = Math.max(0, Math.min(50, progress))
      this.feedbackMessage = 'Медленно приседайте'
      this.feedbackClass = 'info'
    } else if (this.lastPosture === 'down') {
      // Going up - от 50% до 100%
      if (angle > this.maxAngle) {
        this.lastPosture = 'up'
        this.repetitionCount++
      }
      // Прогресс подъема: от 50% (угол 70°) до 100% (угол 160°)
      let progress = ((angle - this.minAngle) / (this.maxAngle - this.minAngle)) * 50 + 50
      this.currentPhase = Math.max(50, Math.min(100, progress))
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
