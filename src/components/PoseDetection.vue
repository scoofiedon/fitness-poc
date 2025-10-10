<template>
  <div v-if="exerciseData" class="pose-detection">
    <h2>AI Тренер посмотрит, как ты делаешь упражнение 😏</h2>
    <div class="camera-section" :class="{ 'camera-active': isCameraActive }">
      <template v-if="isCameraActive">
        <div class="camera-wrapper">
          <video
            ref="videoElement"
            class="video"
            autoplay
            playsinline
            :width="videoWidth"
            :height="videoHeight"
            style="transform: scaleX(-1);"
          ></video>
          <canvas
            ref="canvasElement"
            class="overlay"
            :width="videoWidth"
            :height="videoHeight"
          ></canvas>
          <div v-if="cameraMessage" class="camera-message">{{ feedbackMessage }}</div>
        </div>
      </template>
    </div>
    <div class="controls">
      <button @click="toggleCamera">{{ isCameraActive ? 'Остановить камеру' : 'Запустить камеру' }}</button>
      <button @click="resetCounter" class="reset-btn">Сбросить счетчик</button>
    </div>
    <div class="stats">
      <div class="counter">
        <h3>Повторения: {{ repetitionCount }}</h3>
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: currentPhase + '%', backgroundColor: getProgressColor(currentPhase) }"></div>
          <span v-if="currentPhase" class="progress-text">{{ Math.round(currentPhase) }}%</span>
        </div>
      </div>
      <div class="feedback">
        <p :class="feedbackClass">{{ feedbackMessage }}</p>
      </div>
      <div class="form-correction" v-if="showFormCorrection">
        <h4>Коррекция формы:</h4>
        <ul>
          <li v-for="correction in formCorrections" :key="correction" :class="getCorrectionClass(correction)">
            {{ correction }}
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div v-else class="loading-placeholder">
    <p>Загрузка тренажера...</p>
  </div>
</template>

<script>
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"
import { ExerciseLogicFactory } from "../exercise-logic/ExerciseLogicFactory.js"

export default {
  name: 'PoseDetection',
  props: {
    exerciseData: {
      type: Object,
      required: true
    },
    exerciseName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isCameraActive: false,
      exerciseLogic: null,
      poseLandmarker: null,
      running: false,
      video: null,
      canvas: null,
      canvasCtx: null,
      offscreenCanvas: null,
      offscreenCtx: null,
      lastVideoTime: -1,
      animationId: null,
      videoWidth: 640,
      videoHeight: 480,
      lastDetection: false
    }
  },
  computed: {
    repetitionCount() {
      return this.exerciseLogic ? this.exerciseLogic.repetitionCount : 0
    },
    currentPhase() {
      return this.exerciseLogic ? this.exerciseLogic.currentPhase : 0
    },
    feedbackMessage() {
      return this.exerciseLogic ? this.exerciseLogic.feedbackMessage : 'Запустите камеру для начала тренировки'
    },
    feedbackClass() {
      return this.exerciseLogic ? this.exerciseLogic.feedbackClass : 'info'
    },
    formCorrections() {
      return this.exerciseLogic ? this.exerciseLogic.formCorrections : []
    },
    showFormCorrection() {
      return this.exerciseLogic ? this.exerciseLogic.showFormCorrection : false
    },
    cameraMessage() {
      if (!this.lastDetection) return 'Встаньте в кадр полностью'
      if (this.currentPhase === 0 && this.repetitionCount===0 && this.exerciseLogic ) return 'Займите начальное положение для упражнения'
      return this.exerciseLogic ? this.exerciseLogic.feedbackMessage : ''
    }
  },
  mounted() {
    this.offscreenCanvas = document.createElement('canvas')
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')
  },
  methods: {
    getProgressColor(value) {
      if (value < 25) return '#ef4444' // red
      if (value < 50) return '#fbbf24' // yellow
      if (value < 75) return '#4ade80' // light green
      return '#22c55e' // green
    },

    async toggleCamera() {
      if (this.isCameraActive) {
        this.stopCamera()
      } else {
        await this.startCamera()
      }
    },

    async startCamera() {
      this.resetCounter()
      if (this.running) return

      this.running = true
      this.feedbackMessage = 'Загрузка модели...'
      this.feedbackClass = 'info'

      try {
        // Initialize exercise logic
        const exerciseType = this.exerciseData.exerciseType
        this.exerciseLogic = ExerciseLogicFactory.createLogic(exerciseType)

        // Ensure video/canvas are rendered
        this.isCameraActive = true
        await this.$nextTick()

        this.video = this.$refs.videoElement
        this.canvas = this.$refs.canvasElement
        if (!this.video || !this.canvas) {
          throw new Error('Video or canvas element not found')
        }
        this.canvasCtx = this.canvas.getContext('2d')

        // Initialize poseLandmarker
        if (this.poseLandmarker) {
          this.poseLandmarker.close()
          this.poseLandmarker = null
        }

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
        )

        this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.9,
          minPosePresenceConfidence: 0.8,
          minTrackingConfidence: 0.8
        })

        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: this.videoWidth },
            height: { ideal: this.videoHeight },
            facingMode: 'user'
          }
        })
        this.video.srcObject = stream
        await this.video.play()

        // Wait for video to be ready
        await new Promise(resolve => {
          if (this.video.readyState >= 2) resolve()
          else this.video.onloadeddata = resolve
        })

        // Set final dimensions
        const vw = this.video.videoWidth || 640
        const vh = this.video.videoHeight || 480
        this.videoWidth = vw
        this.videoHeight = vh
        this.video.width = this.videoWidth
        this.video.height = this.videoHeight
        this.canvas.width = vw
        this.canvas.height = vh
        this.canvas.style.width = this.video.clientWidth + 'px'
        this.canvas.style.height = this.video.clientHeight + 'px'

        this.feedbackMessage = 'Камера активна. Встаньте в положение для упражнения.'
        this.feedbackClass = 'success'
        this.lastVideoTime = -1

        this.predictWebcam()

      } catch (error) {
        console.error('[startCamera] Error:', error)
        this.isCameraActive = false
        this.feedbackMessage = 'Ошибка доступа к камере: ' + (error.message || error)
        this.feedbackClass = 'error'
        this.running = false
      }
    },

    stopCamera() {
      this.isCameraActive = false
      this.running = false
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
      if (this.video && this.video.srcObject) {
        this.video.srcObject.getTracks().forEach(track => track.stop())
        this.video.srcObject = null
      }
      if (this.canvasCtx) {
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      }
      this.feedbackClass = 'info'
      this.feedbackMessage = 'Камера остановлена'
    },

    async predictWebcam() {
      if (!this.running || !this.isCameraActive || !this.video || !this.poseLandmarker) {
        if (this.running) this.animationId = requestAnimationFrame(this.predictWebcam)
        return
      }

      try {
        this.offscreenCanvas.width = this.video.videoWidth
        this.offscreenCanvas.height = this.video.videoHeight
        this.offscreenCtx.drawImage(this.video, 0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height)
        const imageForDetect = this.offscreenCanvas

        const result = await this.poseLandmarker.detect(imageForDetect)
        if (result && result.landmarks && result.landmarks.length > 0) {
          this.lastDetection = true
          this.drawResults(result)
          this.analyzePose(result.landmarks[0])
        } else {
          this.lastDetection = false
          this.drawResults(result)
        }
      } catch (err) {
        console.error('[predictWebcam] image-mode detect failed:', err)
      }
      this.animationId = requestAnimationFrame(this.predictWebcam)
    },

    drawResults(result) {
      this.canvasCtx.save()
      this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      if (result && result.landmarks && result.landmarks.length > 0) {
        const mirrored = result.landmarks.map(landmarkSet =>
          landmarkSet.map(p => ({
            x: (1 - p.x) * this.canvas.width,
            y: p.y * this.canvas.height,
            z: p.z,
            visibility: p.visibility }))
        )

        for (const lm of mirrored) {

          // Draw connections (excluding ear and nose connections)
          this.canvasCtx.lineWidth = 2
          this.canvasCtx.beginPath()

          // Pose connections (excluding ears, nose, and problematic connections)
          const connections = [
            [0, 5], [0, 2], [2, 7], [5, 8], [9, 10], [11, 12], [11, 13],
            [11, 23], [12, 14], [12, 24], [14, 16], [13, 15], [15, 21], [15, 17],
            [15, 19], [17, 19], [16, 22], [16, 18], [16, 20], [18, 20],
            [23, 24], [23, 25], [24, 26], [28, 30], [25, 27], [26, 28],
            [27, 29], [27, 31], [29, 31], [28, 30], [28, 32], [30, 32]
          ]

          for (const [start, end] of connections) {
            this.canvasCtx.moveTo(lm[start].x, lm[start].y)
            this.canvasCtx.lineTo(lm[end].x, lm[end].y)
          }

          // Apply connection styling based on theme
          const isDark = getComputedStyle(document.documentElement).getPropertyValue('--is-dark') === 'true'
          this.canvasCtx.strokeStyle = isDark ? 'rgba(134, 239, 172, 0.8)' : 'rgba(74, 222, 128, 0.6)'
          this.canvasCtx.stroke()

          // Draw points with styled appearance
          for (const point of lm) {

              // Outer glow
              this.canvasCtx.fillStyle = isDark ? 'rgba(134, 239, 172, 0.3)' : 'rgba(74, 222, 128, 0.3)'
              this.canvasCtx.beginPath()
              this.canvasCtx.arc(point.x, point.y, 6, 0, 2 * Math.PI)
              this.canvasCtx.fill()

              // Main point
              this.canvasCtx.fillStyle = isDark ? '#86efac' : '#4ade80'
              this.canvasCtx.beginPath()
              this.canvasCtx.arc(point.x, point.y, 3, 0, 2 * Math.PI)
              this.canvasCtx.fill()
          }
        }
      }
      this.canvasCtx.restore()
    },

    analyzePose(landmarks) {
      if (this.exerciseLogic) {
        const canProceed = this.exerciseLogic.analyzePose(landmarks)
        if (canProceed) {
          this.exerciseLogic.analyzeExerciseAngles(landmarks)
          this.exerciseLogic.checkFormCorrections(landmarks)
        }
      }
    },

    resetCounter() {
      if (this.exerciseLogic) {
        this.exerciseLogic.resetCounter()
      }
    },

    getCorrectionClass(correction) {
      return this.exerciseLogic ? this.exerciseLogic.getCorrectionClass(correction) : 'info'
    }
  },
  beforeUnmount() {
    this.stopCamera()
    if (this.poseLandmarker) {
      this.poseLandmarker.close()
    }
  }
}
</script>

<style scoped>
.pose-detection {
  margin-top: 2rem;
  text-align: center;
}

.camera-section {
  position: relative;
  width: 100%;
  max-width: 720px;
  height: auto;
  margin: 0 auto 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  display: block;
}

.camera-section:not(.camera-active) {
  display: none;
}

@media (max-width: 768px) {
  .camera-section {
    margin: 0 0 1rem 0;
    border: none;
    border-radius: 0;
  }
  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0.5rem;
  }
  button { margin: 0; }
  .stats { padding: 0.75rem; }
  .video { max-height: 50vh; }
}

.video, .overlay {
  width: 100%;
  height: auto;
  display: block;
  max-width: 100%;
  object-fit: contain;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.camera-wrapper { position: relative; width: 100%; }
.camera-message {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  z-index: 30;
  font-weight: bold;
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .camera-message {
    background: rgba(255,255,255,0.8);
    color: black;
  }
}

.controls {
  margin: 1rem 0;
}

button {
  padding: 0.75rem 1.5rem;
  margin: 0 0.5rem;
  border: none;
  border-radius: 6px;
  background: var(--primary-color);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

button:hover:not(:disabled) {
  background: var(--primary-dark);
}

button:disabled {
  background: var(--border-color);
  cursor: not-allowed;
}

.reset-btn {
  background: var(--primary-dark);
}

.reset-btn:hover:not(:disabled) {
  background: var(--primary-color);
}

.stats {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--background-light);
  border-radius: 8px;
}

.counter h3 {
  color: var(--text-primary);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.progress-container {
  position: relative;
  width: 100%;
  height: 20px;
  background: #e5e7eb;
  border-radius: 10px;
  margin: 0.5rem 0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  color: #000;
  font-size: 0.8rem;
}

/* Dark theme for progress */
@media (prefers-color-scheme: dark) {
  .progress-container {
    background: #374151;
  }
  .progress-text {
    color: #fff;
  }
}

.feedback {
  margin: 1rem 0;
}

.feedback .info {
  color: var(--primary-color);
  font-weight: bold;
}

.feedback .success {
  color: #4ade80;
  font-weight: bold;
}

.feedback .warning {
  color: #fbbf24;
  font-weight: bold;
}

.feedback .error {
  color: #ef4444;
  font-weight: bold;
}

.form-correction {
  margin-top: 1rem;
  text-align: left;
}

.form-correction h4 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.form-correction ul {
  list-style: none;
  padding: 0;
}

.form-correction li {
  padding: 0.5rem;
  margin: 0.25rem 0;
  border-radius: 4px;
  font-weight: bold;
}

.form-correction .critical {
  background: #fee2e2;
  color: #dc2626;
  border-left: 4px solid #dc2626;
}

.form-correction .warning {
  background: #fef3c7;
  color: #d97706;
  border-left: 4px solid #d97706;
}

.form-correction .info {
  background: #dbeafe;
  color: #2563eb;
  border-left: 4px solid #2563eb;
}

/* Dark theme for form corrections */
@media (prefers-color-scheme: dark) {
  .form-correction .critical {
    background: #451a1a;
    color: #fca5a5;
    border-left-color: #dc2626;
  }
  .form-correction .warning {
    background: #451a0a;
    color: #fcd34d;
    border-left-color: #d97706;
  }
  .form-correction .info {
    background: #1e3a8a;
    color: #93c5fd;
    border-left-color: #2563eb;
  }
}

/* Pose landmarks and connections styling */
.pose-landmarks {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.landmark-point {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.2s ease;
}

.landmark-connection {
  position: absolute;
  height: 2px;
  transform-origin: left center;
  transition: all 0.2s ease;
}

/* Light theme landmarks */
.landmark-point.primary {
  background: #3B82F6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.landmark-point.secondary {
  background: #10B981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
}

.landmark-connection {
  background: #3B82F6;
  opacity: 0.6;
}

/* Dark theme landmarks */
@media (prefers-color-scheme: dark) {
  .landmark-point.primary {
    background: #60A5FA;
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.3);
  }

  .landmark-point.secondary {
    background: #34D399;
    box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.3);
  }

  .landmark-connection {
    background: #60A5FA;
    opacity: 0.8;
  }
}

.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  background: var(--background-light);
  border-radius: 8px;
  color: var(--text-secondary);
  text-align: center;
}

@media (max-width: 768px) {
  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0.5rem;
  }
  button { margin: 0; }
  .stats { padding: 0.75rem; }
}
</style>
