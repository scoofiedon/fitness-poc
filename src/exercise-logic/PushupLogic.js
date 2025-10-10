import { ExerciseLogic } from './ExerciseLogic.js'

export class PushupLogic extends ExerciseLogic {
  constructor() {
    super()
    this.minAngle = 90
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

      if (leftShoulder && rightShoulder && leftAnkle && rightAnkle) {
        const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2
        const ankleAvgY = (leftAnkle.y + rightAnkle.y) / 2
        const bodyAngle = Math.abs(shoulderAvgY - ankleAvgY)
        this.isInExercisePosition = bodyAngle < 0.4

        if (!this.isInExercisePosition) {
          this.feedbackMessage = 'Встаньте в правильное положение для упражнения'
          this.feedbackClass = 'warning'
          this.lastPosture = 'up'
          this.currentPhase = 0
          return false
        } else {
          this.feedbackMessage = 'Начинайте упражнение'
          this.feedbackClass = 'info'
          return true
        }
      }
      return false
    }

  processAngle(angle) {
    console.log(angle)
    if (this.lastPosture === 'up') {
      // Going down - от 0% до 50%
      if (angle < this.minAngle) {
        this.lastPosture = 'down'
      }
      // Прогресс опускания: от 0% (угол 160°) до 50% (угол 90°)
      let progress = ((this.maxAngle - angle) / (this.maxAngle - this.minAngle)) * 50
      this.currentPhase = Math.max(0, Math.min(50, progress))
      this.feedbackMessage = 'Медленно опускайтесь'
      this.feedbackClass = 'info'
    } else if (this.lastPosture === 'down') {
      // Going up - от 50% до 100%
      if (angle > this.maxAngle) {
        this.lastPosture = 'up'
        this.repetitionCount++
      }
      // Прогресс подъема: от 50% (угол 90°) до 100% (угол 160°)
      let progress = ((angle - this.minAngle) / (this.maxAngle - this.minAngle)) * 50 + 50
      this.currentPhase = Math.max(50, Math.min(100, progress))
      this.feedbackMessage = 'Медленно подимайтесь'
      this.feedbackClass = 'success'
    }
  }

  checkFormCorrections(landmarks) {
    // Pushup-specific form corrections
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftElbow = landmarks[13]
    const rightElbow = landmarks[14]

    // Check elbow angle (should be 45-60 degrees to body)
    if (leftShoulder && rightShoulder && leftElbow && rightElbow) {
      const shoulderAvgX = (leftShoulder.x + rightShoulder.x) / 2
      const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2

      const leftElbowShoulderAngle = this.calculateAngle(leftElbow, leftShoulder, { x: shoulderAvgX, y: shoulderAvgY })
      const rightElbowShoulderAngle = this.calculateAngle(rightElbow, rightShoulder, { x: shoulderAvgX, y: shoulderAvgY })

      const avgElbowAngle = (leftElbowShoulderAngle + rightElbowShoulderAngle) / 2

      if (avgElbowAngle < 45 || avgElbowAngle > 60) {
        this.formCorrections.push('Локти должны быть под углом 45-60 градусов к телу')
        this.showFormCorrection = true
      }
    }
    // Check for proper body alignment in pushup position
    if (leftShoulder && rightShoulder && leftElbow && rightElbow) {
      const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2
      const leftElbowY = leftElbow.y
      const rightElbowY = rightElbow.y

      // Check if body forms a straight line
      if (Math.abs(leftElbowY - shoulderAvgY) > 0.1 || Math.abs(rightElbowY - shoulderAvgY) > 0.1) {
        this.formCorrections.push('Держите тело в прямой линии от головы до пяток')
        this.showFormCorrection = true
      }
    }

    // Check hand position
    const leftWrist = landmarks[15]
    const rightWrist = landmarks[16]

    if (leftWrist && rightWrist && leftShoulder && rightShoulder) {
      const wristAvgX = (leftWrist.x + rightWrist.x) / 2
      const shoulderAvgX = (leftShoulder.x + rightShoulder.x) / 2

      if (Math.abs(wristAvgX - shoulderAvgX) > 0.15) {
        this.formCorrections.push('Руки должны быть прямо под плечами')
        this.showFormCorrection = true
      }
    }
  }

 analyzeExerciseAngles(landmarks) {
    const leftShoulder = landmarks[11]
    const leftElbow = landmarks[13]
    const leftWrist = landmarks[15]
    const rightShoulder = landmarks[12]
    const rightElbow = landmarks[14]
    const rightWrist = landmarks[16]
    if (leftShoulder && leftElbow && leftWrist) {
      this.leftAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist)
    }

    if (rightShoulder && rightElbow && rightWrist) {
      this.rightAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist)
    }
    if (this.rightAngle && this.leftAngle) {
      const angle = (this.leftAngle + this.rightAngle)/2
      this.processAngle(angle)
    }

  }

 getCorrectionClass(correction) {
    if (correction.includes('прямой')) return 'critical'
    if (correction.includes('голову')) return 'warning'
    return 'info'
  }
}
