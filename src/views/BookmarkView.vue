<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import NavigationBar from '@/components/NavigationBar.vue'

const userId = ref(1) // Simulated, replace with actual user ID from auth
const folders = ref<any[]>([])
const newFolderName = ref('')
const editingFolderId = ref<number | null>(null)
const editedFolderName = ref('')
const bookmarks = ref<{ [key: number]: any[] }>({})

const fetchFolders = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/folders?user_id=${userId.value}`)
    folders.value = response.data
    await fetchBookmarksForFolders()
  } catch (error) {
    console.error('Error fetching folders:', error)
  }
}

const fetchBookmarksForFolders = async () => {
  for (const folder of folders.value) {
    try {
      const response = await axios.get(`http://localhost:5000/bookmarks/${folder.FolderId}`)
      bookmarks.value[folder.FolderId] = response.data
    } catch (error) {
      console.error(`Error fetching bookmarks for folder ${folder.FolderId}:`, error)
    }
  }
}

const createFolder = async () => {
  if (newFolderName.value.trim()) {
    try {
      const response = await axios.post('http://localhost:5000/folders', {
        user_id: userId.value,
        name: newFolderName.value.trim(),
      })
      folders.value.push({ FolderId: response.data.folder_id, UserId: userId.value, Name: newFolderName.value.trim() })
      newFolderName.value = ''
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }
}

const startEditing = (folder: any) => {
  editingFolderId.value = folder.FolderId
  editedFolderName.value = folder.Name
}

const saveEdit = async (folderId: number) => {
  if (editedFolderName.value.trim()) {
    try {
      await axios.put(`http://localhost:5000/folders/${folderId}`, { name: editedFolderName.value.trim() })
      const folder = folders.value.find((f) => f.FolderId === folderId)
      if (folder) folder.Name = editedFolderName.value.trim()
      editingFolderId.value = null
    } catch (error) {
      console.error('Error updating folder:', error)
    }
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
  } catch (error) {
    console.error('Error deleting folder:', error)
  }
}

onMounted(fetchFolders)
</script>

<template>
  <NavigationBar />

  <div class="container">
    <h1 class="page-title">My Bookmarks</h1>

    <div class="create-folder">
      <input v-model="newFolderName" type="text" placeholder="New folder name" class="folder-input"
        @keyup.enter="createFolder" />
      <button @click="createFolder" class="create-button">Create Folder</button>
    </div>

    <div class="folder-list">
      <div v-for="folder in folders" :key="folder.FolderId" class="folder-card">
        <div v-if="editingFolderId === folder.FolderId" class="edit-mode">
          <input v-model="editedFolderName" type="text" class="folder-input" @keyup.enter="saveEdit(folder.FolderId)" />
          <button @click="saveEdit(folder.FolderId)" class="save-button">Save</button>
          <button @click="cancelEdit" class="cancel-button">Cancel</button>
        </div>
        <div v-else class="folder-content">
          <h3 class="folder-name">{{ folder.Name }}</h3>
          <div class="folder-actions">
            <button @click="startEditing(folder)" class="edit-button">Edit</button>
            <button @click="deleteFolder(folder.FolderId)" class="delete-button">Delete</button>
          </div>
        </div>
        <div class="bookmarks-list">
          <div v-if="bookmarks[folder.FolderId] && bookmarks[folder.FolderId].length > 0" class="bookmark-items">
            <div v-for="bookmark in bookmarks[folder.FolderId]" :key="bookmark.BookmarkId" class="bookmark-item">
              <router-link :to="{ name: 'detail', params: { id: bookmark.RecipeId, recipe: bookmark } }"
                class="bookmark-link">
                <img :src="bookmark.image_url" class="bookmark-image" />
                <div class="bookmark-info">
                  <p class="bookmark-name">{{ bookmark.Name }}</p>
                  <p class="bookmark-rating">Rating: {{ bookmark.Rating }} / 5</p>
                </div>
              </router-link>
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
}

.edit-button,
.delete-button,
.save-button,
.cancel-button {
  padding: 5px 10px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-button {
  background-color: #007bff;
  color: white;
}

.edit-button:hover {
  background-color: #0056b3;
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
}

.bookmark-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  width: 100%;
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
