<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="register">
    <form action="" method="post">
      <div class="container">
        <h1 class="green">{{ msg }}</h1>

        <label><b>Username</b></label>
        <input>

        <label><b>Password</b></label>
        <input>

        <button type="submit"><router-link to="/login">Sign Up</router-link></button>

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
