/* eslint-disable vue/multi-word-component-names */
<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <div class="container">
      <router-link class="navbar-brand" :to="{ name: 'HomePage' }">Blog App</router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- Menu cho người dùng thông thường -->
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'HomePage' }">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'BlogList' }">Blog</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'About' }">About</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'Contact' }">Contact</router-link>
          </li>
          
          <!-- Menu Admin - chỉ hiển thị khi người dùng có quyền admin -->
          <li class="nav-item" v-if="isAdmin">
            <router-link class="nav-link" :to="{ name: 'AdminDashboard' }">Admin</router-link>
          </li>
        </ul>
        
        <div class="d-flex align-items-center">
          <!-- Hiển thị khi chưa đăng nhập -->
          <div v-if="!isAuthenticated">
            <router-link :to="{ name: 'Login' }" class="btn btn-outline-primary me-2">Đăng nhập</router-link>
            <router-link :to="{ name: 'Register' }" class="btn btn-primary">Đăng ký</router-link>
          </div>
          
          <!-- Hiển thị khi đã đăng nhập -->
          <div v-else class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fas fa-user me-1"></i> {{ username }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownUser">
              <li v-if="isAdmin"><router-link class="dropdown-item" :to="{ name: 'AdminDashboard' }">Quản trị</router-link></li>
              <li><router-link class="dropdown-item" :to="{ name: 'AccountSettings' }">Tài khoản</router-link></li>
              <li><hr class="dropdown-divider"></li>
              <li><button class="dropdown-item" @click="handleLogout">Đăng xuất</button></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { computed } from 'vue';

export default {
  name: 'AppHeader',
  setup() {
    const router = useRouter();
    const store = useStore();
    
    // Kiểm tra trạng thái đăng nhập
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    
    // Lấy thông tin người dùng
    const user = computed(() => store.getters['auth/user']);
    const username = computed(() => user.value ? (user.value.full_name || user.value.username) : 'Người dùng');
    
    // Kiểm tra quyền admin
    const isAdmin = computed(() => {
      return user.value && user.value.role === 'admin';
    });
    
    // Xử lý đăng xuất
    const handleLogout = async () => {
      await store.dispatch('auth/logout');
      router.push({ name: 'Login' });
    };
    
    return {
      isAuthenticated,
      isAdmin,
      username,
      handleLogout
    };
  }
};
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #0396FF 0%, #0D47A1 100%) !important;
  box-shadow: 0 2px 15px rgba(3, 150, 255, 0.2);
  padding: 0.8rem 0;
}

.navbar-brand {
  font-weight: 700;
  color: white !important;
  font-size: 1.4rem;
}

.nav-link {
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.9) !important;
}

.nav-link:hover {
  color: white !important;
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  color: white !important;
  border-bottom: 2px solid white;
}

.btn-outline-primary {
  color: white !important;
  border-color: white !important;
  background: transparent;
  transition: all 0.3s ease;
}

.btn-outline-primary:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateY(-1px);
}

.btn-primary {
  background: white !important;
  color: #0396FF !important;
  border: none !important;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #f8f9fa !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

.dropdown-menu {
  min-width: 10rem;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: white;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  color: #2c3e50;
}

.dropdown-item:hover {
  background-color: rgba(3, 150, 255, 0.1);
  color: #0396FF;
}

.dropdown-item:active {
  background-color: #0396FF;
  color: white;
}

.navbar-toggler {
  border-color: rgba(255, 255, 255, 0.5) !important;
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.9%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
}

/* Responsive styles */
@media (max-width: 992px) {
  .navbar-collapse {
    background: linear-gradient(135deg, #0396FF 0%, #0D47A1 100%);
    padding: 1rem;
    border-radius: 8px;
    margin-top: 0.5rem;
    box-shadow: 0 4px 20px rgba(3, 150, 255, 0.2);
  }
}
</style>