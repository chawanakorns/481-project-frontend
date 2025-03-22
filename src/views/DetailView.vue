<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- DetailView.vue -->
<script setup lang="ts">
import { defineProps, ref, onMounted } from 'vue'
import axios from 'axios'
import { Icon } from '@iconify/vue'

import placeholderImage from '@/assets/placeholder.jpg'

const PLACEHOLDER_IMAGE = placeholderImage

const props = defineProps<{
  id: string
  recipe?: any
}>()

const localRecipe = ref<any>(props.recipe)
const imageLoadError = ref<{ [key: string]: boolean }>({})
const folders = ref<any[]>([])
const selectedFolderId = ref<number | null>(null)
const rating = ref<number>(1)
const userId = ref(1) // TODO: Replace with actual auth logic
const feedbackMessage = ref<string>('')
const showBookmarkSection = ref(false)

const formatTime = (minutes: number | null | undefined): string => {
  if (!minutes || typeof minutes !== 'number' || minutes <= 0) return 'Not specified'
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  let result = ''
  if (hours > 0) result += `${hours} hour${hours > 1 ? 's' : ''}`
  if (remainingMinutes > 0) result += `${hours > 0 ? ' ' : ''}${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`
  return result.trim()
}

const fetchRecipe = async () => {
  if (!localRecipe.value) {
    try {
      const response = await axios.get(`http://localhost:5000/recipes/${props.id}`)
      localRecipe.value = response.data
      feedbackMessage.value = ''
    } catch (error) {
      feedbackMessage.value = 'Failed to fetch recipe details.'
    }
  }
}

const fetchFolders = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/folders?user_id=${userId.value}`)
    folders.value = response.data
    if (folders.value.length > 0) selectedFolderId.value = folders.value[0].FolderId
    else feedbackMessage.value = 'No folders found. Create one in the Bookmarks page.'
  } catch (error) {
    feedbackMessage.value = 'Failed to fetch folders.'
  }
}

const bookmarkRecipe = async () => {
  if (!selectedFolderId.value || !rating.value || rating.value < 1 || rating.value > 5) {
    feedbackMessage.value = 'Please select a folder and provide a rating (1-5).'
    return
  }
  try {
    await axios.post('http://localhost:5000/bookmarks', {
      user_id: userId.value,
      folder_id: selectedFolderId.value,
      recipe_id: localRecipe.value.RecipeId,
      rating: rating.value,
    })
    feedbackMessage.value = 'Recipe bookmarked successfully!'
    showBookmarkSection.value = false
  } catch (error) {
    feedbackMessage.value = 'Failed to bookmark recipe.'
  }
}

const getImageUrl = (recipe: any) => {
  return recipe.image_url && recipe.image_url !== 'character(0)' ? recipe.image_url : PLACEHOLDER_IMAGE
}

const handleImageError = (recipeId: number) => {
  imageLoadError.value[recipeId] = true
  if (localRecipe.value) localRecipe.value.image_url = PLACEHOLDER_IMAGE
}

const toggleBookmarkSection = () => {
  showBookmarkSection.value = !showBookmarkSection.value
}

onMounted(() => {
  fetchRecipe()
  fetchFolders()
})
</script>

<template>
  <div class="modal-container">
    <div v-if="feedbackMessage"
      :class="['alert', feedbackMessage.includes('Failed') ? 'alert-danger' : 'alert-success']">
      {{ feedbackMessage }}
    </div>

    <div class="recipe-detail" v-if="localRecipe">
      <div class="recipe-header text-center mb-5">
        <h1 class="recipe-title display-4 fw-bold">{{ localRecipe.Name }}</h1>
        <p class="recipe-meta text-muted">
          By {{ localRecipe.AuthorName }} | Published: {{ localRecipe.DatePublished }}
        </p>
      </div>

      <div class="recipe-content row g-4">
        <div class="recipe-image col-lg-5 col-md-12 text-center">
          <img :src="getImageUrl(localRecipe)" class="main-image img-fluid rounded shadow-sm"
            @error="handleImageError(localRecipe.RecipeId)" />
          <button v-if="!showBookmarkSection" @click="toggleBookmarkSection" class="btn btn-primary w-100 mt-3">
            Bookmark
          </button>
          <div class="bookmark-section card shadow-sm mt-3 p-3 text-start" v-if="showBookmarkSection">
            <h2 class="h5 fw-bold">Bookmark</h2>
            <h6 class="mt-3 fw-semibold">Select Bookmark Folders:</h6>
            <select v-model="selectedFolderId" class="form-select mb-2">
              <option v-for="folder in folders" :value="folder.FolderId" :key="folder.FolderId">
                {{ folder.Name }}
              </option>
            </select>
            <h6 class="mt-3 fw-semibold">Score:</h6>
            <div class="star-rating mb-2">

            </div>
            <div class="d-flex gap-2 mt-3">
              <button @click="bookmarkRecipe" class="btn btn-success flex-fill">Bookmark</button>
              <button @click="toggleBookmarkSection" class="btn btn-danger flex-fill">Cancel</button>
            </div>
          </div>
        </div>

        <div class="recipe-info col-lg-7 col-md-12">
          <div class="info-card card shadow-sm p-4 mb-3">
            <h2 class="h4 pb-3 fw-bold text-decoration-underline">Description</h2>
            <p>{{ localRecipe.Description || 'No description available.' }}</p>
          </div>

          <div class="d-flex gap-3 mb-3">
            <div class="info-card card shadow-sm p-4 flex-fill"
              v-if="localRecipe.PrepTime || localRecipe.CookTime || localRecipe.TotalTime">
              <h2 class="h4 pb-3 fw-bold text-decoration-underline">Time</h2>
              <p v-if="localRecipe.PrepTime"><b>Prep:</b> {{ formatTime(localRecipe.PrepTime) }}</p>
              <p v-if="localRecipe.CookTime"><b>Cook:</b> {{ formatTime(localRecipe.CookTime) }}</p>
              <p v-if="localRecipe.TotalTime"><b>Total:</b> {{ formatTime(localRecipe.TotalTime) }}</p>
            </div>

            <div class="info-card card shadow-sm p-4 flex-fill" v-if="localRecipe.RecipeIngredientParts">
              <h2 class="h4 pb-3 fw-bold text-decoration-underline">Ingredients</h2>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Ingredient</th>
                    <th scope="col" class="text-center">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(ingredient, index) in localRecipe.RecipeIngredientParts" :key="index">
                    <td>{{ ingredient }}</td>
                    <td class="text-center">
                      <span
                        v-if="localRecipe.RecipeIngredientQuantities?.[index] && localRecipe.RecipeIngredientQuantities[index] !== 'NA'"
                        class="text-muted">
                        {{ localRecipe.RecipeIngredientQuantities[index] }}
                      </span>
                      <span v-else>—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="info-card card shadow-sm p-4 mb-3" v-if="localRecipe.RecipeInstructions">
            <h2 class="h4 pb-3 fw-bold text-decoration-underline">Instructions</h2>
            <ol class="list-group list-group-numbered">
              <li v-for="(step, index) in localRecipe.RecipeInstructions" :key="index" class="list-group-item">
                {{ step }}
              </li>
            </ol>
          </div>

          <div class="info-card card shadow-sm p-4"
            v-if="localRecipe.Calories || localRecipe.ProteinContent || localRecipe.FatContent || localRecipe.CarbohydrateContent || localRecipe.SugarContent || localRecipe.FiberContent">
            <h2 class="h4 pb-3 fw-bold text-decoration-underline">Nutrition (per serving)</h2>
            <table class="table table-striped">
              <tbody>
                <tr v-if="localRecipe.Calories">
                  <td><b>Calories</b></td>
                  <td>{{ localRecipe.Calories }} kcal</td>
                </tr>
                <tr v-if="localRecipe.ProteinContent">
                  <td><b>Protein</b></td>
                  <td>{{ localRecipe.ProteinContent }} g</td>
                </tr>
                <tr v-if="localRecipe.FatContent">
                  <td><b>Fat</b></td>
                  <td>{{ localRecipe.FatContent }} g</td>
                </tr>
                <tr v-if="localRecipe.CarbohydrateContent">
                  <td><b>Carbs</b></td>
                  <td>{{ localRecipe.CarbohydrateContent }} g</td>
                </tr>
                <tr v-if="localRecipe.SugarContent">
                  <td><b>Sugar</b></td>
                  <td>{{ localRecipe.SugarContent }} g</td>
                </tr>
                <tr v-if="localRecipe.FiberContent">
                  <td><b>Fiber</b></td>
                  <td>{{ localRecipe.FiberContent }} g</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center p-4 text-muted" v-else>
      <p>Loading recipe details...</p>
    </div>
  </div>
</template>

<style scoped>
.modal-container {
  font-family: 'Arial', sans-serif;
}

.main-image {
  height: 400px;
  object-fit: cover;
}

.recipe-title {
  text-transform: capitalize;
}

.info-card {
  transition: box-shadow 0.3s;
}

.info-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.btn-primary,
.btn-success,
.btn-danger {
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-danger:hover {
  background-color: #c82333;
}

.star-rating .iconify:hover {
  color: #ffc107 !important;
  /* Hover effect for stars */
}

/* Ensure table headers are styled consistently */
.table th {
  font-weight: bold;
}
</style>
