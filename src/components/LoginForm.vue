<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Icon } from '@iconify/vue'

const username = ref('')
const password = ref('')
const msg = 'Login to Your Account'
const errorMsg = ref('')

const router = useRouter()
const authStore = useAuthStore()

const handleSubmit = async () => {
  try {
    const response = await authStore.login(username.value, password.value)
    alert(response.message)
    router.push('/home')
  } catch (error) {
    errorMsg.value = (error as Error).message
  }
}
</script>

<template>
  <div class="login min-vh-100 d-flex align-items-center"
    style="background: linear-gradient(135deg, #f8f9fa, #e9ecef);">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-lg border-0 rounded-4">
            <div class="card-body p-5">
              <h1 class="text-center text-success mb-4 h3 fw-bold">{{ msg }}</h1>

              <!-- Error message -->
              <div v-if="errorMsg" class="alert alert-danger" role="alert">
                {{ errorMsg }}
              </div>

              <!-- Form -->
              <form @submit.prevent="handleSubmit">
                <!-- Username -->
                <div class="mb-3">
                  <label for="username" class="form-label fw-bold">Username</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <Icon icon="mdi:account-outline" width="20" />
                    </span>
                    <input v-model="username" type="text" id="username" class="form-control border-start-0"
                      placeholder="Enter your username" required />
                  </div>
                </div>

                <!-- Password -->
                <div class="mb-3">
                  <label for="password" class="form-label fw-bold">Password</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <Icon icon="mdi:lock-outline" width="20" />
                    </span>
                    <input v-model="password" type="password" id="password" class="form-control border-start-0"
                      placeholder="Enter your password" required />
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="d-grid mb-3">
                  <button type="submit" class="btn btn-success btn-lg fw-bold" style="background-color: #eb5216">
                    <Icon icon="mdi:login" class="me-2" /> Login
                  </button>
                </div>

                <!-- Register Link -->
                <div class="text-center">
                  <span>Don't have an account? </span>
                  <router-link to="/register" class="text-success text-decoration-none fw-bold">
                    Register
                  </router-link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login {
  background-color: #f8f9fa;
}

.card {
  border-radius: 10px;
}

.btn-success {
  background-color: #28a745;
  border: none;
  transition: background-color 0.3s ease;
}

.btn-success:hover {
  background-color: #218838;
}

.input-group-text {
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
}

.form-control {
  border: 1px solid #ced4da;
}
</style>
