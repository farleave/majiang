import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import VenueDetail from '../views/VenueDetail.vue'
import GameDetail from '../views/GameDetail.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/venue/:id', name: 'VenueDetail', component: VenueDetail },
  { path: '/game/:id', name: 'GameDetail', component: GameDetail },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router