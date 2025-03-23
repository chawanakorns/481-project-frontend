<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>

<template>
  <nav class="navbar navbar-expand-lg fixed-top shadow-sm"
    style="background: linear-gradient(135deg, #ffffff, #f8f9fa);">
    <div class="container-fluid px-4">
      <!-- Brand/logo area -->
      <a class="navbar-brand fw-bold d-flex align-items-center" href="/home">
        <Icon icon="mdi:food-fork-drink" width="32" height="32" class="me-2" />
        <span class="text-gradient">DishCover</span>
      </a>

      <!-- Toggle button for mobile -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent"
        aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navigation items -->
      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0"></ul>

        <!-- Right-side actions -->
        <div class="d-flex align-items-center gap-3">
          <a class="nav-link d-flex align-items-center" href="/bookmarks">
            <Icon icon="mdi:bookmark-outline" width="24" height="24" />
          </a>
          <button class="btn btn-danger btn-sm fw-bold">
            <a class="nav-link text-white d-flex align-items-center" href="/logout">
              <Icon icon="mdi:logout" class="me-1" /> Log out
            </a>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  z-index: 100;
  transition: all 0.3s ease;
}

.navbar-brand {
  font-size: 1.5rem;
  color: #eb5216;
  transition: color 0.2s ease;
}

.navbar-brand:hover {
  color: #a7431c !important;
}

.nav-link {
  color: #333;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  margin-left: 6px;
  margin-right: 6px;
}

.nav-link:hover {
  color: #a7431c;
}

.btn-danger {
  background-color: #dc3545;
  border: none;
  transition: background-color 0.3s ease;
}

.btn-danger:hover {
  background-color: #c82333;
}

.text-gradient {
  background: linear-gradient(45deg, #eb5216, #a7431c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
