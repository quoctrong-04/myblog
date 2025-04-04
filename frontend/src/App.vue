<template>
  <div id="app">
    <Header />
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useStore } from 'vuex';
import Header from '@/components/layouts/Header.vue';

const store = useStore();

onMounted(() => {
  // Khôi phục trạng thái đăng nhập từ localStorage khi tải trang
  store.dispatch('auth/restoreAuth');
  
  console.log('App mounted - kiểm tra trạng thái xác thực');
});
</script>

<style>
/* Biến CSS toàn cục */
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --dark-color: #2c3e50;
  --light-color: #f8f9fa;
  --danger-color: #e74c3c;
  --warning-color: #f39c12;
  --info-color: #3498db;
  --success-color: #2ecc71;
  --border-radius: 8px;
  --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f9f9f9;
  color: #333;
  margin-top: 60px;
}

/* Style cho các toast thông báo */
.toast-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1050;
}

.toast {
  max-width: 350px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  animation: toast-in 0.5s;
}

@keyframes toast-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-header {
  border-bottom: none;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
}

.toast-success {
  background-color: rgba(46, 204, 113, 0.15);
  border-left: 4px solid var(--success-color);
}

.toast-error {
  background-color: rgba(231, 76, 60, 0.15);
  border-left: 4px solid var(--danger-color);
}

.toast-info {
  background-color: rgba(52, 152, 219, 0.15);
  border-left: 4px solid var(--info-color);
}

.toast-warning {
  background-color: rgba(243, 156, 18, 0.15);
  border-left: 4px solid var(--warning-color);
}

/* Hiệu ứng transition cho router */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  margin-top: 60px; /* Để tránh bị che bởi header fixed */
  padding: 20px;
  flex: 1;
}
</style>