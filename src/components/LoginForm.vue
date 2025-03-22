<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const username = ref('');
const password = ref('');
const msg = 'Login to Your Account';
const errorMsg = ref('');

const router = useRouter();
const authStore = useAuthStore();

const handleSubmit = async () => {
  try {
    const response = await authStore.login(username.value, password.value);
    alert(response.message);
    router.push('/home');
  } catch (error) {
    errorMsg.value = (error as Error).message;
  }
};
</script>

<template>
  <div class="login min-vh-100 d-flex align-items-center">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body p-5">
              <h1 class="text-center text-success mb-4 h3">{{ msg }}</h1>

              <!-- Error message -->
              <div v-if="errorMsg" class="alert alert-danger" role="alert">
                {{ errorMsg }}
              </div>

              <!-- Form -->
              <form @submit.prevent="handleSubmit">
                <!-- Username -->
                <div class="mb-3">
                  <label for="username" class="form-label fw-bold">Username</label>
                  <input v-model="username" type="text" id="username" class="form-control"
                    placeholder="Enter your username" required />
                </div>

                <!-- Password -->
                <div class="mb-3">
                  <label for="password" class="form-label fw-bold">Password</label>
                  <input v-model="password" type="password" id="password" class="form-control"
                    placeholder="Enter your password" required />
                </div>

                <!-- Submit Button -->
                <div class="d-grid mb-3">
                  <button type="submit" class="btn btn-success">Login</button>
                </div>

                <!-- Register Link -->
                <div class="text-center">
                  <span>Don't have an account? </span>
                  <router-link to="/register" class="text-primary text-decoration-none fw-bold">
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

.btn-success:hover {
  background-color: #218838;
}
</style>
