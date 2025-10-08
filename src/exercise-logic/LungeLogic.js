import { ExerciseLogic } from './ExerciseLogic.js'

export class LungeLogic extends ExerciseLogic {
  constructor(exerciseData) {
    super(exerciseData)
    this.currentLeg = 'right' // Track which leg is forward
    this.legSwitchThreshold = 0.3 // Threshold for leg detection
  }

  analyzePose(landmarks) {
    const isInPosition = super.analyzePose(landmarks)
    
    if (!isInPosition) {
      this.feedbackMessage = 'Примите положение выпада: шаг вперед, колено почти касается пола'
      return false
    }
    
    // Detect which leg is forward
    this.detectForwardLeg(landmarks)
    
    return true
  }

  detectForwardLeg(landmarks) {
    const leftHip = landmarks[this.keyPoints.hips?.[0] || 23]
    const rightHip = landmarks[this.keyPoints.hips?.[1] || 24]
    const leftKnee = landmarks[this.keyPoints.knees?.[0] || 25]
    const rightKnee = landmarks[this.keyPoints.knees?.[1] || 26]
    const leftAnkle = landmarks[this.keyPoints.ankles?.[0] || 27]
    const rightAnkle = landmarks[this.keyPoints.ankles?.[1] || 28]

    if (leftHip && rightHip && leftKnee && rightKnee && leftAnkle && rightAnkle) {
      const leftHipKneeDistance = Math.abs(leftKnee.y - leftHip.y)
      const rightHipKneeDistance = Math.abs(rightKnee.y - rightHip.y)
      
      // The leg with greater knee flexion is likely the forward leg
      if (leftHipKneeDistance > rightHipKneeDistance + this.legSwitchThreshold) {
        this.currentLeg = 'left'
      } else if (rightHipKneeDistance > leftHipKneeDistance + this.legSwitchThreshold) {
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
      
      // Haptic feedback if available
      // if (navigator.vibrate) {
      //   navigator.vibrate(50)
      // }
    }
  }

  checkFormCorrections(landmarks) {
    super.checkFormCorrections(landmarks)
    
    // Lunge-specific form corrections
    const leftHip = landmarks[this.keyPoints.hips?.[0] || 23]
    const rightHip = landmarks[this.keyPoints.hips?.[1] || 24]
    const leftKnee = landmarks[this.keyPoints.knees?.[0] || 25]
    const rightKnee = landmarks[this.keyPoints.knees?.[1] || 26]
    const leftAnkle = landmarks[this.keyPoints.ankles?.[0] || 27]
    const rightAnkle = landmarks[this.keyPoints.ankles?.[1] || 28]

    // Check front knee alignment (should not go past ankle)
    if (this.currentLeg === 'right' && rightHip && rightKnee && rightAnkle) {
      const kneeAnkleDistance = Math.abs(rightKnee.x - rightAnkle.x)
      if (kneeAnkleDistance > 0.1) {
        this.formCorrections.push('Переднее колено не должно выходить за носок')
      }
    } else if (this.currentLeg === 'left' && leftHip && leftKnee && leftAnkle) {
      const kneeAnkleDistance = Math.abs(leftKnee.x - leftAnkle.x)
      if (kneeAnkleDistance > 0.1) {
        this.formCorrections.push('Переднее колено не должно выходить за носок')
      }
    }

    // Check for vertical torso
    if (leftHip && rightHip) {
      const hipAvgY = (leftHip.y + rightHip.y) / 2
      const shoulderAvgY = (landmarks[11].y + landmarks[12].y) / 2
      
      if (Math.abs(hipAvgY - shoulderAvgY) > 0.15) {
        this.formCorrections.push('Держите корпус вертикальным, без наклона вперед')
      }
    }

    // Check for proper lunge depth
    if (this.currentLeg === 'right' && rightKnee && rightHip) {
      const kneeFlexionAngle = this.calculateAngle(rightHip, rightKnee, { x: rightKnee.x, y: rightKnee.y + 0.1 })
      if (kneeFlexionAngle > 100) {
        this.formCorrections.push('Опускайтесь глубже, почти до касания коленом пола')
      }
    } else if (this.currentLeg === 'left' && leftKnee && leftHip) {
      const kneeFlexionAngle = this.calculateAngle(leftHip, leftKnee, { x: leftKnee.x, y: leftKnee.y + 0.1 })
      if (kneeFlexionAngle > 100) {
        this.formCorrections.push('Опускайтесь глубже, почти до касания коленом пола')
      }
    }
  }
}