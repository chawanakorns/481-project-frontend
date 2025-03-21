<script setup lang="ts">
import { defineProps, ref, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps<{
  id: string
  recipe?: any
}>()

const localRecipe = ref<any>(props.recipe)
const imageLoadError = ref<{ [key: string]: boolean }>({})
const folders = ref<any[]>([])
const selectedFolderId = ref<number | null>(null)
const rating = ref<number>(1)
const userId = ref(1) // Replace with actual auth logic
const feedbackMessage = ref<string>('')

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
  if (!selectedFolderId.value || !rating.value) {
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
  } catch (error) {
    feedbackMessage.value = 'Failed to bookmark recipe.'
  }
}

const handleImageError = (recipeId: number) => {
  imageLoadError.value[recipeId] = true
  if (localRecipe.value?.all_image_urls?.length > 1) {
    const currentIndex = localRecipe.value.all_image_urls.indexOf(localRecipe.value.image_url)
    if (currentIndex < localRecipe.value.all_image_urls.length - 1) {
      localRecipe.value.image_url = localRecipe.value.all_image_urls[currentIndex + 1]
    }
  }
}

onMounted(() => {
  fetchRecipe()
  fetchFolders()
})
</script>

<template>
  <div class="modal-container">
    <p v-if="feedbackMessage" :class="feedbackMessage.includes('Failed') ? 'error-message' : 'success-message'">
      {{ feedbackMessage }}
    </p>

    <div class="recipe-detail" v-if="localRecipe">
      <div class="recipe-header">
        <h1 class="recipe-title">{{ localRecipe.Name }}</h1>
        <p class="recipe-meta">
          By {{ localRecipe.AuthorName }} | Published: {{ localRecipe.DatePublished }}
        </p>
      </div>

      <div class="recipe-content">
        <div class="recipe-image">
          <img :src="localRecipe.image_url" class="main-image" @error="handleImageError(localRecipe.RecipeId)" />
        </div>

        <div class="recipe-info">
          <div class="info-card">
            <h2>Description</h2>
            <p>{{ localRecipe.Description || 'No description available.' }}</p>
          </div>

          <div class="info-card" v-if="localRecipe.PrepTime || localRecipe.CookTime || localRecipe.TotalTime">
            <h2>Time</h2>
            <p v-if="localRecipe.PrepTime">Prep: {{ localRecipe.PrepTime }}</p>
            <p v-if="localRecipe.CookTime">Cook: {{ localRecipe.CookTime }}</p>
            <p v-if="localRecipe.TotalTime">Total: {{ localRecipe.TotalTime }}</p>
          </div>

          <div class="info-card" v-if="localRecipe.RecipeIngredientParts">
            <h2>Ingredients</h2>
            <ul>
              <li v-for="(ingredient, index) in localRecipe.RecipeIngredientParts.split(',')" :key="index">
                {{
                  localRecipe.RecipeIngredientQuantities
                    ? localRecipe.RecipeIngredientQuantities.split(',')[index] + ' '
                    : ''
                }}{{ ingredient }}
              </li>
            </ul>
          </div>

          <div class="info-card" v-if="localRecipe.RecipeInstructions">
            <h2>Instructions</h2>
            <p>{{ localRecipe.RecipeInstructions }}</p>
          </div>

          <div class="info-card" v-if="localRecipe.Calories || localRecipe.ProteinContent || localRecipe.FatContent">
            <h2>Nutrition (per serving)</h2>
            <p v-if="localRecipe.Calories">Calories: {{ localRecipe.Calories }} kcal</p>
            <p v-if="localRecipe.ProteinContent">Protein: {{ localRecipe.ProteinContent }} g</p>
            <p v-if="localRecipe.FatContent">Fat: {{ localRecipe.FatContent }} g</p>
            <p v-if="localRecipe.CarbohydrateContent">
              Carbs: {{ localRecipe.CarbohydrateContent }} g
            </p>
            <p v-if="localRecipe.SugarContent">Sugar: {{ localRecipe.SugarContent }} g</p>
            <p v-if="localRecipe.FiberContent">Fiber: {{ localRecipe.FiberContent }} g</p>
          </div>

          <div class="info-card bookmark-section">
            <h2>Bookmark</h2>
            <select v-model="selectedFolderId" class="folder-select">
              <option v-for="folder in folders" :value="folder.FolderId" :key="folder.FolderId">
                {{ folder.Name }}
              </option>
            </select>
            <input v-model="rating" type="number" min="1" max="5" placeholder="Rate 1-5" class="rating-input" />
            <button @click="bookmarkRecipe" class="bookmark-button">Bookmark</button>
          </div>
        </div>
      </div>
    </div>

    <div class="loading" v-else>
      <p>Loading recipe details...</p>
    </div>
  </div>
</template>

<style scoped>
.modal-container {
  font-family: 'Arial', sans-serif;
}

.success-message {
  color: #28a745;
  text-align: center;
  margin-bottom: 20px;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-bottom: 20px;
}

.recipe-header {
  text-align: center;
  margin-bottom: 40px;
}

.recipe-title {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin: 0;
  text-transform: capitalize;
}

.recipe-meta {
  font-size: 16px;
  color: #666;
  margin-top: 10px;
}

.recipe-content {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.recipe-image {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
}

.main-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recipe-info {
  flex: 2;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.info-card h2 {
  font-size: 24px;
  font-weight: 600;
  color: #444;
  margin-top: 0;
  margin-bottom: 10px;
}

.info-card p {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 5px 0;
}

.info-card ul {
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
}

.info-card li {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

.bookmark-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.folder-select {
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.rating-input {
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100px;
}

.bookmark-button {
  padding: 10px;
  font-size: 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.bookmark-button:hover {
  background-color: #218838;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #888;
}

@media (max-width: 768px) {
  .recipe-content {
    flex-direction: column;
    align-items: center;
  }

  .recipe-image {
    max-width: 100%;
  }

  .recipe-title {
    font-size: 28px;
  }

  .info-card h2 {
    font-size: 20px;
  }

  .info-card p,
  .info-card li {
    font-size: 14px;
  }
}
</style>
