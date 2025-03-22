<template>
  <nav class="navbar navbar-expand-lg fixed-top shadow-sm">
    <div class="container-fluid px-4">
      <!-- Brand/logo area -->
      <a class="navbar-brand fw-bold text-primary" href="/home">
        <i class="bi bi-rocket-takeoff"></i>MyApp
      </a>

      <!-- Toggle button for mobile -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent"
        aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navigation items -->
      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" href="/home">
              <i class="bi bi-house"></i>Home
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/bookmarks">
              <i class="bi bi-bookmark"></i>Bookmarks
            </a>
          </li>
        </ul>

        <!-- Right-side actions -->
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-outline-primary position-relative">
            <a class="nav-link" href="#">
              <i class="bi bi-person-circle me-1"></i>Profile
            </a>
          </button>
          <button class="btn btn-primary">
            <a class="nav-link text-white" href="/logout">
              <i class="bi bi-box-arrow-right me-1"></i>Log out
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
  transition: color 0.2s ease;

}

.navbar-brand:hover {
  color: #0d6efd !important;
}

.nav-link {
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}

.btn {
  transition: transform 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(45deg, #0d6efd, #0a58ca);
  border: none;
}

.btn-outline-primary {
  border-width: 2px;
}

@media (max-width: 991px) {
  .navbar-collapse {
    padding: 1rem;
    background-color: #fff;
    border-radius: 0.5rem;
    margin-top: 0.5rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
}
</style>
