<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import NavigationBar from '@/components/NavigationBar.vue'
import DetailView from '@/views/DetailView.vue'

const userId = ref(1) // Replace with actual auth logic later
const recipes = ref<any[]>([])
const filteredRecipes = ref<any[]>([])
const searchTerm = ref('')
const correctedQuery = ref<string | null>(null)
const originalQuery = ref<string | null>(null)
const imageLoadError = ref<{ [key: string]: boolean }>({})
const selectedRecipe = ref<any | null>(null)
const showModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = 20
const totalPages = ref(1)
const totalResults = ref(0)
const recommendedRecipes = ref<any[]>([])
const recommendationMessage = ref<string>('')

const fetchRecipes = async () => {
  try {
    const response = await axios.get('http://localhost:5000/recipes', {
      params: {
        limit: itemsPerPage,
        page: currentPage.value
      }
    })
    filteredRecipes.value = response.data.recipes
    totalPages.value = response.data.total_pages
    totalResults.value = response.data.total_results
  } catch (error) {
    console.error('Error fetching recipes:', error)
  }
}

const filterRecipes = async () => {
  try {
    const response = await axios.get('http://localhost:5000/recipes', {
      params: {
        search: searchTerm.value.trim(),
        limit: itemsPerPage,
        page: currentPage.value
      }
    })
    filteredRecipes.value = response.data.recipes
    originalQuery.value = response.data.original_query
    correctedQuery.value = response.data.corrected_query
    totalPages.value = response.data.total_pages
    totalResults.value = response.data.total_results
    currentPage.value = response.data.current_page
  } catch (error) {
    console.error('Error filtering recipes:', error)
  }
}

const useSuggestion = async (suggestion: string) => {
  searchTerm.value = suggestion
  currentPage.value = 1
  await filterRecipes()
}

const handleImageError = (recipeId: number) => {
  imageLoadError.value[recipeId] = true
  const recipe = filteredRecipes.value.find((r) => r.RecipeId === recipeId) ||
    recommendedRecipes.value.find((r) => r.RecipeId === recipeId)
  if (recipe && recipe.all_image_urls && recipe.all_image_urls.length > 1) {
    const currentIndex = recipe.all_image_urls.indexOf(recipe.image_url)
    if (currentIndex < recipe.all_image_urls.length - 1) {
      recipe.image_url = recipe.all_image_urls[currentIndex + 1]
    }
  }
}

const openModal = (recipe: any) => {
  selectedRecipe.value = recipe
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedRecipe.value = null
}

const fetchRecommendedRecipes = async () => {
  try {
    const response = await axios.get('http://localhost:5000/recommendations', {
      params: {
        user_id: userId.value,
        limit: 10
      }
    })
    recommendedRecipes.value = response.data.recommendations
    recommendationMessage.value = response.data.message || ''
  } catch (error) {
    console.error('Error fetching recommended recipes:', error)
    recommendedRecipes.value = []
    recommendationMessage.value = 'Failed to load recommendations.'
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    if (searchTerm.value.trim()) {
      filterRecipes()
    } else {
      fetchRecipes()
    }
  }
}

onMounted(async () => {
  await fetchRecipes()
  await fetchRecommendedRecipes()
})
</script>

<template>
  <NavigationBar />

  <div class="container">
    <div class="title">
      <h1>You may like these</h1>
    </div>

    <div class="recommendation">
      <div v-for="recipe in recommendedRecipes" :key="recipe.RecipeId" class="recommendation-card"
        @click="openModal(recipe)">
        <img :src="recipe.image_url" class="card-image" @error="handleImageError(recipe.RecipeId)" />
        <div class="card-container">
          <h4>
            <b>{{ recipe.Name ? recipe.Name.substring(0, 34) + '' : 'Name not loaded' }}</b>
          </h4>
          <p class="preview">
            {{ recipe.Description ? recipe.Description.substring(0, 38) + '...' : 'No description' }}
          </p>
        </div>
      </div>
      <div v-if="recommendedRecipes.length === 0" class="no-recommendations">
        <p>{{ recommendationMessage || 'No new recommendations available. Explore more recipes!' }}</p>
      </div>
    </div>

    <div class="title">
      <h1>Explore</h1>
    </div>
    <div class="search-body">
      <br />
      <div class="search-container">
        <input class="search-bar" type="text" placeholder="Search..." v-model="searchTerm"
          @keyup.enter="filterRecipes" />
        <button class="search-button" @click="filterRecipes">Search</button>
      </div>
    </div>

    <div v-if="correctedQuery && correctedQuery !== originalQuery" class="spell-suggestion">
      Did you mean:<a href="#" @click.prevent="useSuggestion(correctedQuery)"><strong>{{ correctedQuery
      }}</strong></a>?
    </div>

    <div class="item">
      <div v-for="recipe in filteredRecipes" :key="recipe.RecipeId" class="item-card" @click="openModal(recipe)">
        <img :src="recipe.image_url" class="card-image" @error="handleImageError(recipe.RecipeId)" />
        <div class="card-container">
          <h4>
            <b>{{ recipe.Name ? recipe.Name.substring(0, 34) + '' : 'Name not loaded' }}</b>
          </h4>
          <p class="preview">
            {{ recipe.Description ? recipe.Description.substring(0, 38) + '...' : 'No description' }}
          </p>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)" class="pagination-button">
        Previous
      </button>
      <span class="pagination-info">
        Page {{ currentPage }} of {{ totalPages }} ({{ totalResults }} results)
      </span>
      <button :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)" class="pagination-button">
        Next
      </button>
    </div>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-button" @click="closeModal">X</button>
      <DetailView :id="selectedRecipe.RecipeId.toString()" :recipe="selectedRecipe" />
    </div>
  </div>
</template>

<style>
.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px 8px 8px 8px;
}

.search-body {
  width: 100%;
  display: flex;
  justify-content: center;
  text-align: center;
}

.search-bar {
  width: 300px;
  margin: 20px;
  padding: 10px;
  font-size: 17px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-button {
  padding: 10px 20px;
  font-size: 17px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.spell-suggestion {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.spell-suggestion a {
  font-size: 14px;
  color: #007bff;
  text-decoration: none;
}

.spell_suggestion a:hover {
  text-decoration: underline;
}

.title {
  text-align: center;
  width: 100%;
  padding-left: 20px;
  margin-top: 20px;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px;
  padding-left: 60px;
  padding-right: 60px;
  padding-bottom: 60px;
}

.recommendation {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  justify-content: flex-start;
  padding: 10px;
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  gap: 20px;
}

.recommendation::-webkit-scrollbar {
  height: 8px;
}

.recommendation::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.recommendation::-webkit-scrollbar-track {
  background: transparent;
}

.recommendation-card {
  width: 300px;
  height: 280px;
  text-align: center;
  margin: 20px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  flex-shrink: 0;
  text-decoration: none;
  color: inherit;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
}

.item {
  display: grid;
  padding-left: 10px;
  padding-right: 10px;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
  justify-items: center;
}

.card-container {
  text-align: left;
  padding: 10px 16px;
}

.item-card {
  width: 300px;
  height: 280px;
  margin: 20px;
  text-align: center;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  text-decoration: none;
  color: inherit;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
}

.preview {
  font-size: 14px;
  color: #666;
  margin: 5px 0 0;
}

.card:hover {
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 60px;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.close-button {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  z-index: 10;
}

.close-button:hover {
  background: #c82333;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 10px;
}

.pagination-button {
  padding: 8px 16px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pagination-button:hover {
  background-color: #0056b3;
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 16px;
  color: #666;
}

.recommendation-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.folder-select {
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.no-recommendations {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 16px;
}

@media (max-width: 1000px) {
  .item {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .item {
    grid-template-columns: 1fr;
  }
}
</style>
