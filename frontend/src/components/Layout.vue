<template>
  <div class="portfolio-app">
    <!-- Sidebar Navigation -->
    <nav class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <i class="icon">📊</i>
          <span>Portfolio Manager</span>
        </div>
      </div>
      
      <ul class="nav-menu">
        <li class="nav-item" :class="{ active: currentRoute === 'dashboard' }">
          <router-link to="/dashboard" class="nav-link">
            <i class="nav-icon">🏠</i>
            <span>Dashboard</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'stock' }">
          <router-link to="/stock" class="nav-link">
            <i class="nav-icon">📈</i>
            <span>STOCK</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'bond' }">
          <router-link to="/bond" class="nav-link">
            <i class="nav-icon">🏛️</i>
            <span>BOND</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'cash' }">
          <router-link to="/cash" class="nav-link">
            <i class="nav-icon">💰</i>
            <span>CASH</span>
          </router-link>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <i class="nav-icon">📊</i>
            <span>Analytics</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <i class="nav-icon">📄</i>
            <span>Transactions</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <i class="nav-icon">📋</i>
            <span>Reports</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <i class="nav-icon">⚙️</i>
            <span>Settings</span>
          </a>
        </li>
      </ul>
      
      <div class="user-profile-sidebar">
        <div class="user-avatar">
          <span>JD</span>
        </div>
        <div class="user-info">
          <div class="user-name">John Doe</div>
          <div class="user-email">john.doe@example.com</div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="main-header">
        <div class="header-left">
          <h1>{{ getPageTitle() }}</h1>
        </div>
        <div class="header-right">
          <span class="last-updated">Last updated: {{ new Date().toLocaleTimeString() }}</span>
        </div>
      </header>

      <!-- Page Content -->
      <div class="page-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'Layout',
  setup() {
    const route = useRoute();
    
    const currentRoute = computed(() => {
      return route.name;
    });

    const getPageTitle = () => {
      const routeNames = {
        dashboard: 'Dashboard',
        stock: 'Stock Trading',
        bond: 'Fund Trading',
        cash: 'Cash Management',
        analytics: 'Analytics',
        transactions: 'Transactions',
        reports: 'Reports',
        settings: 'Settings'
      };
      return routeNames[route.name] || 'Portfolio Manager';
    };

    return {
      currentRoute,
      getPageTitle
    };
  }
};
</script>

<style scoped>
.portfolio-app {
  display: flex;
  min-height: 100vh;
  background: #f9fafb;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: #1f2937;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #374151;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo .icon {
  font-size: 28px;
}

.logo span {
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.nav-menu {
  flex: 1;
  list-style: none;
  padding: 24px 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #d1d5db;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: #374151;
  color: white;
}

.nav-item.active .nav-link {
  background: #4f46e5;
  color: white;
}

.nav-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.user-profile-sidebar {
  padding: 20px;
  border-top: 1px solid #374151;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.user-email {
  font-size: 12px;
  color: #9ca3af;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
}

.main-header {
  background: white;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.last-updated {
  font-size: 14px;
  color: #6b7280;
}

.page-content {
  flex: 1;
  overflow: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    width: 240px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .main-header {
    padding: 16px 20px;
  }
  
  .header-left h1 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100%;
  }
  
  .main-header {
    padding: 12px 16px;
  }
  
  .header-left h1 {
    font-size: 20px;
  }
  
  .last-updated {
    display: none;
  }
}
</style> 