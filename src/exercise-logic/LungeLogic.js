import { ExerciseLogic } from './ExerciseLogic.js'

export class LungeLogic extends ExerciseLogic {
  constructor() {
    super()
    this.minAngle = 70
    this.maxAngle = 160
    this.leftAngle = 0
    this.rightAngle = 0
    this.currentLeg = 'right'
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
          this.feedbackMessage = 'Примите положение выпада: шаг вперед, колено почти касается пола'
          this.feedbackClass = 'warning'
          this.lastPosture = 'up'
          return false
        } else {
          this.feedbackMessage = 'Начинайте выпады'
          this.feedbackClass = 'info'
          return true
        }
      }
      return false
    }

  detectForwardLeg(landmarks) {
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]

    if (leftHip && rightHip && leftKnee && rightKnee && leftAnkle && rightAnkle) {
      const leftHipKneeDistance = Math.abs(leftKnee.y - leftHip.y)
      const rightHipKneeDistance = Math.abs(rightKnee.y - rightHip.y)
      
      // The leg with greater knee flexion is likely the forward leg
      if (leftHipKneeDistance > rightHipKneeDistance + 0.3) {
        this.currentLeg = 'left'
      } else if (rightHipKneeDistance > leftHipKneeDistance + 0.3) {
        this.currentLeg = 'right'
      }
    }
  }

  processAngle(angle) {
    // Lunge logic - count when going down and up for current leg
    if (angle < this.minAngle && this.lastPosture === 'up') {
      // Going down
      this.lastPosture = 'down'
      this.currentPhase = `Опускание (${this.currentLeg}ая нога вперед)`
      this.feedbackMessage = 'Медленно опускайтесь'
      this.feedbackClass = 'info'
    } else if (angle > this.maxAngle && this.lastPosture === 'down') {
      // Going up - count repetition for current leg
      this.lastPosture = 'up'
      this.repetitionCount++
      this.currentPhase = `Подъем (${this.currentLeg}ая нога вперед)`
      this.feedbackMessage = `Отлично! Повторение ${this.repetitionCount} на ${this.currentLeg}ую ногу`
      this.feedbackClass = 'success'
    }
  }

  checkFormCorrections(landmarks) {
    // Lunge-specific form corrections
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]

    // Detect which leg is forward
    this.detectForwardLeg(landmarks)

    // Check front knee alignment (should not go past ankle)
    if (this.currentLeg === 'right' && rightHip && rightKnee && rightAnkle) {
      const kneeAnkleDistance = Math.abs(rightKnee.x - rightAnkle.x)
      if (kneeAnkleDistance > 0.1) {
        this.formCorrections.push('Переднее колено не должно выходить за носок')
        this.showFormCorrection = true
      }
    } else if (this.currentLeg === 'left' && leftHip && leftKnee && leftAnkle) {
      const kneeAnkleDistance = Math.abs(leftKnee.x - leftAnkle.x)
      if (kneeAnkleDistance > 0.1) {
        this.formCorrections.push('Переднее колено не должно выходить за носок')
        this.showFormCorrection = true
      }
    }

    // Check for vertical torso
    if (leftHip && rightHip) {
      const hipAvgY = (leftHip.y + rightHip.y) / 2
      const shoulderAvgY = (landmarks[11].y + landmarks[12].y) / 2
      
      if (Math.abs(hipAvgY - shoulderAvgY) > 0.15) {
        this.formCorrections.push('Держите корпус вертикальным, без наклона вперед')
        this.showFormCorrection = true
      }
    }

    // Check for proper lunge depth
    if (this.currentLeg === 'right' && rightKnee && rightHip) {
      const kneeFlexionAngle = this.calculateAngle(rightHip, rightKnee, { x: rightKnee.x, y: rightKnee.y + 0.1 })
      if (kneeFlexionAngle > 100) {
        this.formCorrections.push('Опускайтесь глубже, почти до касания коленом пола')
        this.showFormCorrection = true
      }
    } else if (this.currentLeg === 'left' && leftKnee && leftHip) {
      const kneeFlexionAngle = this.calculateAngle(leftHip, leftKnee, { x: leftKnee.x, y: leftKnee.y + 0.1 })
      if (kneeFlexionAngle > 100) {
        this.formCorrections.push('Опускайтесь глубже, почти до касания коленом пола')
        this.showFormCorrection = true
      }
    }

    // Check for proper rear knee position (should not touch ground)
    if (this.currentLeg === 'right' && leftKnee && leftHip) {
      const leftKneeY = leftKnee.y
      const leftHipY = leftHip.y
      if (Math.abs(leftKneeY - leftHipY) < 0.3) {
        this.formCorrections.push('Заднее колено должно почти касаться пола, но не касаться его')
        this.showFormCorrection = true
      }
    } else if (this.currentLeg === 'left' && rightKnee && rightHip) {
      const rightKneeY = rightKnee.y
      const rightHipY = rightHip.y
      if (Math.abs(rightKneeY - rightHipY) < 0.3) {
        this.formCorrections.push('Заднее колено должно почти касаться пола, но не касаться его')
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
    if (correction.includes('корпус')) return 'critical'
    if (correction.includes('колено')) return 'warning'
    return 'info'
  }
}