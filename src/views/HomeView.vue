<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import NavigationBar from '@/components/NavigationBar.vue'

const recipes = ref<any[]>([]) // Original recipes for recommendations
const filteredRecipes = ref<any[]>([]) // Filtered recipes for search results
const searchTerm = ref('')
const imageLoadError = ref<{ [key: string]: boolean }>({})

// Fetch all recipes from the backend API
const fetchRecipes = async () => {
  try {
    const response = await axios.get('http://localhost:5000/recipes')
    recipes.value = response.data
    filteredRecipes.value = recipes.value
  } catch (error) {
    console.error('Error fetching recipes:', error)
  }
}

// Watch the search term and filter recipes based on it (only for filteredRecipes)
const filterRecipes = () => {
  if (searchTerm.value.trim() === '') {
    filteredRecipes.value = recipes.value // Reset to all recipes when search is empty
  } else {
    filteredRecipes.value = recipes.value.filter((recipe) => {
      const lowercasedSearchTerm = searchTerm.value.toLowerCase()
      return (
        recipe.Name.toLowerCase().includes(lowercasedSearchTerm) ||
        recipe.Description.toLowerCase().includes(lowercasedSearchTerm)
      )
    })
  }
}

// Handle image load error
const handleImageError = (recipeId: number) => {
  imageLoadError.value[recipeId] = true
  const recipe = recipes.value.find((r) => r.RecipeId === recipeId)
  if (recipe && recipe.all_image_urls && recipe.all_image_urls.length > 1) {
    const currentIndex = recipe.all_image_urls.indexOf(recipe.image_url)
    if (currentIndex < recipe.all_image_urls.length - 1) {
      recipe.image_url = recipe.all_image_urls[currentIndex + 1]
    }
  }
}

onMounted(fetchRecipes)
</script>

<template>
  <NavigationBar />

  <div class="container">
    <div class="title">
      <h1>You may like these</h1>
    </div>

    <div class="recommendation">
      <div v-for="recipe in recipes" :key="recipe.RecipeId" class="recommendation-card">
        <img :src="recipe.image_url" class="card-image" @error="handleImageError(recipe.RecipeId)" />
        <div class="card-container">
          <h4>
            <b>{{ recipe.Name }}</b>
          </h4>
        </div>
      </div>
    </div>

    <div class="title">
      <h1>Featured</h1>
    </div>
    <div class="search-body">
      <br />
      <input class="search-bar" type="text" placeholder="Search.." v-model="searchTerm" @input="filterRecipes" />
    </div>
    <div class="item">
      <div v-for="recipe in filteredRecipes" :key="recipe.RecipeId" class="item-card">
        <img :src="recipe.image_url" class="card-image" @error="handleImageError(recipe.RecipeId)" />
        <div class="card-container">
          <h4>
            <b>{{ recipe.Name }}</b>
          </h4>
          <p>{{ recipe.Description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/** Images **/
.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

/** Search **/
.search-body {
  width: 100%;
  display: flex;
  justify-content: right;
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

/** Title **/
.title {
  text-align: left;
  width: 100%;
  padding-left: 20px;
  margin-top: 20px;
}

/** Body **/
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px;
  padding-left: 60px;
  padding-right: 60px;
}

/** Recommendations (Horizontal Scroll) **/
.recommendation {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  justify-content: flex-start;
  padding: 10px;
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
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
  height: 300px;
  text-align: center;
  margin: 20px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  flex-shrink: 0;
}

/** Items (Grid Layout) **/
.item {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.card-container {
  padding: 2px 16px;
}

.item-card {
  width: 300px;
  text-align: center;
  margin: 20px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  flex-shrink: 0;
}

.card:hover {
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
}
</style>
