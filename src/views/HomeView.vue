<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const recipes = ref<any[]>([]);
const filteredRecipes = ref<any[]>([]);
const searchTerm = ref('');
const imageLoadError = ref<{ [key: string]: boolean }>({});

// Fetch all recipes from the backend API
const fetchRecipes = async () => {
  try {
    const response = await axios.get('http://localhost:5000/recipes');
    recipes.value = response.data;
    filteredRecipes.value = recipes.value;
  } catch (error) {
    console.error('Error fetching recipes:', error);
  }
};

// Watch the search term and filter recipes based on it
const filterRecipes = () => {
  filteredRecipes.value = recipes.value.filter(recipe => {
    const lowercasedSearchTerm = searchTerm.value.toLowerCase();
    return (
      recipe.Name.toLowerCase().includes(lowercasedSearchTerm) ||
      recipe.Description.toLowerCase().includes(lowercasedSearchTerm)
    );
  });
};

// Handle image load error
const handleImageError = (recipeId: number) => {
  imageLoadError.value[recipeId] = true;

  // Try to use the next image in the array if available
  const recipe = recipes.value.find(r => r.RecipeId === recipeId);
  if (recipe && recipe.all_image_urls && recipe.all_image_urls.length > 1) {
    const currentIndex = recipe.all_image_urls.indexOf(recipe.image_url);
    if (currentIndex < recipe.all_image_urls.length - 1) {
      recipe.image_url = recipe.all_image_urls[currentIndex + 1];
    }
  }
};

// Call fetchRecipes when the component is mounted
onMounted(fetchRecipes);
</script>

<template>
  <div class="navbar">
    <ul class="topnav">
      <div style="display: flex; flex-direction: row">
        <li><a class="active" href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </div>
      <div>
        <button><a href="/logout">Log out</a></button>
      </div>
    </ul>
  </div>

  <div class="container">
    <div class="search-body" style="text-align: center">
      <h1>Foods And Drinks</h1>
      <br />
      <input type="text" placeholder="Search.." v-model="searchTerm" @input="filterRecipes"
        style="width: 600px; height: 40px; padding: 10px; font-size: 20px" />
    </div>

    <div class="result">
      <!-- Loop through filteredRecipes to display them in cards -->
      <div v-for="recipe in filteredRecipes" :key="recipe.RecipeId" class="card">
        <img :src="recipe.image_url" class="card-image" @error="handleImageError(recipe.RecipeId)" />
        <div class="card-container">
          <h4><b>{{ recipe.Name }}</b></h4>
          <p>{{ recipe.Description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

/** Navigation Bar **/
.navbar {
  position: fixed;
  top: 0;
  overflow: hidden;
  width: 100%;
  z-index: 100;
}

.topnav {
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  background-color: #e9e9e9;
}

.topnav a {
  float: left;
  display: block;
  color: black;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  font-size: 17px;
}

.topnav a:hover {
  background-color: #ddd;
  color: black;
}

.topnav a.active {
  background-color: #2196f3;
  color: white;
}

.topnav input[type='text'] {
  float: right;
  padding: 6px;
  border: none;
  margin-top: 10px;
  margin-right: 16px;
  font-size: 17px;
}

@media screen and (max-width: 600px) {

  .topnav a,
  .topnav input[type='text'] {
    float: none;
    display: block;
    text-align: left;
    width: 100%;
    margin: 0;
    padding: 14px;
  }

  .topnav input[type='text'] {
    border: 1px solid #ccc;
  }
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

/** Body **/
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px;
}

.search-body {
  margin: 20px;
}

/** Result **/
.result {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.card-container {
  padding: 2px 16px;
}

.card {
  width: 300px;
  text-align: center;
  margin: 20px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
}

.card:hover {
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
}
</style>
