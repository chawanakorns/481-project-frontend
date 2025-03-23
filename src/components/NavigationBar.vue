<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>

<template>
  <nav class="navbar navbar-expand-lg fixed-top shadow-sm">
    <div class="container-fluid px-4">
      <!-- Brand/logo area -->
      <a class="navbar-brand fw-bold" href="/home">
        <Icon icon="mdi:food-fork-drink" width="32px" height="32px" class="me-1" /> DishCover
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
        <div class="d-flex align-items-center">
          <a class="nav-link d-flex align-items-center" href="/bookmarks">
            <Icon icon="mdi:bookmark-outline" width="32" height="32" />
          </a>
          <a class="nav-link d-flex align-items-center" href="#">
            <Icon icon="mdi:account-circle-outline" width="32" height="32" />
          </a>
          <button class="btn btn-primary">
            <a class="nav-link text-white d-flex align-items-center" href="/logout">
              <Icon icon="mdi:logout" /> Log out
            </a>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  z-index: 100;
  transition: all 0.3s ease;
}

.navbar-brand {
  font-size: 1.5rem;
  color: #eb5216;
  /* Set the color to #eb5216 */
  transition: color 0.2s ease;
}

.navbar-brand:hover {
  color: #a7431c !important;
  /* Keep the hover color as is */
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

.nav-link .iconify,
.navbar-brand .iconify {
  font-size: 1.2rem;
}

.btn {
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(45deg, #eb5216, #a7431c);
  border: none;
  margin-left: 16px;
}

.btn-primary:hover {
  background: linear-gradient(45deg, #eb5216, #a7431c);
}

.btn-outline-primary {
  border-width: 2px;
}

.btn-outline-primary:hover {
  background-color: rgba(13, 110, 253, 0.1);
}

@media (max-width: 991px) {
  .navbar-collapse {
    padding: 1rem;
    background-color: #fff;
    border-radius: 0.5rem;
    margin-top: 0.5rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .nav-link {
    padding: 0.75rem 1rem;
  }

  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .d-flex.align-items-center.gap-3 {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
}
</style>
