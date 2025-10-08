export const exercises = [
  {
    id: 'pushups',
    name: 'Отжимания',
    nameEn: 'Push-ups',
    category: 'Грудь',
    difficulty: 'Начинающий',
    difficultyEn: 'Beginner',
    description: 'Классическое упражнение для развития мышц груди, плеч и трицепсов',
    videoUrl: 'https://rutube.ru/play/embed/ff46fa6927f5d532de1429dee83d3273/',
    videoTitle: 'Обучение отжиманиям',
    importantPoints: [
      'Тело должно образовывать прямую линию от головы до пяток',
      'Локти должны быть под углом 45-60 градусов к телу',
      'Опускайтесь до угла 90 градусов в локтях',
      'Держите корпус напряженным во время движения',
      'Дышите правильно: вдох при опускании, выдох при подъеме'
    ],
    commonMistakes: [
      'Прогиб в пояснице',
      'Неполная амплитуда движения',
      'Разведение локтей в стороны',
      'Задержка дыхания'
    ],
    poseDetection: {
      exerciseType: 'pushups',
      minAngle: 90,
      maxAngle: 160,
      bodyPositionThreshold: 0.4,
      keyPoints: {
        shoulders: [11, 12],
        elbows: [13, 14],
        wrists: [15, 16],
        hips: [23, 24],
        ankles: [27, 28]
      }
    }
  },
  {
    id: 'squats',
    name: 'Приседания',
    nameEn: 'Squats',
    category: 'Ноги',
    difficulty: 'Начинающий',
    difficultyEn: 'Beginner',
    description: 'Базовое упражнение для развития мышц ног и ягодиц',
    videoUrl: 'https://rutube.ru/play/embed/df81ef638919b19e7e46ac30d81ae72c/',
    videoTitle: 'Обучение приседаниям',
    importantPoints: [
      'Стопы на ширине плеч или чуть уже',
      'Колени не выходят за носки',
      'Спина прямая, взгляд вперед',
      'Приседайте до параллели пола или ниже',
      'Тяжесть на пятках'
    ],
    commonMistakes: [
      'Колени заваливаются внутрь',
      'Сильный наклон корпуса вперед',
      'Подъемы на носки',
      'Неполная амплитуда'
    ],
    poseDetection: {
      exerciseType: 'squats',
      minAngle: 90,
      maxAngle: 170,
      bodyPositionThreshold: 0.3,
      keyPoints: {
        hips: [23, 24],
        knees: [25, 26],
        ankles: [27, 28],
        shoulders: [11, 12]
      }
    }
  },
  {
    id: 'lunges',
    name: 'Выпады',
    nameEn: 'Lunges',
    category: 'Ноги',
    difficulty: 'Средний',
    difficultyEn: 'Medium',
    description: 'Упражнение для развития мышц ног с акцентом на ягодицы и квадрицепсы',
    videoUrl: 'https://rutube.ru/play/embed/fb883fe537f6f5d7f8c4de708b6a0080/',
    videoTitle: 'Обучение выпадам',
    importantPoints: [
      'Шаг вперед достаточной длины',
      'Переднее колено не выходит за носок',
      'Заднее колено почти касается пола',
      'Спина прямая, корпус вертикальный',
      'Плавные контролируемые движения'
    ],
    commonMistakes: [
      'Слишком короткий шаг',
      'Колени заваливаются внутрь',
      'Наклон корпуса вперед',
      'Отрыв задней ноги от пола'
    ],
    poseDetection: {
      exerciseType: 'lunges',
      minAngle: 80,
      maxAngle: 160,
      bodyPositionThreshold: 0.35,
      keyPoints: {
        hips: [23, 24],
        knees: [25, 26],
        ankles: [27, 28],
        shoulders: [11, 12]
      }
    }
  },
  {
    id: 'plank',
    name: 'Планка',
    nameEn: 'Plank',
    category: 'Кор',
    difficulty: 'Продвинутый',
    difficultyEn: 'Advanced',
    description: 'Упражнение для укрепления мышц кора и стабилизации корпуса',
    videoUrl: 'https://rutube.ru/play/embed/4d856b988d2da6caf41bdc1f55594f96/',
    videoTitle: 'Обучение планке',
    importantPoints: [
      'Тело образует прямую линию',
      'Локти под углом 90 градусов к телу',
      'Ноги вместе, носки упираются в пол',
      'Живот втянут, ягодицы напряжены',
      'Дышите ровно и глубоко'
    ],
    commonMistakes: [
      'Прогиб в пояснице',
      'Поднятие таза вверх',
      'Заваливание плеч вперед',
      'Задержка дыхания'
    ],
    poseDetection: {
      exerciseType: 'plank',
      minAngle: 85,
      maxAngle: 95,
      bodyPositionThreshold: 0.1,
      keyPoints: {
        shoulders: [11, 12],
        hips: [23, 24],
        knees: [25, 26],
        ankles: [27, 28]
      }
    }
  }
]

export function getExerciseById(id) {
  return exercises.find(exercise => exercise.id === id)
}

export function getExercisesByCategory(category) {
  return exercises.filter(exercise => exercise.category === category)
}

export function getExercisesByDifficulty(difficulty) {
  return exercises.filter(exercise => exercise.difficulty === difficulty)
}

export function getAllCategories() {
  const categories = [...new Set(exercises.map(exercise => exercise.category))]
  return categories
}

export function getAllDifficulties() {
  const difficulties = [...new Set(exercises.map(exercise => exercise.difficulty))]
  return difficulties
}