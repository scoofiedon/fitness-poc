<template>
  <div class="pose-detection">
    <h2>Тренер по отжиманиям</h2>
    <div class="camera-section">
      <video ref="videoElement" class="video" autoplay playsinline></video>
      <canvas ref="canvasElement" class="overlay"></canvas>
    </div>
    <div class="controls">
      <button @click="startCamera" :disabled="isCameraActive">Запустить камеру</button>
      <button @click="stopCamera" :disabled="!isCameraActive">Остановить камеру</button>
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
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

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
      
      // Pose detection variables
      poseLandmarker: null,
      camera: null,
      lastPosture: 'up', // 'up' or 'down'
      minAngle: 90,
      maxAngle: 160,
      isInPushupPosition: false
    }
  },
  methods: {
    async startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          this.feedbackMessage = 'Ваш браузер не поддерживает доступ к камере';
          this.feedbackClass = 'error';
          return;
        }

        // Initialize PoseLandmarker
        await this.initializePoseLandmarker();
        
        // Start camera
        const videoElement = this.$refs.videoElement;
        const canvasElement = this.$refs.canvasElement;
        const canvasCtx = canvasElement.getContext('2d');

        this.camera = new Camera(videoElement, {
          onFrame: async () => {
            await this.poseLandmarker.send({ image: videoElement });
          },
          width: 640,
          height: 480
        });

        await this.camera.start();
        this.isCameraActive = true;
        this.feedbackMessage = 'Камера активна. Встаньте в положение для отжиманий.';
        this.feedbackClass = 'success';

      } catch (error) {
        console.error('Error starting camera:', error);
        this.feedbackMessage = 'Ошибка доступа к камере: ' + error.message;
        this.feedbackClass = 'error';
      }
    },

    async initializePoseLandmarker() {
      this.poseLandmarker = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      this.poseLandmarker.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.poseLandmarker.onResults(this.onPoseResults);
    },

    onPoseResults(results) {
      const canvasElement = this.$refs.canvasElement;
      const canvasCtx = canvasElement.getContext('2d');
      
      // Set canvas dimensions to match video
      canvasElement.width = this.$refs.videoElement.videoWidth;
      canvasElement.height = this.$refs.videoElement.videoHeight;
      
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
      
      if (results.poseLandmarks) {
        this.drawLandmarks(canvasCtx, results.poseLandmarks);
        this.analyzePose(results.poseLandmarks);
      }
      
      canvasCtx.restore();
    },

    drawLandmarks(ctx, landmarks) {
      ctx.fillStyle = '#00FF00';
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 2;

      // Draw key points for push-up analysis
      const keyPoints = [
        11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28 // shoulders, elbows, wrists, hips, knees, ankles
      ];

      keyPoints.forEach(index => {
        const landmark = landmarks[index];
        if (landmark) {
          ctx.beginPath();
          ctx.arc(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // Draw lines for body skeleton
      this.drawSkeleton(ctx, landmarks);
    },

    drawSkeleton(ctx, landmarks) {
      // Full MediaPipe Pose connections (33 landmarks)
      const connections = [
        [0,1],[1,2],[2,3],[3,7], // Nose to left eye/ear
        [0,4],[4,5],[5,6],[6,8], // Nose to right eye/ear
        [9,10], // Mouth
        [11,12], // Shoulders
        [11,13],[13,15],[15,17],[15,19],[15,21], // Left arm
        [17,19],[12,14],[14,16],[16,18],[16,20],[16,22],[18,20], // Right arm
        [11,23],[12,24], // Shoulders to hips
        [23,24], // Hips
        [23,25],[25,27],[27,29],[29,31], // Left leg
        [27,31],[24,26],[26,28],[28,30],[30,32],[28,32] // Right leg
      ];

      connections.forEach(([start, end]) => {
        const startLandmark = landmarks[start];
        const endLandmark = landmarks[end];
        if (startLandmark && endLandmark) {
          ctx.beginPath();
          ctx.moveTo(startLandmark.x * ctx.canvas.width, startLandmark.y * ctx.canvas.height);
          ctx.lineTo(endLandmark.x * ctx.canvas.width, endLandmark.y * ctx.canvas.height);
          ctx.stroke();
        } else {
          // Debug: log missing landmarks
          if (!startLandmark || !endLandmark) {
            // Uncomment for debugging:
            // console.log(`Missing landmark(s): ${start} or ${end}`);
          }
        }
      });
    },

    analyzePose(landmarks) {
      this.formCorrections = [];
      this.showFormCorrection = false;

      // Check if person is in push-up position (roughly horizontal)
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];

      if (leftShoulder && rightShoulder && leftHip && rightHip) {
        const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipAvgY = (leftHip.y + rightHip.y) / 2;
        const bodyAngle = Math.abs(shoulderAvgY - hipAvgY);
        
        this.isInPushupPosition = bodyAngle < 0.1; // Threshold for horizontal position

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

    stopCamera() {
      if (this.camera) {
        this.camera.stop();
      }
      if (this.poseLandmarker) {
        this.poseLandmarker.close();
      }
      this.isCameraActive = false;
      this.feedbackMessage = 'Камера остановлена';
      this.feedbackClass = 'info';
      this.currentPhase = 'Готовность';
      this.showFormCorrection = false;
    },

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
  max-width: 640px;
  margin: 0 auto;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.video, .overlay {
  width: 100%;
  height: auto;
  display: block;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
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
    max-width: 100%;
  }
  
  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  button {
    margin: 0;
  }
}
</style>