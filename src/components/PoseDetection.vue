<template>
  <div v-if="exerciseData" class="pose-detection">
    <h2>AI Тренер посмотрит, как ты делаешь {{ exerciseName.toLowerCase() }} 😏</h2>
    <div class="camera-section" :class="{ 'camera-active': isCameraActive }">
      <template v-if="isCameraActive">
        <div class="camera-wrapper">
          <video ref="videoElement" class="video" autoplay playsinline
            :width="videoWidth" :height="videoHeight"
            style="transform: scaleX(-1);"
          ></video>
          <canvas ref="canvasElement" class="overlay"
            :width="videoWidth" :height="videoHeight"
          ></canvas>
          <!-- Non-mirrored HTML message (won't be flipped) -->
          <div v-if="!lastDetection" class="camera-message">Встаньте в кадр полностью</div>
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
        <p>Статус: {{ currentPhase }}</p>
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
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision"
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
      drawingUtils: null,
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
      return this.exerciseLogic ? this.exerciseLogic.currentPhase : 'Готовность'
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
    }
  },
  methods: {

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
        const exerciseType = this.exerciseData.exerciseType || 'pushups'
        this.exerciseLogic = ExerciseLogicFactory.createLogic(exerciseType, this.exerciseData)
        
        // Ensure video/canvas are rendered first
        this.isCameraActive = true
        await this.$nextTick()

        this.video = this.$refs.videoElement
        this.canvas = this.$refs.canvasElement
        if (!this.video || !this.canvas) {
          throw new Error('Video or canvas element not found')
        }
        this.canvasCtx = this.canvas.getContext('2d')
        this.drawingUtils = new DrawingUtils(this.canvasCtx)

        // Initialize poseLandmarker
        if (this.poseLandmarker) {
          this.poseLandmarker.close && this.poseLandmarker.close()
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
        this.isCameraActive = false
        this.feedbackMessage = 'Ошибка доступа к камере: ' + (error.message || error)
        this.feedbackClass = 'error'
        this.running = false
        console.error('[startCamera] Error:', error)
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
        const tracks = this.video.srcObject.getTracks()
        tracks.forEach((track) => track.stop())
        this.video.srcObject = null
      }
      if (this.canvasCtx) {
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      }
      this.feedbackMessage = 'Камера остановлена'
      this.feedbackClass = 'info'
      this.currentPhase = 'Готовность'
      this.showFormCorrection = false
    },

    async predictWebcam() {
      if (!this.running || !this.isCameraActive) {
        console.warn('[predictWebcam] Not running or camera inactive')
        return
      }
      if (!this.video) {
        console.warn('[predictWebcam] Video ref missing')
        this.animationId = requestAnimationFrame(this.predictWebcam)
        return
      }
      if (!this.poseLandmarker) {
        console.warn('[predictWebcam] poseLandmarker is null')
        this.animationId = requestAnimationFrame(this.predictWebcam)
        return
      }

      try {
        if (!this.offscreenCanvas) {
          this.offscreenCanvas = document.createElement('canvas')
          this.offscreenCtx = this.offscreenCanvas.getContext('2d')
        }
        this.offscreenCanvas.width = this.videoWidth
        this.offscreenCanvas.height = this.videoHeight
        
        const vw = this.video.videoWidth || this.videoWidth
        const vh = this.video.videoHeight || this.videoHeight
        this.offscreenCanvas.width = vw
        this.offscreenCanvas.height = vh
        this.offscreenCtx.drawImage(this.video, 0, 0, vw, vh)
        
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
          landmarkSet.map(p => ({ x: 1 - p.x, y: p.y, z: p.z, visibility: p.visibility }))
        )
        for (const lm of mirrored) {
          this.drawingUtils.drawLandmarks(lm, { radius: 4 })
          this.drawingUtils.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS)
        }
      } else {
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
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
      if (this.exerciseLogic) {
        return this.exerciseLogic.getCorrectionClass(correction)
      }
      return 'info'
    }
  },
  beforeUnmount() {
    this.stopCamera()
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
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: block;
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
      color: #fff;
      padding: 6px 10px;
      border-radius: 6px;
      z-index: 30;
      font-weight: bold;
    }

.controls {
  margin: 1rem 0;
}

button {
  padding: 0.75rem 1.5rem;
  margin: 0 0.5rem;
  border: none;
  border-radius: 6px;
  background: #3498db;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

button:hover:not(:disabled) {
  background: #2980b9;
}

button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.reset-btn {
  background: #e74c3c;
}

.reset-btn:hover:not(:disabled) {
  background: #c0392b;
}

.stats {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.counter h3 {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.feedback {
  margin: 1rem 0;
}

.feedback .info {
  color: #3498db;
  font-weight: bold;
}

.feedback .success {
  color: #27ae60;
  font-weight: bold;
}

.feedback .warning {
  color: #f39c12;
  font-weight: bold;
}

.feedback .error {
  color: #e74c3c;
  font-weight: bold;
}

.form-correction {
  margin-top: 1rem;
  text-align: left;
}

.form-correction h4 {
  color: #e74c3c;
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
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

.form-correction .warning {
  background: #fff3e0;
  color: #ef6c00;
  border-left: 4px solid #ef6c00;
}

.form-correction .info {
  background: #e3f2fd;
  color: #1565c0;
  border-left: 4px solid #1565c0;
}

.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
  text-align: center;
}

     @media (max-width: 768px) {
       .camera-section {
         margin: 0 0 1rem 0;
         border: none;
         border-radius: 0;
       }
       .controls { display: flex; flex-direction: column; gap: 0.5rem; margin: 0.5rem; }
       button { margin: 0; }
       .stats { padding: 0.75rem; }
       .video { max-height: 50vh; }
    }
</style>