<script setup lang="ts">

</script>

<template>
  <div class="navbar">
    <ul class="topnav">
      <div style="display: flex; flex-direction: row;">
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
    <div class="search-body" style="text-align: center;">
      <h1>Foods And Drinks</h1>
      <br>
      <input type="text" placeholder="Search.." style="width: 600px; height: 40px; padding: 10px; font-size: 20px;">
    </div>

    <div class="result">
      <div class="result-item" style="display: flex; justify-content: space-around;">
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </div>

      <div class="result-item" style="display: flex; justify-content: space-around;">
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </div>

      <div class="result-item" style="display: flex; justify-content: space-around;">
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </div>

      <div class="result-item" style="display: flex; justify-content: space-around;">
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </div>

      <div class="result-item" style="display: flex; justify-content: space-around;">
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </div>
    </div>
  </div>
</template>

<style>
/** Navigation Bar **/
.navbar {
  position: fixed;
  top: 0;
  overflow: hidden;
  width: 100%;
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
  background-color: #2196F3;
  color: white;
}

.topnav input[type=text] {
  float: right;
  padding: 6px;
  border: none;
  margin-top: 10px;
  margin-right: 16px;
  font-size: 17px;
}

@media screen and (max-width: 600px) {
  .topnav a, .topnav input[type=text] {
    float: none;
    display: block;
    text-align: left;
    width: 100%;
    margin: 0;
    padding: 14px;
  }
  .topnav input[type=text] {
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
.result {
  width: 80%;
  margin: 20px;
}

.result-item {
  margin-bottom: 40px;
}
</style>
