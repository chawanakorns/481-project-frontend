import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:5000'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userId: localStorage.getItem('user_id') || null,
  }),
  actions: {
    async login(username: string, password: string) {
      try {
        const response = await axios.post(`${API_URL}/login`, { username, password })
        this.token = response.data.token
        this.userId = response.data.user_id
        localStorage.setItem('token', this.token)
        localStorage.setItem('user_id', this.userId)
        return response.data
      } catch (error) {
        throw error.response?.data || { message: 'Login failed' }
      }
    },
    async register(username: string, password: string) {
      try {
        const response = await axios.post(`${API_URL}/register`, { username, password })
        return response.data
      } catch (error) {
        throw error.response?.data || { message: 'Registration failed' }
      }
    },
    logout() {
      this.token = null
      this.userId = null
      localStorage.removeItem('token')
      localStorage.removeItem('user_id')
    },
    isAuthenticated() {
      return !!this.token
    },
  },
})
