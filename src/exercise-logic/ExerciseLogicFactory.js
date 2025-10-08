import { ExerciseLogic } from './ExerciseLogic.js'
import { PushupLogic } from './PushupLogic.js'
import { SquatLogic } from './SquatLogic.js'
import { PlankLogic } from './PlankLogic.js'
import { LungeLogic } from './LungeLogic.js'

export class ExerciseLogicFactory {
  static createLogic(exerciseType, exerciseData) {
    switch (exerciseType) {
      case 'pushups':
        return new PushupLogic(exerciseData)
      case 'squats':
        return new SquatLogic(exerciseData)
      case 'plank':
        return new PlankLogic(exerciseData)
      case 'lunges':
        return new LungeLogic(exerciseData)
      default:
        // Default to base ExerciseLogic for unknown exercise types
        return new ExerciseLogic(exerciseData)
    }
  }
}