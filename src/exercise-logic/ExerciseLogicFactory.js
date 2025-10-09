import { PushupLogic } from './PushupLogic.js'
import { SquatLogic } from './SquatLogic.js'
import { PlankLogic } from './PlankLogic.js'
import { LungeLogic } from './LungeLogic.js'

export class ExerciseLogicFactory {
  static createLogic(exerciseType) {
    switch (exerciseType) {
      case 'pushups':
        return new PushupLogic()
      case 'squats':
        return new SquatLogic()
      case 'plank':
        return new PlankLogic()
      case 'lunges':
        return new LungeLogic()
    }
  }
}