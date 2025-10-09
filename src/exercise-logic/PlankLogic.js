import { ExerciseLogic } from './ExerciseLogic.js'

export class PlankLogic extends ExerciseLogic {
  constructor() {
    super()
    this.minAngle = 160
    this.maxAngle = 160
    this.leftAngle 
    this.rightAngle
    this.plankStartTime = null
    this.plankDuration = 0
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
          this.feedbackMessage = 'Примите положение планки: прямая линия от головы до пяток'
          this.feedbackClass = 'warning'
          this.lastPosture = 'up'
          return false
        } else {
          this.feedbackMessage = 'Начинайте планку'
          this.feedbackClass = 'info'
          // Start counting plank time when in correct position
          if (!this.plankStartTime) {
            this.plankStartTime = Date.now()
          }
          return true
        }
      }
      return false
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
    // Plank-specific form corrections
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]

    // Check for hip sagging or raising
    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2
      const hipAvgY = (leftHip.y + rightHip.y) / 2
      
      // If hips are too far from shoulders, it's incorrect
      if (Math.abs(hipAvgY - shoulderAvgY) > 0.08) {
        this.formCorrections.push('Держите тело в прямой линии, без прогиба или подъема таза')
        this.showFormCorrection = true
      }
    }

    // Check for elbow angle (should be around 90 degrees)
    if (leftShoulder && rightShoulder && leftKnee && rightKnee) {
      const leftElbowShoulderAngle = this.calculateAngle(leftKnee, leftShoulder, { x: leftShoulder.x, y: leftShoulder.y + 0.1 })
      const rightElbowShoulderAngle = this.calculateAngle(rightKnee, rightShoulder, { x: rightShoulder.x, y: rightShoulder.y + 0.1 })
      
      const avgElbowAngle = (leftElbowShoulderAngle + rightElbowShoulderAngle) / 2
      
      if (avgElbowAngle < 80 || avgElbowAngle > 100) {
        this.formCorrections.push('Локти должны быть под углом 90 градусов к телу')
        this.showFormCorrection = true
      }
    }

    // Check for head and neck alignment
    const nose = landmarks[0]
    if (nose && leftShoulder && rightShoulder) {
      const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2
      const headShoulderDistance = Math.abs(nose.y - shoulderAvgY)
      
      if (headShoulderDistance > 0.2) {
        this.formCorrections.push('Держите голову на одной линии с позвоночником')
        this.showFormCorrection = true
      }
    }

    // Check for shoulder stability
    if (leftShoulder && rightShoulder) {
      const shoulderDistance = Math.abs(leftShoulder.x - rightShoulder.x)
      if (shoulderDistance < 0.2) {
        this.formCorrections.push('Расположите руки шире плеч для большей стабильности')
        this.showFormCorrection = true
      }
    }
  }

 analyzeExerciseAngles() {
    // Plank doesn't use angle-based analysis for counting
    // But we still call processAngle to update time display
    this.processAngle()
  }

 getCorrectionClass(correction) {
    if (correction.includes('прямой')) return 'critical'
    if (correction.includes('голову')) return 'warning'
    return 'info'
  }

  resetCounter() {
    super.resetCounter()
    this.plankStartTime = null
    this.plankDuration = 0
  }
}