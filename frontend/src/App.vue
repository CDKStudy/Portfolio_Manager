<template>
  <div id="app">
    <header class="app-header">
      <h1>📈 Portfolio Manager</h1>
      <p>Manage your financial portfolio with real-time data</p>
    </header>
    
    <main class="app-main">
      <router-view />
    </main>
    
    <footer class="app-footer">
      <p>&copy; 2025 Portfolio Manager Training Project</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.app-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.app-main {
  min-height: calc(100vh - 200px);
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.app-footer {
  background-color: #f8f9fa;
  padding: 1rem;
  text-align: center;
  color: #6c757d;
  border-top: 1px solid #e9ecef;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
}
</style> 