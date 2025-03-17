<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; // For navigation after successful login

const username = ref('');
const password = ref('');
const msg = 'Login to Your Account'; // Customizable message
const errorMsg = ref(''); // To show error message if login fails

const router = useRouter(); // To handle routing after successful login

const handleSubmit = async () => {
  try {
    const response = await axios.post('http://localhost:5000/login', {
      username: username.value,
      password: password.value
    });
    alert(response.data.message); // Display success message
    router.push('/home'); // Redirect to the home page after successful login
  } catch (error) {
    if (error.response) {
      errorMsg.value = error.response.data.message; // Set error message from backend
    } else {
      errorMsg.value = 'An unexpected error occurred.'; // Fallback error message
    }
  }
};
</script>

<template>
  <div class="login">
    <form @submit.prevent="handleSubmit">
      <div class="container">
        <h1 class="green">{{ msg }}</h1>

        <!-- Display error message if any -->
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

        <label><b>Username</b></label>
        <input v-model="username" type="text" required />

        <label><b>Password</b></label>
        <input v-model="password" type="password" required />

        <button type="submit">Login</button>

        <div>
          <label>Don't have an account?</label>
          <router-link to="/register">Register</router-link>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.error {
  color: red;
  font-size: 1rem;
  margin-top: 10px;
}
</style>
