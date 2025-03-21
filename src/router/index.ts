import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import HomeView from '@/views/HomeView.vue'
import DetailView from '@/views/DetailView.vue'
import BookmarkView from '@/views/BookmarkView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: LoginView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/logout',
      name: 'logout',
      component: LoginView,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/detail/:id',
      name: 'detail',
      component: DetailView,
      props: true, // Pass route params as props, recipe will be undefined if not provided
    },
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: BookmarkView,
    },
  ],
})

export default router
