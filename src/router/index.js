import { createRouter, createWebHistory } from 'vue-router'
import ExerciseList from '../views/ExerciseList.vue'
import ExercisePage from '../views/ExercisePage.vue'

const routes = [
  {
    path: '/',
    name: 'ExerciseList',
    component: ExerciseList
  },
  {
    path: '/exercise/:id',
    name: 'ExercisePage',
    component: ExercisePage,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory('/fitness-poc/'),
  routes
})

export default router