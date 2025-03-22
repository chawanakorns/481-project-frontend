<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import NavigationBar from '@/components/NavigationBar.vue'
import DetailView from '@/views/DetailView.vue'
import placeholderImage from '@/assets/placeholder.jpg'

const PLACEHOLDER_IMAGE = placeholderImage

const userId = ref(1)
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

const itemsPerSlide = 4

const groupedRecommendations = computed(() => {
  const groups = []
  for (let i = 0; i < recommendedRecipes.value.length; i += itemsPerSlide) {
    groups.push(recommendedRecipes.value.slice(i, i + itemsPerSlide))
  }
  return groups
})

const fetchRecipes = async () => {
  try {
    const response = await axios.get('http://localhost:5000/recipes', {
      params: {
        limit: itemsPerPage,
        page: currentPage.value,
      },
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
        page: currentPage.value,
      },
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
  const recipe = filteredRecipes.value.find((r) => r.RecipeId === recipeId) || recommendedRecipes.value.find((r) => r.RecipeId === recipeId)
  if (recipe) recipe.image_url = PLACEHOLDER_IMAGE
}

const getImageUrl = (recipe: any) => {
  return recipe.image_url && recipe.image_url !== 'character(0)' ? recipe.image_url : PLACEHOLDER_IMAGE
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
        limit: 12
      }
    })
    recommendedRecipes.value = response.data.recommendations
    recommendationMessage.value = response.data.message || ''
    if (recommendedRecipes.value.length === 0) {
      recommendationMessage.value = recommendationMessage.value || 'No new recommendations available. Explore more recipes!'
    }
  } catch (error) {
    console.error('Error fetching recommended recipes:', error)
    recommendedRecipes.value = []
    recommendationMessage.value = 'Failed to load recommendations.'
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    if (searchTerm.value.trim()) filterRecipes()
    else fetchRecipes()
  }
}

onMounted(async () => {
  await fetchRecipes()
  await fetchRecommendedRecipes()
})
</script>

<template>
  <NavigationBar />
  <div class="container mt-5 mb-5 pt-5 pb-5">
    <div class="text-start mb-4">
      <h1 class="display-5 fw-bold">You may like these</h1>
    </div>

    <div class="recommendation-container mb-5 px-2 py-3">
      <div id="recommendationCarousel" class="carousel slide">
        <div class="carousel-indicators" v-if="groupedRecommendations.length > 1">
          <button v-for="(group, index) in groupedRecommendations" :key="index" type="button"
            :data-bs-target="'#recommendationCarousel'" :data-bs-slide-to="index" :class="{ 'active': index === 0 }"
            aria-current="true" :aria-label="'Slide ' + (index + 1)">
          </button>
        </div>

        <div class="carousel-inner">
          <div v-if="recommendedRecipes.length === 0" class="carousel-item active">
            <div class="text-center p-4 text-muted w-100">
              <p>{{ recommendationMessage }}</p>
            </div>
          </div>
          <div v-else v-for="(group, index) in groupedRecommendations" :key="index"
            :class="['carousel-item', { 'active': index === 0 }]">
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
              <div v-for="recipe in group" :key="recipe.RecipeId" class="col">
                <div class="recommendation-card card shadow-sm h-100" @click="openModal(recipe)">
                  <img :src="getImageUrl(recipe)" class="card-img-top" @error="handleImageError(recipe.RecipeId)" />
                  <div class="card-body text-start">
                    <h5 class="card-title fw-bold">
                      {{ recipe.Name ? (recipe.Name.length > 20 ? recipe.Name.substring(0, 25) + '...' : recipe.Name) :
                        'Name not loaded' }}
                    </h5>
                    <p class="card-text text-muted">
                      {{ recipe.Description ? (recipe.Description.length > 20 ? recipe.Description.substring(0, 28) +
                        '...' : recipe.Description) : 'No description' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button v-if="groupedRecommendations.length > 1" class="carousel-control-prev" type="button"
          data-bs-target="#recommendationCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button v-if="groupedRecommendations.length > 1" class="carousel-control-next" type="button"
          data-bs-target="#recommendationCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>

    <div class="text-start my-4">
      <h1 class="display-5 fw-bold">Explore</h1>
    </div>

    <div class="search-body d-flex justify-content-center mb-4">
      <div class="input-group w-50">
        <input class="form-control" type="text" placeholder="Search..." v-model="searchTerm"
          @keyup.enter="filterRecipes" />
        <button class="btn btn-primary" @click="filterRecipes">Search</button>
      </div>
    </div>

    <div v-if="correctedQuery && correctedQuery !== originalQuery" class="text-center mb-4">
      Did you mean: <a href="#" @click.prevent="useSuggestion(correctedQuery)" class="fw-bold">{{ correctedQuery }}</a>?
    </div>

    <div class="item row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 px-2 py-3">
      <div v-for="recipe in filteredRecipes" :key="recipe.RecipeId" class="col">
        <div class="item-card card shadow-sm h-100" @click="openModal(recipe)">
          <img :src="getImageUrl(recipe)" class="card-img-top" @error="handleImageError(recipe.RecipeId)" />
          <div class="card-body">
            <h5 class="card-title fw-bold">
              {{ recipe.Name ? (recipe.Name.length > 20 ? recipe.Name.substring(0, 25) + '...' : recipe.Name) : '' }}
            </h5>
            <p class="card-text text-muted">
              {{ recipe.Description ? (recipe.Description.length > 20 ? recipe.Description.substring(0, 28) + '...' :
                recipe.Description) : 'No description' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination d-flex justify-content-center align-items-center gap-3 mt-4" v-if="totalPages > 1">
      <button class="btn btn-primary" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Previous</button>
      <span class="text-muted">Page {{ currentPage }} of {{ totalPages }} ({{ totalResults }} results)</span>
      <button class="btn btn-primary" :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)">Next</button>
    </div>
  </div>

  <Teleport to="body" v-if="showModal">
    <div class="modal fade show" id="recipeModal" tabindex="-1" aria-labelledby="recipeModalLabel" aria-hidden="false"
      style="display: block; z-index: 1050;">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" style="z-index: 1051;">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-5">
            <DetailView :id="selectedRecipe.RecipeId.toString()" :recipe="selectedRecipe" />
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" style="z-index: 1049;" @click="closeModal"></div>
  </Teleport>
</template>

<style scoped>
.card-img-top {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.recommendation-container,
.item {
  width: 100%;
  max-width: 1248px;
  margin-left: auto;
  margin-right: auto;
}

.carousel-inner {
  text-align: center;
}

.recommendation-card,
.item-card {
  width: 100%;
  height: 280px;
  transition: box-shadow 0.3s;
  cursor: pointer;
}

.recommendation-card:hover,
.item-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
}

.card-title {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.card-text {
  font-size: 0.875rem;
  margin-bottom: 0;
}

.btn-primary {
  transition: background-color 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #ccc;
}

.modal {
  pointer-events: none;
}

.modal-dialog {
  pointer-events: auto;
}

.modal-backdrop {
  pointer-events: auto;
  opacity: 0.5;
}

.carousel-control-prev,
.carousel-control-next {
  width: 40px;
  height: 40px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #007bff;
  border-radius: 50%;
  opacity: 0.8;
  transition: opacity 0.3s, background-color 0.3s;
}

.carousel-control-prev:hover,
.carousel-control-next:hover {
  opacity: 1;
  background-color: #0056b3;
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  width: 20px;
  height: 20px;
  background-size: 100%, 100%;
  filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
}

.carousel-control-prev {
  left: -50px;
}

.carousel-control-next {
  right: -50px;
}

.carousel-indicators {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0;
  margin: 0;
}

.carousel-indicators button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #bbb;
  border: none;
  margin: 0 5px;
  transition: background-color 0.3s;
}

.carousel-indicators .active {
  background-color: #007bff;
}

.carousel-indicators button:hover {
  background-color: #0056b3;
}
</style>
