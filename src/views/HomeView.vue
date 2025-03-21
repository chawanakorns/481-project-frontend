<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import NavigationBar from '@/components/NavigationBar.vue'

const recipes = ref<any[]>([])
const filteredRecipes = ref<any[]>([])
const searchTerm = ref('')
const imageLoadError = ref<{ [key: string]: boolean }>({})

const fetchRecipes = async () => {
  try {
    const response = await axios.get('http://localhost:5000/recipes')
    recipes.value = response.data
    filteredRecipes.value = recipes.value
    console.log('Recipes fetched:', recipes.value) // Debug log
  } catch (error) {
    console.error('Error fetching recipes:', error)
  }
}

const filterRecipes = () => {
  if (searchTerm.value.trim() === '') {
    filteredRecipes.value = recipes.value
  } else {
    filteredRecipes.value = recipes.value.filter((recipe) => {
      const lowercasedSearchTerm = searchTerm.value.toLowerCase()
      return (
        recipe.Name.toLowerCase().includes(lowercasedSearchTerm) ||
        recipe.Description.toLowerCase().includes(lowercasedSearchTerm) ||
        (recipe.Keywords && recipe.Keywords.toLowerCase().includes(lowercasedSearchTerm))
      )
    })
  }
}

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
      <router-link
        :to="{ name: 'detail', params: { id: recipe.RecipeId, recipe: recipe } }"
        v-for="recipe in recipes"
        :key="recipe.RecipeId"
        class="recommendation-card"
      >
        <img
          :src="recipe.image_url"
          class="card-image"
          @error="handleImageError(recipe.RecipeId)"
        />
        <div class="card-container">
          <h4>
            <b>{{ recipe.Name }}</b>
          </h4>
          <p class="preview">
            {{
              recipe.Description ? recipe.Description.substring(0, 50) + '...' : 'No description'
            }}
          </p>
        </div>
      </router-link>
    </div>

    <div class="title">
      <h1>Featured</h1>
    </div>
    <div class="search-body">
      <br />
      <input
        class="search-bar"
        type="text"
        placeholder="Search by name, description, or keywords"
        v-model="searchTerm"
        @input="filterRecipes"
      />
    </div>
    <div class="item">
      <router-link
        :to="{ name: 'detail', params: { id: recipe.RecipeId, recipe: recipe } }"
        v-for="recipe in filteredRecipes"
        :key="recipe.RecipeId"
        class="item-card"
      >
        <img
          :src="recipe.image_url"
          class="card-image"
          @error="handleImageError(recipe.RecipeId)"
        />
        <div class="card-container">
          <h4>
            <b>{{ recipe.Name }}</b>
          </h4>
          <p class="preview">
            {{
              recipe.Description ? recipe.Description.substring(0, 50) + '...' : 'No description'
            }}
          </p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style>
.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

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

.title {
  text-align: left;
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
  text-decoration: none;
  color: inherit;
  background: #fff;
  border-radius: 8px;
}

.item {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
  justify-items: center;
}

.card-container {
  padding: 10px 16px;
}

.item-card {
  width: 300px;
  text-align: center;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  text-decoration: none;
  color: inherit;
  background: #fff;
  border-radius: 8px;
}

.preview {
  font-size: 14px;
  color: #666;
  margin: 5px 0 0;
}

.card:hover {
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
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
