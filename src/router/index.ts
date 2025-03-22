import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import HomeView from '@/views/HomeView.vue'
import DetailView from '@/views/DetailView.vue'
import BookmarkView from '@/views/BookmarkView.vue'
import { useAuthStore } from '@/stores/auth'

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
      beforeEnter: (to, from, next) => {
        const authStore = useAuthStore()
        authStore.logout()
        next('/login')
      },
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/detail/:id',
      name: 'detail',
      component: DetailView,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: BookmarkView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

export default router
