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
  return bookmark.image_url && bookmark.image_url !== 'character(0)' ? bookmark.image_url : PLACEHOLDER_IMAGE
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

  <div class="container">
    <h1 class="page-title">My Bookmarks</h1>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div class="create-folder">
      <input v-model="newFolderName" type="text" placeholder="New folder name" class="folder-input"
        @keyup.enter="createFolder" />
      <button @click="createFolder" class="create-button">Create Folder</button>
    </div>

    <div class="folder-list">
      <div v-for="folder in folders" :key="folder.FolderId" class="folder-card"
        :class="{ 'draggable-target': editingFolder[folder.FolderId] }" @drop="onDrop($event, folder.FolderId)"
        @dragover="onDragOver($event)">
        <div v-if="editingFolderId === folder.FolderId && editingFolder[folder.FolderId]" class="edit-mode">
          <input v-model="editedFolderName" type="text" class="folder-input" @keyup.enter="saveEdit(folder.FolderId)" />
          <button @click="saveEdit(folder.FolderId)" class="save-button">Save</button>
          <button @click="cancelEdit" class="cancel-button">Cancel</button>
        </div>
        <div v-else class="folder-content">
          <h3 class="folder-name">
            {{ folder.Name }} <br />
            <i>({{ bookmarks[folder.FolderId]?.length || 0 }} items, Avg:
              {{ folder.AvgRating ? folder.AvgRating.toFixed(1) : 'N/A' }})</i>
          </h3>
          <div class="folder-actions">
            <button v-if="editingFolder[folder.FolderId]" @click="deleteFolder(folder.FolderId)" class="delete-button">
              Delete
            </button>
            <button v-if="editingFolder[folder.FolderId]" @click="startEditing(folder)" class="edit-button">
              Edit Name
            </button>
            <button @click="toggleEditingFolder(folder.FolderId)" class="toggle-edit-button">
              {{ editingFolder[folder.FolderId] ? 'Done' : 'Edit' }}
            </button>
          </div>
        </div>
        <div class="bookmarks-list">
          <div v-if="bookmarks[folder.FolderId] && bookmarks[folder.FolderId].length > 0" class="bookmark-items">
            <div v-for="bookmark in bookmarks[folder.FolderId]" :key="bookmark.BookmarkId" class="bookmark-item"
              :draggable="editingFolder[folder.FolderId]" @dragstart="
                editingFolder[folder.FolderId]
                  ? onDragStart($event, bookmark.BookmarkId, folder.FolderId)
                  : null
                ">
              <div class="bookmark-content">
                <img :src="getImageUrl(bookmark)" class="bookmark-image"
                  @error="handleImageError(bookmark.BookmarkId)" />
                <div class="bookmark-info">
                  <p class="bookmark-name">{{ bookmark.Name }}</p>
                  <div v-if="editingRating[bookmark.BookmarkId] && editingFolder[folder.FolderId]" class="rating-edit">
                    <input v-model.number="bookmark.Rating" type="number" min="1" max="5" class="rating-input" />
                    <button @click="saveRating(folder.FolderId, bookmark.BookmarkId, bookmark.Rating)"
                      class="save-rating">
                      Save
                    </button>
                    <button @click="cancelEditingRating(bookmark.BookmarkId)" class="cancel-rating">
                      Cancel
                    </button>
                  </div>
                  <p v-else class="bookmark-rating">
                    Rating: {{ bookmark.Rating }} / 5
                    <button v-if="editingFolder[folder.FolderId]" @click="startEditingRating(bookmark.BookmarkId)"
                      class="edit-rating">
                      Edit
                    </button>
                  </p>
                </div>
              </div>
              <button v-if="editingFolder[folder.FolderId]"
                @click="deleteBookmark(folder.FolderId, bookmark.BookmarkId)" class="delete-bookmark-button">
                X
              </button>
            </div>
          </div>
          <p v-else class="placeholder">No bookmarks yet</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 40px;
  padding: 40px 20px;
  font-family: 'Arial', sans-serif;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-bottom: 20px;
}

.create-folder {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: center;
}

.folder-input {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 300px;
}

.create-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.create-button:hover {
  background-color: #218838;
}

.folder-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(500px, 1fr));
  gap: 20px;
}

.folder-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.folder-card:hover {
  transform: translateY(-5px);
}

.folder-card.draggable-target {
  background-color: #f0f0f0;
}

.folder-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.folder-name {
  font-size: 20px;
  font-weight: 600;
  color: #444;
  margin: 0;
}

.folder-actions {
  display: flex;
  gap: 10px;
  height: 40px;
}

.toggle-edit-button,
.edit-button,
.delete-button,
.save-button,
.cancel-button,
.delete-bookmark-button,
.edit-rating,
.save-rating,
.cancel-rating {
  padding: 5px 10px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-edit-button {
  background-color: #007bff;
  color: white;
}

.toggle-edit-button:hover {
  background-color: #0056b3;
}

.edit-button {
  background-color: #17a2b8;
  color: white;
}

.edit-button:hover {
  background-color: #138496;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
}

.save-button {
  background-color: #28a745;
  color: white;
}

.save-button:hover {
  background-color: #218838;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
}

.cancel-button:hover {
  background-color: #5a6268;
}

.delete-bookmark-button {
  background-color: #dc3545;
  color: white;
  margin-left: 10px;
}

.delete-bookmark-button:hover {
  background-color: #c82333;
}

.edit-rating {
  background-color: #ffc107;
  color: black;
}

.edit-rating:hover {
  background-color: #e0a800;
}

.save-rating {
  background-color: #28a745;
  color: white;
}

.save-rating:hover {
  background-color: #218838;
}

.cancel-rating {
  background-color: #6c757d;
  color: white;
}

.cancel-rating:hover {
  background-color: #5a6268;
}

.edit-mode {
  display: flex;
  gap: 10px;
  align-items: center;
}

.bookmarks-list {
  margin-top: 15px;
}

.bookmark-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bookmark-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  height: 120px;
}

.bookmark-item[draggable='true'] {
  cursor: move;
}

.bookmark-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.bookmark-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
}

.bookmark-info {
  flex: 1;
}

.bookmark-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.bookmark-rating {
  font-size: 14px;
  color: #666;
  margin: 5px 0 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.rating-edit {
  display: flex;
  gap: 5px;
  align-items: center;
}

.rating-input {
  width: 50px;
  padding: 5px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.placeholder {
  font-size: 14px;
  color: #888;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .folder-list {
    grid-template-columns: 1fr;
  }

  .folder-input {
    width: 100%;
  }
}
</style>
