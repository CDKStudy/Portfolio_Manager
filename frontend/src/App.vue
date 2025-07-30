<template>
  <div id="app">
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.app-main {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
}

#app {
  min-height: 100vh;
  width: 100%;
}
</style> 