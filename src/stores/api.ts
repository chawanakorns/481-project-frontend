/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import { useAuthStore } from './auth'

const API_URL = 'http://localhost:5000'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('No token found in auth store or localStorage')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized request - redirecting to login')
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default {
  async getRecipes(params = {}) {
    const response = await api.get('/recipes', params)
    return response.data
  },
  async getRecipe(id: string) {
    const response = await api.get(`/recipes/${id}`)
    return response.data
  },
  async getRecommendations(params = {}) {
    const response = await api.get('/recommendations', params)
    return response.data
  },
  async getFolders(params = {}) {
    const response = await api.get('/folders', params)
    return response.data
  },
  async createBookmark(data: any) {
    const response = await api.post('/bookmarks', data)
    return response.data
  },
  async getAllBookmarks(params = {}) {
    const response = await api.get('/bookmarks/all', params)
    return response.data
  },
  async createFolder(data: any) {
    const response = await api.post('/folders', data)
    return response.data
  },
  async updateFolder(folderId: number, data: any) {
    const response = await api.put(`/folders/${folderId}`, data)
    return response.data
  },
  async deleteFolder(folderId: number) {
    const response = await api.delete(`/folders/${folderId}`)
    return response.data
  },
  async deleteBookmark(bookmarkId: number) {
    const response = await api.delete(`/bookmarks/${bookmarkId}`)
    return response.data
  },
  async updateBookmark(bookmarkId: number, data: any) {
    const response = await api.put(`/bookmarks/${bookmarkId}`, data)
    return response.data
  },
  async updateBookmarkRating(bookmarkId: number, data: any) {
    const response = await api.put(`/bookmarks/${bookmarkId}/rating`, data)
    return response.data
  },
}
