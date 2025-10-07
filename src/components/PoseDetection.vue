<template>
  <div class="pose-detection">
    <h2>Тренер по отжиманиям</h2>
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
          <div v-if="!lastDetection" class="camera-message">Встаньте в кадр</div>
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
</template>


<script>
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

export default {
  name: 'PoseDetection',
  data() {
    return {
      isCameraActive: false,
      repetitionCount: 0,
      feedbackMessage: 'Запустите камеру для начала тренировки',
      feedbackClass: 'info',
      currentPhase: 'Готовность',
      showFormCorrection: false,
      formCorrections: [],
      poseLandmarker: null, // MediaPipe Tasks PoseLandmarker
      running: false,
      video: null,
      canvas: null,
      canvasCtx: null,
      drawingUtils: null,
  offscreenCanvas: null,
  offscreenCtx: null,
      lastVideoTime: -1,
      animationId: null,
      videoWidth: 640,  // Увеличиваем для лучшего качества
      videoHeight: 480, // Соотношение 4:3
      lastPosture: 'up',
      minAngle: 90,
      maxAngle: 160,
      isInPushupPosition: false,
      isProcessing: false // Prevent double activation
    }
  },
  methods: {

    async toggleCamera() {
      if (this.isCameraActive) {
        this.stopCamera();
      } else {
        await this.startCamera();
      }
    },

async startCamera() {
  if (this.running) return;
  // console.log('[startCamera] Initializing...');
  this.running = true;
  this.feedbackMessage = 'Загрузка модели...';
  this.feedbackClass = 'info';
  try {
    // Ensure video/canvas are rendered first
    this.isCameraActive = true;
    await this.$nextTick();

    this.video = this.$refs.videoElement;
    this.canvas = this.$refs.canvasElement;
    if (!this.video || !this.canvas) {
      throw new Error('Video or canvas element not found');
    }
    this.canvasCtx = this.canvas.getContext('2d');
    this.drawingUtils = new DrawingUtils(this.canvasCtx);

    // Initialize poseLandmarker first
    if (this.poseLandmarker) {
      this.poseLandmarker.close && this.poseLandmarker.close();
      this.poseLandmarker = null;
    }

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
    );
    // console.log('[startCamera] Creating poseLandmarker...');
    this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
    });
    // console.log('[startCamera] poseLandmarker created successfully');

    // Then start camera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: this.videoWidth },
        height: { ideal: this.videoHeight },
        facingMode: 'user'  // Использовать переднюю камеру
      }
    });
    this.video.srcObject = stream;
    await this.video.play();

    // Wait for video to be ready
    await new Promise(resolve => {
      if (this.video.readyState >= 2) resolve();
      else this.video.onloadeddata = resolve;
    });

  // Set final dimensions (use actual video pixel size)
  const vw = this.video.videoWidth || 640;
  const vh = this.video.videoHeight || 480;
  this.videoWidth = vw;
  this.videoHeight = vh;
  this.video.width = this.videoWidth;
  this.video.height = this.videoHeight;
  // set canvas internal pixel size to video pixels
  this.canvas.width = vw;
  this.canvas.height = vh;
  // make canvas display size match element's client size to avoid CSS scaling
  this.canvas.style.width = this.video.clientWidth + 'px';
  this.canvas.style.height = this.video.clientHeight + 'px';
  // console.log('[startCamera] Dimensions set:', vw, 'x', vh, 'display:', this.video.clientWidth, 'x', this.video.clientHeight);

    this.feedbackMessage = 'Камера активна. Встаньте в положение для отжиманий.';
    this.feedbackClass = 'success';
    this.lastVideoTime = -1;
    // console.log('[startCamera] Starting detection...');
    this.predictWebcam();
  } catch (error) {
    this.isCameraActive = false;
    this.feedbackMessage = 'Ошибка доступа к камере: ' + (error.message || error);
    this.feedbackClass = 'error';
    this.running = false;
    console.error('[startCamera] Error:', error);
  }
},

    stopCamera() {
      this.isCameraActive = false;
      this.running = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      if (this.video && this.video.srcObject) {
        const tracks = this.video.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        this.video.srcObject = null;
      }
      if (this.canvasCtx) {
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      // Не сбрасываем размеры, просто скрываем canvas через v-if
      this.feedbackMessage = 'Камера остановлена';
      this.feedbackClass = 'info';
      this.currentPhase = 'Готовность';
      this.showFormCorrection = false;
    },

    async predictWebcam() {
      // console.log('[predictWebcam] called. running:', this.running, 'isCameraActive:', this.isCameraActive);
      if (!this.running || !this.isCameraActive) {
        console.warn('[predictWebcam] Not running or camera inactive');
        return;
      }
      if (!this.video) {
        console.warn('[predictWebcam] Video ref missing');
        this.animationId = requestAnimationFrame(this.predictWebcam);
        return;
      }
      // console.log('[predictWebcam] video.paused:', this.video.paused, 'video.ended:', this.video.ended, 'video.readyState:', this.video.readyState, 'video.currentTime:', this.video.currentTime);
      // ТЕСТ: убираем проверку currentTime, всегда вызываем detectForVideo
      if (!this.poseLandmarker) {
        console.warn('[predictWebcam] poseLandmarker is null');
        this.animationId = requestAnimationFrame(this.predictWebcam);
        return;
      }

      // Try video-mode API first, fallback to image-mode if it fails
      try {
        if (typeof this.poseLandmarker.detectForVideo === 'function') {
          // console.log('[predictWebcam] using detectForVideo');
          this.lastVideoTime = this.video.currentTime;
          this.poseLandmarker.detectForVideo(this.video, performance.now(), (result) => {
            try { this.drawResults(result); } catch (e) { console.error('[predictWebcam] drawResults error:', e); }
            if (result && result.landmarks && result.landmarks.length > 0) {
              this.lastDetection = true;
              this.analyzePose(result.landmarks[0]);
            } else {
              this.lastDetection = false;
            }
            this.animationId = requestAnimationFrame(this.predictWebcam);
          });
          return;
        }
      } catch (err) {
        // console.warn('[predictWebcam] detectForVideo failed, will fallback to image detect:', err.message || err);
      }

      // Fallback: draw current video frame into offscreen canvas and run detect(image)
      try {
        if (!this.offscreenCanvas) {
          this.offscreenCanvas = document.createElement('canvas');
          this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        }
        this.offscreenCanvas.width = this.videoWidth;
        this.offscreenCanvas.height = this.videoHeight;
  // Use actual video pixel size to match canvas
  const vw = this.video.videoWidth || this.videoWidth;
  const vh = this.video.videoHeight || this.videoHeight;
  this.offscreenCanvas.width = vw;
  this.offscreenCanvas.height = vh;
  this.offscreenCtx.drawImage(this.video, 0, 0, vw, vh);
        // Some API versions accept HTMLCanvasElement directly
        const imageForDetect = this.offscreenCanvas;
        const result = await this.poseLandmarker.detect(imageForDetect);
        if (result && result.landmarks && result.landmarks.length > 0) {
          this.lastDetection = true;
          this.drawResults(result);
          this.analyzePose(result.landmarks[0]);
        } else {
          this.lastDetection = false;
          this.drawResults(result);
        }
      } catch (err) {
        console.error('[predictWebcam] image-mode detect failed:', err);
      }
      this.animationId = requestAnimationFrame(this.predictWebcam);
    },

    drawResults(result) {
      this.canvasCtx.save();
      // Clear drawing area
      this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // console.log('[drawResults] canvas size:', this.canvas.width, this.canvas.height);
      if (result && result.landmarks && result.landmarks.length > 0) {
        // Mirror landmarks in X to match mirrored video display
        const mirrored = result.landmarks.map(landmarkSet => landmarkSet.map(p => ({ x: 1 - p.x, y: p.y, z: p.z })));
        // Draw first pose
        const first = mirrored[0][0];
        if (first) {
          this.canvasCtx.beginPath();
          this.canvasCtx.arc(first.x * this.canvas.width, first.y * this.canvas.height, 8, 0, 2 * Math.PI);
          this.canvasCtx.fillStyle = 'red';
          this.canvasCtx.fill();
          // console.log('[drawResults] drew nose dot at', first.x * this.canvas.width, first.y * this.canvas.height);
        }
        for (const lm of mirrored) {
          this.drawingUtils.drawLandmarks(lm, { radius: 4 });
          this.drawingUtils.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS);
        }
        // console.log('[drawResults] drew pose landmarks and connectors');
      } else {
        // No canvas text; HTML message shows 'Встаньте в кадр'
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      this.canvasCtx.restore();
    },


    analyzePose(landmarks) {
      this.formCorrections = [];
      this.showFormCorrection = false;

      // Check if person is in push-up position (roughly horizontal)
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftAnkle = landmarks[23];
      const rightAnkle = landmarks[24];

      if (leftShoulder && rightShoulder && leftAnkle && rightAnkle) {
        const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2;
        const ankleAvgY = (leftAnkle.y + rightAnkle.y) / 2;
        const bodyAngle = Math.abs(shoulderAvgY - ankleAvgY);
        
        this.isInPushupPosition = bodyAngle < 0.4; // Threshold for horizontal position
        // console.log('[analyzePose] bodyAngle:', bodyAngle, 'isInPushupPosition:', this.isInPushupPosition);

        if (!this.isInPushupPosition) {
          this.feedbackMessage = 'Встаньте в горизонтальное положение для отжиманий';
          this.feedbackClass = 'warning';
          return;
        }
      }

      // Analyze elbow angles for push-up counting
      this.analyzeElbowAngles(landmarks);
      
      // Check form corrections
      this.checkFormCorrections(landmarks);
    },

    analyzeElbowAngles(landmarks) {
      const leftShoulder = landmarks[11];
      const leftElbow = landmarks[13];
      const leftWrist = landmarks[15];
      const rightShoulder = landmarks[12];
      const rightElbow = landmarks[14];
      const rightWrist = landmarks[16];

      if (leftShoulder && leftElbow && leftWrist) {
        const leftAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
        this.processElbowAngle(leftAngle, 'left');
      }

      if (rightShoulder && rightElbow && rightWrist) {
        const rightAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
        this.processElbowAngle(rightAngle, 'right');
      }
    },

    calculateAngle(a, b, c) {
      // Calculate angle at point b (elbow)
      const ab = { x: a.x - b.x, y: a.y - b.y };
      const cb = { x: c.x - b.x, y: c.y - b.y };
      
      const dot = ab.x * cb.x + ab.y * cb.y;
      const cross = ab.x * cb.y - ab.y * cb.x;
      
      const angle = Math.atan2(cross, dot) * (180 / Math.PI);
      return Math.abs(angle);
    },

    processElbowAngle(angle, side) {
      if (angle < this.minAngle && this.lastPosture === 'up') {
        // Going down
        this.lastPosture = 'down';
        this.currentPhase = 'Опускание';
        this.feedbackMessage = 'Медленно опускайтесь';
        this.feedbackClass = 'info';
      } else if (angle > this.maxAngle && this.lastPosture === 'down') {
        // Going up - count repetition
        this.lastPosture = 'up';
        this.repetitionCount++;
        this.currentPhase = 'Подъем';
        this.feedbackMessage = `Отлично! Повторение ${this.repetitionCount}`;
        this.feedbackClass = 'success';
        
        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    },

    checkFormCorrections(landmarks) {
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];
      const nose = landmarks[0];

      // Check back alignment
      if (leftShoulder && rightShoulder && leftHip && rightHip) {
        const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipAvgY = (leftHip.y + rightHip.y) / 2;
        
        if (Math.abs(shoulderAvgY - hipAvgY) > 0.05) {
          this.formCorrections.push('Держите спину прямой! Избегайте прогиба в пояснице');
        }
      }

      // Check head position
      if (nose && leftShoulder && rightShoulder) {
        const shoulderAvgX = (leftShoulder.x + rightShoulder.x) / 2;
        if (Math.abs(nose.x - shoulderAvgX) > 0.1) {
          this.formCorrections.push('Держите голову на одной линии с позвоночником');
        }
      }

      if (this.formCorrections.length > 0) {
        this.showFormCorrection = true;
        this.feedbackClass = 'warning';
      }
    },

    getCorrectionClass(correction) {
      if (correction.includes('прямой')) return 'critical';
      if (correction.includes('голову')) return 'warning';
      return 'info';
    },

  // stopCamera is now above, using new logic

    resetCounter() {
      this.repetitionCount = 0;
      this.lastPosture = 'up';
      this.currentPhase = 'Готовность';
      this.feedbackMessage = 'Счетчик сброшен. Готовы к новому подходу!';
      this.feedbackClass = 'info';
    }
  },
  beforeUnmount() {
    this.stopCamera();
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