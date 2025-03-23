<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/stores/api';
import { useAuthStore } from '@/stores/auth';
import NavigationBar from '@/components/NavigationBar.vue';
import DetailView from '@/views/DetailView.vue';
import placeholderImage from '@/assets/placeholder.jpg';

const PLACEHOLDER_IMAGE = placeholderImage;

const router = useRouter();
const authStore = useAuthStore();

const userId = ref(localStorage.getItem('user_id') || '1');
const filteredRecipes = ref<any[]>([]);
const searchTerm = ref('');
const correctedQuery = ref<string | null>(null);
const originalQuery = ref<string | null>(null);
const imageLoadError = ref<{ [key: string]: boolean }>({});
const selectedRecipe = ref<any | null>(null);
const showModal = ref(false);
const currentPage = ref(1);
const itemsPerPage = 20;
const totalPages = ref(1);
const totalResults = ref(0);
const recommendedRecipes = ref<any[]>([]);
const recommendationMessage = ref<string>('');
const error = ref<string | null>(null);

const itemsPerSlide = 4;

const groupedRecommendations = computed(() => {
  const groups = [];
  for (let i = 0; i < recommendedRecipes.value.length; i += itemsPerSlide) {
    groups.push(recommendedRecipes.value.slice(i, i + itemsPerSlide));
  }
  return groups;
});

const fetchRecipes = async () => {
  try {
    const response = await api.getRecipes({
      params: {
        limit: itemsPerPage,
        page: currentPage.value,
      },
    });
    filteredRecipes.value = response.recipes;
    totalPages.value = response.total_pages;
    totalResults.value = response.total_results;
    error.value = null;
  } catch (err) {
    console.error('Error fetching recipes:', err);
    error.value = 'Failed to load recipes. Please try again later.';
    if (err instanceof Error && (err as any).response && (err as any).response.status === 401) {
      authStore.logout();
      router.push('/login');
    }
  }
};

const filterRecipes = async () => {
  try {
    const response = await api.getRecipes({
      params: {
        search: searchTerm.value.trim(),
        limit: itemsPerPage,
        page: currentPage.value,
      },
    });
    filteredRecipes.value = response.recipes;
    originalQuery.value = response.original_query;
    correctedQuery.value = response.corrected_query;
    totalPages.value = response.total_pages;
    totalResults.value = response.total_results;
    currentPage.value = response.current_page;
    error.value = null;
  } catch (err) {
    console.error('Error filtering recipes:', err);
    error.value = 'Failed to filter recipes. Please try again.';
    if ((err as any).response && (err as any).response.status === 401) {
      authStore.logout();
      router.push('/login');
    }
  }
};

const useSuggestion = async (suggestion: string) => {
  searchTerm.value = suggestion;
  currentPage.value = 1;
  await filterRecipes();
};

const handleImageError = (recipeId: number) => {
  imageLoadError.value[recipeId] = true;
  const recipe =
    filteredRecipes.value.find((r) => r.RecipeId === recipeId) ||
    recommendedRecipes.value.find((r) => r.RecipeId === recipeId);
  if (recipe) recipe.image_url = PLACEHOLDER_IMAGE;
};

const getImageUrl = (recipe: any) => {
  return recipe.image_url && recipe.image_url !== 'character(0)' ? recipe.image_url : PLACEHOLDER_IMAGE;
};

const openModal = (recipe: any) => {
  selectedRecipe.value = recipe;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedRecipe.value = null;
};

const fetchRecommendedRecipes = async () => {
  try {
    const response = await api.getRecommendations({
      params: {
        user_id: userId.value,
        limit: 12,
      },
    });
    recommendedRecipes.value = response.recommendations;
    recommendationMessage.value = response.message || '';
    if (recommendedRecipes.value.length === 0) {
      recommendationMessage.value =
        recommendationMessage.value || 'No new recommendations available. Explore more recipes!';
    }
    error.value = null;
  } catch (err) {
    console.error('Error fetching recommended recipes:', err);
    recommendedRecipes.value = [];
    recommendationMessage.value = 'Failed to load recommendations.';
    if ((err as any).response && (err as any).response.status === 401) {
      authStore.logout();
      router.push('/login');
    }
  }
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    if (searchTerm.value.trim()) filterRecipes();
    else fetchRecipes();
  }
};

const shuffledHeroRecipes = computed(() => {
  const recipesCopy = [...filteredRecipes.value];
  for (let i = recipesCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [recipesCopy[i], recipesCopy[j]] = [recipesCopy[j], recipesCopy[i]];
  }
  return recipesCopy.slice(0, 6);
});

onMounted(async () => {
  if (!authStore.isAuthenticated()) {
    router.push('/login');
    return;
  }

  await fetchRecipes();
  await fetchRecommendedRecipes();
});
</script>

<template>
  <NavigationBar />
  <div class="container mt-5 mb-5 pt-5 pb-5">
    <div v-if="error" class="alert alert-danger text-center" role="alert">
      {{ error }}
    </div>

    <div class="hero-carousel-container mb-5">
      <div id="heroCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">
        <div class="carousel-inner">
          <div v-if="shuffledHeroRecipes.length === 0" class="carousel-item active">
            <div class="text-center p-4 text-muted w-100">
              <p>No recipes available to display</p>
            </div>
          </div>
          <div v-else v-for="(recipe, index) in shuffledHeroRecipes" :key="recipe.RecipeId"
            :class="['carousel-item', { 'active': index === 0 }]">
            <img :src="getImageUrl(recipe)" class="d-block w-100 hero-image" @error="handleImageError(recipe.RecipeId)"
              :alt="recipe.Name">
            <div class="carousel-caption d-none d-md-block">
              <h5>{{ recipe.Name }}</h5>
              <p>{{ recipe.Description?.substring(0, 110) + '...' }}</p>
            </div>
          </div>
        </div>
        <button class="hero-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span class="hero-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="hero-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span class="hero-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>

    <div class="text-start mb-4">
      <h1 class="fw-bold">You may like these</h1>
    </div>

    <div class="recommendation-container mb-5 px-2 py-3">
      <div id="recommendationCarousel" class="carousel slide">
        <div class="carousel-indicators" v-if="groupedRecommendations.length > 1">
          <button v-for="(group, index) in groupedRecommendations" :key="index" type="button"
            :data-bs-target="'#recommendationCarousel'" :data-bs-slide-to="index" :class="{ 'active': index === 0 }"
            aria-current="true" :aria-label="'Slide ' + (index + 1)"></button>
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
                      {{
                        recipe.Name
                          ? recipe.Name.length > 20
                            ? recipe.Name.substring(0, 25) + '...'
                            : recipe.Name
                          : 'Name not loaded'
                      }}
                    </h5>
                    <p class="card-text text-muted">
                      {{
                        recipe.Description
                          ? recipe.Description.length > 20
                            ? recipe.Description.substring(0, 28) + '...'
                            : recipe.Description
                          : 'No description'
                      }}
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

    <div style="margin-top: 5rem;">
      <div class="text-start my-4">
        <h1 class="fw-bold">Explore</h1>
      </div>

      <div class="search-body d-flex justify-content-center mb-4">
        <div class="input-group w-50">
          <input class="form-control" type="text" placeholder="Search..." v-model="searchTerm"
            @keyup.enter="filterRecipes" />
          <button class="btn btn-success" @click="filterRecipes">Search</button>
        </div>
      </div>

      <div v-if="correctedQuery && correctedQuery !== originalQuery" class="text-center mb-4">
        Did you mean:
        <a href="#" @click.prevent="useSuggestion(correctedQuery)" class="fw-bold">{{ correctedQuery }}</a>?
      </div>

      <div class="item row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 px-2 py-3">
        <div v-for="recipe in filteredRecipes" :key="recipe.RecipeId" class="col">
          <div class="item-card card shadow-sm h-100" @click="openModal(recipe)">
            <img :src="getImageUrl(recipe)" class="card-img-top" @error="handleImageError(recipe.RecipeId)" />
            <div class="card-body">
              <h5 class="card-title fw-bold">
                {{
                  recipe.Name
                    ? recipe.Name.length > 20
                      ? recipe.Name.substring(0, 25) + '...'
                      : recipe.Name
                    : ''
                }}
              </h5>
              <p class="card-text text-muted">
                {{
                  recipe.Description
                    ? recipe.Description.length > 20
                      ? recipe.Description.substring(0, 28) + '...'
                      : recipe.Description
                    : 'No description'
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination d-flex justify-content-center align-items-center gap-3 mt-4" v-if="totalPages > 1">
      <button class="btn btn-primary" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
        Previous
      </button>
      <span class="text-muted">Page {{ currentPage }} of {{ totalPages }} ({{ totalResults }} results)</span>
      <button class="btn btn-primary" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
        Next
      </button>
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
/* Styles shared by both carousels */
.carousel-inner {
  text-align: center;
}

/* Hero Carousel Specific Styles */
.hero-carousel-container {
  width: 100%;
  max-width: 1248px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.hero-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.carousel-caption {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  padding: 10px 15px;
  bottom: 20px;
}

.carousel-caption h5 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.carousel-caption p {
  color: white;
  font-size: 1rem;
  margin-bottom: 0;
}

/* Hero Carousel Control Styles */
/* Hero Carousel Specific Styles (unchanged) */
.hero-carousel-container {
  width: 100%;
  max-width: 1248px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}

.hero-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.carousel-caption {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  padding: 10px 15px;
  bottom: 20px;
}

.carousel-caption h5 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.carousel-caption p {
  color: white;
  font-size: 1rem;
  margin-bottom: 0;
}

/* Hero Carousel Control Styles (updated) */
.hero-control-prev,
.hero-control-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background-color: #eb5216;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease, background-color 0.3s ease;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.hero-carousel-container:hover .hero-control-prev,
.hero-carousel-container:hover .hero-control-next {
  opacity: 0.8;
}

.hero-control-prev:hover,
.hero-control-next:hover {
  opacity: 1;
  background-color: #d35320;
}

.hero-control-prev {
  left: 20px;
}

.hero-control-next {
  right: 20px;
}

.hero-control-prev-icon,
.hero-control-next-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}

/* Using Bootstrap's default SVG icons as background images (unchanged) */
.hero-control-prev-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'/%3e%3c/svg%3e");
}

.hero-control-next-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
}

/* Recommendation Carousel Specific Styles */
.recommendation-container,
.item {
  width: 100%;
  max-width: 1248px;
  margin-left: auto;
  margin-right: auto;
}

/* Recommendation Carousel Control Styles */
.carousel-control-prev,
.carousel-control-next {
  width: 40px;
  height: 40px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #eb5216;
  border-radius: 50%;
  opacity: 0.8;
  transition: opacity 0.3s, background-color 0.3s;
}

.carousel-control-prev:hover,
.carousel-control-next:hover {
  opacity: 1;
  background-color: #d35320;
}

.carousel-control-prev {
  left: -50px;
}

.carousel-control-next {
  right: -50px;
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
}

/* Using Bootstrap's default SVG icons as background images */
.carousel-control-prev-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'/%3e%3c/svg%3e");
}

.carousel-control-next-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23fff'%3e%3cpath d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
}

/* Recommendation Carousel Indicators */
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
  background-color: #eb5216;
}

.carousel-indicators button:hover {
  background-color: #d35320;
}

/* Other Shared Styles */
.card-img-top {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
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
  background-color: #eb5216;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background-color: #d35320;
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
</style>
