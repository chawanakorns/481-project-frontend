<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/stores/api'
import NavigationBar from '@/components/NavigationBar.vue'
import { Icon } from '@iconify/vue'
import DetailView from '@/views/DetailView.vue'
import placeholderImage from '@/assets/placeholder.jpg'

const PLACEHOLDER_IMAGE = placeholderImage

const router = useRouter()
const authStore = useAuthStore()

const userId = ref(localStorage.getItem('user_id') || '')
const folders = ref<any[]>([])
const newFolderName = ref('')
const editingFolderId = ref<number | null>(null)
const editedFolderName = ref('')
const bookmarks = ref<{ [key: number]: any[] }>({})
const errorMessage = ref<string>('')
const editingRating = ref<{ [key: number]: boolean }>({})
const editingFolder = ref<{ [key: number]: boolean }>({})
const imageLoadError = ref<{ [key: string]: boolean }>({})
const suggestions = ref<any[]>([])
const showSuggestionsModal = ref(false)
const selectedRecipe = ref<any | null>(null)
const showRecipeModal = ref(false)
const loading = ref(true) // Add loading state

const fetchFoldersAndBookmarks = async () => {
  try {
    loading.value = true // Set loading to true before fetching
    const response = await api.getAllBookmarks({ params: { user_id: userId.value } })
    folders.value = response.folders
    bookmarks.value = response.bookmarks
    errorMessage.value = ''
  } catch (error) {
    console.error('Error fetching folders and bookmarks:', error)
    errorMessage.value = 'Failed to fetch folders or bookmarks.'
    if ((error as any).response && (error as any).response.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  } finally {
    loading.value = false // Set loading to false after fetching (success or failure)
  }
}

const fetchSuggestions = async (folderId: number) => {
  try {
    const response = await api.getRecommendations({
      params: {
        user_id: userId.value,
        folder_id: folderId,
        limit: 10,
      },
    })
    suggestions.value = response.recommendations
    errorMessage.value = response.message || ''
    if (suggestions.value.length > 0) {
      showSuggestionsModal.value = true
    } else {
      errorMessage.value = response.message || 'No suggestions available.'
    }
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    errorMessage.value = (error as any).response?.data?.message || 'Failed to fetch suggestions.'
    if ((error as any).response && (error as any).response.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  }
}

const toggleEditingFolder = (folderId: number) => {
  editingFolder.value[folderId] = !editingFolder.value[folderId]
  if (!editingFolder.value[folderId]) {
    if (editingFolderId.value === folderId) {
      editingFolderId.value = null
      editedFolderName.value = ''
    }
    bookmarks.value[folderId]?.forEach((bookmark) => {
      editingRating.value[bookmark.BookmarkId] = false
    })
  }
}

const createFolder = async () => {
  if (!newFolderName.value.trim()) {
    errorMessage.value = 'Folder name cannot be empty.'
    return
  }
  try {
    const response = await api.createFolder({
      user_id: userId.value,
      name: newFolderName.value.trim(),
    })
    folders.value.push({
      FolderId: response.folder_id,
      UserId: userId.value,
      Name: newFolderName.value.trim(),
      AvgRating: null,
    })
    newFolderName.value = ''
    await fetchFoldersAndBookmarks()
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = 'Failed to create folder.'
    if ((error as any).response && (error as any).response.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  }
}

const startEditing = (folder: any) => {
  editingFolderId.value = folder.FolderId
  editedFolderName.value = folder.Name
}

const saveEdit = async (folderId: number) => {
  if (!editedFolderName.value.trim()) {
    errorMessage.value = 'Folder name cannot be empty.'
    return
  }
  try {
    await api.updateFolder(folderId, { name: editedFolderName.value.trim() })
    const folder = folders.value.find((f) => f.FolderId === folderId)
    if (folder) folder.Name = editedFolderName.value.trim()
    editingFolderId.value = null
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = 'Failed to update folder.'
    if ((error as any).response && (error as any).response.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  }
}

const cancelEdit = () => {
  editingFolderId.value = null
  editedFolderName.value = ''
}

const deleteFolder = async (folderId: number) => {
  try {
    await api.deleteFolder(folderId)
    folders.value = folders.value.filter((f) => f.FolderId !== folderId)
    delete bookmarks.value[folderId]
    delete editingFolder.value[folderId]
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = 'Failed to delete folder and its bookmarks.'
    if ((error as any).response && (error as any).response.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  }
}

const deleteBookmark = async (folderId: number, bookmarkId: number) => {
  try {
    await api.deleteBookmark(bookmarkId)
    bookmarks.value[folderId] = bookmarks.value[folderId].filter((b) => b.BookmarkId !== bookmarkId)
    await fetchFoldersAndBookmarks()
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = 'Failed to delete bookmark.'
    if ((error as any).response && (error as any).response.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  }
}

const startEditingRating = (bookmarkId: number) => {
  editingRating.value[bookmarkId] = true
}

const saveRating = async (folderId: number, bookmarkId: number, newRating: number) => {
  if (newRating < 1 || newRating > 5) {
    errorMessage.value = 'Rating must be between 1 and 5.'
    return
  }
  try {
    await api.updateBookmarkRating(bookmarkId, { rating: newRating })
    const bookmark = bookmarks.value[folderId].find((b) => b.BookmarkId === bookmarkId)
    if (bookmark) bookmark.Rating = newRating
    editingRating.value[bookmarkId] = false
    await fetchFoldersAndBookmarks()
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = 'Failed to update rating.'
    if ((error as any).response && (error as any).response.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  }
}

const cancelEditingRating = (bookmarkId: number) => {
  editingRating.value[bookmarkId] = false
}

const onDragStart = (event: DragEvent, bookmarkId: number, fromFolderId: number) => {
  event.dataTransfer?.setData('bookmarkId', bookmarkId.toString())
  event.dataTransfer?.setData('fromFolderId', fromFolderId.toString())
}

const onDrop = async (event: DragEvent, toFolderId: number) => {
  event.preventDefault()
  const bookmarkId = parseInt(event.dataTransfer?.getData('bookmarkId') || '0')
  const fromFolderId = parseInt(event.dataTransfer?.getData('fromFolderId') || '0')
  if (fromFolderId === toFolderId) return
  try {
    await api.updateBookmark(bookmarkId, { folder_id: toFolderId })
    const bookmark = bookmarks.value[fromFolderId].find((b) => b.BookmarkId === bookmarkId)
    bookmarks.value[fromFolderId] = bookmarks.value[fromFolderId].filter(
      (b) => b.BookmarkId !== bookmarkId,
    )
    if (!bookmarks.value[toFolderId]) bookmarks.value[toFolderId] = []
    bookmarks.value[toFolderId].push({ ...bookmark, FolderId: toFolderId })
    await fetchFoldersAndBookmarks()
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = 'Failed to move bookmark.'
    if ((error as any).response && (error as any).response.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  }
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const openRecipeModal = (recipe: any) => {
  selectedRecipe.value = recipe
  showRecipeModal.value = true
}

const closeRecipeModal = () => {
  showRecipeModal.value = false
  selectedRecipe.value = null
}

const closeSuggestionsModal = () => {
  showSuggestionsModal.value = false
  suggestions.value = []
}

const getImageUrl = (item: any) => {
  return item.image_url && item.image_url !== 'character(0)' ? item.image_url : PLACEHOLDER_IMAGE
}

const handleImageError = (id: number) => {
  imageLoadError.value[id] = true
  const folderId =
    Object.keys(bookmarks.value).find((key: any) =>
      bookmarks.value[key].some((b: any) => b.BookmarkId === id),
    ) || suggestions.value.find((r) => r.RecipeId === id)?.RecipeId
  if (folderId) {
    const bookmark = bookmarks.value[parseInt(folderId)]?.find((b) => b.BookmarkId === id)
    if (bookmark) bookmark.image_url = PLACEHOLDER_IMAGE
  } else {
    const suggestion = suggestions.value.find((r) => r.RecipeId === id)
    if (suggestion) suggestion.image_url = PLACEHOLDER_IMAGE
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated()) {
    router.push('/login')
    return
  }
  fetchFoldersAndBookmarks()
})

onActivated(fetchFoldersAndBookmarks)
</script>

<template>
  <NavigationBar />
  <div class="container mt-5 mb-5 pt-5 pb-5">
    <h1 class="page-title display-4 fw-bold text-center mb-4">Bookmarks</h1>
    <p v-if="errorMessage" class="alert alert-success text-center">{{ errorMessage }}</p>

    <div class="create-folder d-flex justify-content-center gap-3 mb-4">
      <input v-model="newFolderName" type="text" placeholder="New folder name" class="form-control w-25"
        @keyup.enter="createFolder" />
      <button @click="createFolder" class="btn btn-success">Create Folder</button>
    </div>

    <!-- Show loading message while fetching data -->
    <div v-if="loading" class="text-center p-4 my-5">
      <p class="h6 text-muted">Loading bookmarks...</p>
    </div>

    <!-- Show content after loading is complete -->
    <div v-else>
      <!-- Display message when there are no bookmark folders -->
      <div v-if="folders.length === 0" class="text-center p-4 my-5">
        <p class="h6 text-muted">
          There is no bookmark now. You can find recipes
          <router-link to="/home" class="text-primary fw-bold text-decoration-none">
            Here!
          </router-link>
        </p>
      </div>

      <!-- Folder list (only shown if there are folders) -->
      <div v-else class="folder-list row row-cols-1 row-cols-lg-2 g-4 px-5 py-3">
        <div v-for="folder in folders" :key="folder.FolderId" class="col">
          <div class="folder-card card shadow-sm h-100" :class="{ 'bg-light': editingFolder[folder.FolderId] }"
            @drop="onDrop($event, folder.FolderId)" @dragover="onDragOver($event)">
            <div class="card-body">
              <div v-if="editingFolderId === folder.FolderId && editingFolder[folder.FolderId]"
                class="edit-mode d-flex gap-2">
                <input v-model="editedFolderName" type="text" class="form-control"
                  @keyup.enter="saveEdit(folder.FolderId)" />
                <button @click="saveEdit(folder.FolderId)" class="btn btn-success">Save</button>
                <button @click="cancelEdit" class="btn btn-secondary">Cancel</button>
              </div>
              <div v-else class="folder-content d-flex justify-content-between align-items-center">
                <h3 class="folder-name card-title fw-bold">
                  {{ folder.Name }} <br />
                  <small class="text-muted h5">
                    ({{ bookmarks[folder.FolderId]?.length || 0 }} items, Avg:
                    {{ folder.AvgRating ? folder.AvgRating.toFixed(1) : 'N/A' }})
                  </small>
                </h3>
                <div class="folder-actions d-flex gap-2">
                  <button v-if="editingFolder[folder.FolderId]" @click="deleteFolder(folder.FolderId)"
                    class="btn btn-danger">
                    <Icon icon="mdi:trash-can-outline" style="font-size: 1.2rem" />
                  </button>
                  <button v-if="editingFolder[folder.FolderId]" @click="startEditing(folder)"
                    class="btn btn-info d-flex align-items-center gap-1">
                    <Icon icon="mdi:pencil-outline" style="font-size: 1.2rem" />
                    <span class="fs-6">Edit Name</span>
                  </button>
                  <button v-if="!editingFolder[folder.FolderId]" @click="fetchSuggestions(folder.FolderId)"
                    class="btn btn-secondary d-flex align-items-center gap-1">
                    <Icon icon="mdi:lightbulb-outline" style="font-size: 1.2rem" />
                    <span class="fs-6">Suggestions</span>
                  </button>
                  <button @click="toggleEditingFolder(folder.FolderId)"
                    class="btn btn-primary d-flex align-items-center gap-1">
                    <Icon :icon="editingFolder[folder.FolderId] ? 'mdi:check' : 'mdi:edit'" style="font-size: 1.2rem" />
                    <span class="fs-6">{{ editingFolder[folder.FolderId] ? 'Done' : 'Edit' }}</span>
                  </button>
                </div>
              </div>
              <div class="bookmarks-list mt-3">
                <div v-if="bookmarks[folder.FolderId] && bookmarks[folder.FolderId].length > 0" class="bookmark-items">
                  <div v-for="bookmark in bookmarks[folder.FolderId]" :key="bookmark.BookmarkId"
                    class="bookmark-item card mb-2" :draggable="editingFolder[folder.FolderId]" @dragstart="
                      editingFolder[folder.FolderId]
                        ? onDragStart($event, bookmark.BookmarkId, folder.FolderId)
                        : null
                      ">
                    <div class="card-body d-flex align-items-center">
                      <img :src="getImageUrl(bookmark)" class="bookmark-image rounded me-3"
                        @error="handleImageError(bookmark.BookmarkId)" />
                      <div class="bookmark-info flex-grow-1">
                        <p class="bookmark-name card-text fw-medium mb-1">{{ bookmark.Name }}</p>
                        <div v-if="
                          editingRating[bookmark.BookmarkId] && editingFolder[folder.FolderId]
                        " class="rating-edit d-flex gap-2 align-items-center">
                          <div :class="[
                            'star-rating',
                            {
                              editable:
                                editingRating[bookmark.BookmarkId] &&
                                editingFolder[folder.FolderId],
                            },
                          ]">
                            <Icon v-for="star in 5" :key="star"
                              :icon="star <= bookmark.Rating ? 'mdi:star' : 'mdi:star-outline'" :class="[
                                star <= bookmark.Rating ? 'text-warning' : 'text-muted',
                                'me-1',
                              ]" @click="bookmark.Rating = star" style="cursor: pointer; font-size: 1.2rem" />
                          </div>
                          <button @click="
                            saveRating(folder.FolderId, bookmark.BookmarkId, bookmark.Rating)
                            " class="btn btn-success btn-sm">
                            Save
                          </button>
                          <button @click="cancelEditingRating(bookmark.BookmarkId)" class="btn btn-secondary btn-sm">
                            Cancel
                          </button>
                        </div>
                        <p v-else class="bookmark-rating card-text text-muted mb-0 d-flex align-items-center">
                          <span :class="['star-rating', { editable: false }]" class="me-2">
                            <Icon v-for="star in 5" :key="star"
                              :icon="star <= bookmark.Rating ? 'mdi:star' : 'mdi:star-outline'" :class="[
                                star <= bookmark.Rating ? 'text-warning' : 'text-muted',
                                'me-1',
                              ]" style="font-size: 1rem" />
                          </span>
                          ({{ bookmark.Rating }}/5)
                          <button v-if="editingFolder[folder.FolderId]" @click="startEditingRating(bookmark.BookmarkId)"
                            class="btn btn-warning btn-sm ms-2">
                            Edit
                          </button>
                        </p>
                      </div>
                      <button v-if="editingFolder[folder.FolderId]"
                        @click="deleteBookmark(folder.FolderId, bookmark.BookmarkId)"
                        class="btn btn-danger btn-sm ms-2">
                        <Icon icon="mdi:trash-can-outline" style="font-size: 1.2rem" />
                      </button>
                    </div>
                  </div>
                </div>
                <p v-else class="text-muted mt-2 text-center">No bookmarks yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Suggestions Modal -->
  <Teleport to="body" v-if="showSuggestionsModal">
    <div class="modal fade show" id="suggestionsModal" tabindex="-1" aria-labelledby="suggestionsModalLabel"
      style="display: block; z-index: 1050">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style="z-index: 1051">
        <div class="modal-content p-4">
          <div class="modal-header">
            <h5 class="modal-title h3" id="suggestionsModalLabel">Suggested Recipes</h5>
            <button type="button" class="btn-close" @click="closeSuggestionsModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="suggestions.length === 0" class="text-center p-4 text-muted">
              <p>{{ errorMessage || 'No suggestions available.' }}</p>
            </div>
            <div v-else class="row row-cols-1 row-cols-md-2 g-4">
              <div v-for="recipe in suggestions" :key="recipe.RecipeId" class="col">
                <div class="card h-100" @click="openRecipeModal(recipe)">
                  <img :src="getImageUrl(recipe)" class="card-img-top" @error="handleImageError(recipe.RecipeId)" />
                  <div class="card-body">
                    <h5 class="card-title fw-bold text-truncate">
                      {{ recipe.Name || 'Name not loaded' }}
                    </h5>
                    <p class="card-text text-muted text-truncate">
                      {{ recipe.Description || 'No description' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" style="z-index: 1049" @click="closeSuggestionsModal"></div>
  </Teleport>

  <!-- Recipe Details Modal -->
  <Teleport to="body" v-if="showRecipeModal">
    <div class="modal fade show" id="recipeModal" tabindex="-1" aria-labelledby="recipeModalLabel"
      style="display: block; z-index: 1050">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" style="z-index: 1051">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="btn-close" @click="closeRecipeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-5">
            <DetailView :id="selectedRecipe.RecipeId.toString()" :recipe="selectedRecipe" />
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" style="z-index: 1049" @click="closeRecipeModal"></div>
  </Teleport>
</template>

<style scoped>
.container {
  font-family: 'Arial', sans-serif;
}

.folder-card {
  transition: transform 0.3s;
}

.folder-card:hover {
  transform: translateY(-5px);
}

.bookmark-item[draggable='true'] {
  cursor: move;
}

.bookmark-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

.card-img-top {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.btn-success,
.btn-danger,
.btn-primary,
.btn-info,
.btn-warning,
.btn-secondary {
  transition: background-color 0.3s;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-info:hover {
  background-color: #138496;
}

.btn-warning:hover {
  background-color: #e0a800;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.star-rating.editable .iconify:hover {
  color: #ffc107 !important;
}
</style>
