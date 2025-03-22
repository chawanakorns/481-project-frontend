<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue'
import axios from 'axios'
import NavigationBar from '@/components/NavigationBar.vue'

// Import the local placeholder image
import placeholderImage from '@/assets/placeholder.jpg'

// Placeholder image constant
const PLACEHOLDER_IMAGE = placeholderImage

const userId = ref(1) // Replace with actual auth logic
const folders = ref<any[]>([])
const newFolderName = ref('')
const editingFolderId = ref<number | null>(null)
const editedFolderName = ref('')
const bookmarks = ref<{ [key: number]: any[] }>({})
const errorMessage = ref<string>('')
const editingRating = ref<{ [key: number]: boolean }>({})
const editingFolder = ref<{ [key: number]: boolean }>({})
const imageLoadError = ref<{ [key: string]: boolean }>({})

const fetchFoldersAndBookmarks = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/bookmarks/all?user_id=${userId.value}`)
    folders.value = response.data.folders
    bookmarks.value = response.data.bookmarks
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = 'Failed to fetch folders or bookmarks. Please try again.'
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
    const response = await axios.post('http://localhost:5000/folders', {
      user_id: userId.value,
      name: newFolderName.value.trim(),
    })
    folders.value.push({
      FolderId: response.data.folder_id,
      UserId: userId.value,
      Name: newFolderName.value.trim(),
      AvgRating: null,
    })
    newFolderName.value = ''
    await fetchFoldersAndBookmarks()
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = 'Failed to create folder.'
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
    await axios.put(`http://localhost:5000/folders/${folderId}`, {
      name: editedFolderName.value.trim(),
    })
    const folder = folders.value.find((f) => f.FolderId === folderId)
    if (folder) folder.Name = editedFolderName.value.trim()
    editingFolderId.value = null
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = 'Failed to update folder.'
  }
}

const cancelEdit = () => {
  editingFolderId.value = null
  editedFolderName.value = ''
}

const deleteFolder = async (folderId: number) => {
  try {
    await axios.delete(`http://localhost:5000/folders/${folderId}`)
    folders.value = folders.value.filter((f) => f.FolderId !== folderId)
    delete bookmarks.value[folderId]
    delete editingFolder.value[folderId]
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = 'Failed to delete folder and its bookmarks.'
  }
}

const deleteBookmark = async (folderId: number, bookmarkId: number) => {
  try {
    await axios.delete(`http://localhost:5000/bookmarks/${bookmarkId}`)
    bookmarks.value[folderId] = bookmarks.value[folderId].filter((b) => b.BookmarkId !== bookmarkId)
    await fetchFoldersAndBookmarks()
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = 'Failed to delete bookmark.'
  }
}

const startEditingRating = (bookmarkId: number) => {
  editingRating.value[bookmarkId] = true
}

const saveRating = async (folderId: number, bookmarkId: number, newRating: number) => {
  try {
    await axios.put(`http://localhost:5000/bookmarks/${bookmarkId}/rating`, { rating: newRating })
    const bookmark = bookmarks.value[folderId].find((b) => b.BookmarkId === bookmarkId)
    if (bookmark) bookmark.Rating = newRating
    editingRating.value[bookmarkId] = false
    await fetchFoldersAndBookmarks()
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = 'Failed to update rating.'
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
    await axios.put(`http://localhost:5000/bookmarks/${bookmarkId}`, { folder_id: toFolderId })
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
  }
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
}

// Function to determine the image source with "character(0)" check
const getImageUrl = (bookmark: any) => {
  return bookmark.image_url && bookmark.image_url !== 'character(0)'
    ? bookmark.image_url
    : PLACEHOLDER_IMAGE
}

const handleImageError = (bookmarkId: number) => {
  imageLoadError.value[bookmarkId] = true
  const folderId = Object.keys(bookmarks.value).find((key: any) =>
    bookmarks.value[key].some((b: any) => b.BookmarkId === bookmarkId),
  )
  if (folderId) {
    const bookmark = bookmarks.value[parseInt(folderId)].find((b) => b.BookmarkId === bookmarkId)
    if (bookmark) {
      bookmark.image_url = PLACEHOLDER_IMAGE // Fallback for invalid URLs
    }
  }
}

onMounted(fetchFoldersAndBookmarks)
onActivated(fetchFoldersAndBookmarks)
</script>

<template>
  <NavigationBar />

  <div class="container mt-5 mb-5 pt-5 pb-5">
    <h1 class="page-title display-4 fw-bold text-center mb-4">Bookmarks</h1>
    <p v-if="errorMessage" class="alert alert-danger text-center">{{ errorMessage }}</p>

    <div class="create-folder d-flex justify-content-center gap-3 mb-4">
      <input v-model="newFolderName" type="text" placeholder="New folder name" class="form-control w-25"
        @keyup.enter="createFolder" />
      <button @click="createFolder" class="btn btn-success">Create Folder</button>
    </div>

    <div class="folder-list row row-cols-1 row-cols-lg-2 g-4">
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
                <small class="text-muted">
                  ({{ bookmarks[folder.FolderId]?.length || 0 }} items, Avg:
                  {{ folder.AvgRating ? folder.AvgRating.toFixed(1) : 'N/A' }})
                </small>
              </h3>
              <div class="folder-actions d-flex gap-2">
                <button v-if="editingFolder[folder.FolderId]" @click="deleteFolder(folder.FolderId)"
                  class="btn btn-danger">
                  Delete
                </button>
                <button v-if="editingFolder[folder.FolderId]" @click="startEditing(folder)" class="btn btn-info">
                  Edit Name
                </button>
                <button @click="toggleEditingFolder(folder.FolderId)" class="btn btn-primary">
                  {{ editingFolder[folder.FolderId] ? 'Done' : 'Edit' }}
                </button>
              </div>
            </div>
            <div class="bookmarks-list mt-3">
              <div v-if="bookmarks[folder.FolderId] && bookmarks[folder.FolderId].length > 0" class="bookmark-items">
                <div v-for="bookmark in bookmarks[folder.FolderId]" :key="bookmark.BookmarkId"
                  class="bookmark-item card mb-2" :draggable="editingFolder[folder.FolderId]"
                  @dragstart="editingFolder[folder.FolderId] ? onDragStart($event, bookmark.BookmarkId, folder.FolderId) : null">
                  <div class="card-body d-flex align-items-center">
                    <img :src="getImageUrl(bookmark)" class="bookmark-image rounded me-3"
                      @error="handleImageError(bookmark.BookmarkId)" />
                    <div class="bookmark-info flex-grow-1">
                      <p class="bookmark-name card-text fw-medium mb-1">{{ bookmark.Name }}</p>
                      <div v-if="editingRating[bookmark.BookmarkId] && editingFolder[folder.FolderId]"
                        class="rating-edit d-flex gap-2">
                        <input v-model.number="bookmark.Rating" type="number" min="1" max="5"
                          class="form-control w-25" />
                        <button @click="saveRating(folder.FolderId, bookmark.BookmarkId, bookmark.Rating)"
                          class="btn btn-success btn-sm">
                          Save
                        </button>
                        <button @click="cancelEditingRating(bookmark.BookmarkId)" class="btn btn-secondary btn-sm">
                          Cancel
                        </button>
                      </div>
                      <p v-else class="bookmark-rating card-text text-muted mb-0">
                        Rating: {{ bookmark.Rating }} / 5
                        <button v-if="editingFolder[folder.FolderId]" @click="startEditingRating(bookmark.BookmarkId)"
                          class="btn btn-warning btn-sm ms-2">
                          Edit
                        </button>
                      </p>
                    </div>
                    <button v-if="editingFolder[folder.FolderId]"
                      @click="deleteBookmark(folder.FolderId, bookmark.BookmarkId)" class="btn btn-danger btn-sm ms-2">
                      X
                    </button>
                  </div>
                </div>
              </div>
              <p v-else class="text-muted mt-2">No bookmarks yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
</style>
