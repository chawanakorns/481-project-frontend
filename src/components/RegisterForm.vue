<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const username = ref('')
const password = ref('')
const msg = 'Register for an Account' // You can customize this message

const handleSubmit = async () => {
  try {
    const response = await axios.post('http://localhost:5000/register', {
      username: username.value,
      password: password.value,
    })
    alert(response.data.message) // Display success message
  } catch (error) {
    alert(error.response.data.message) // Display error message
  }
}
</script>

<template>
  <div class="register">
    <form @submit.prevent="handleSubmit">
      <div class="container">
        <h1 class="green">{{ msg }}</h1>

        <label><b>Username</b></label>
        <input v-model="username" type="text" required />

        <label><b>Password</b></label>
        <input v-model="password" type="password" required />

        <button type="submit">Sign Up</button>

        <div>
          <label>Already have an account?</label>
          <router-link to="/login">Login</router-link>
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
</style>
