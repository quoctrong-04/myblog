<template>
  <div class="account-settings container py-5">
    <div class="row">
      <div class="col-md-3 mb-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Tài khoản</h5>
            <div class="list-group list-group-flush mt-3">
              <a 
                href="#" 
                class="list-group-item list-group-item-action"
                :class="{ 'active': activeTab === 'profile' }"
                @click.prevent="activeTab = 'profile'"
              >
                <i class="fas fa-user me-2"></i> Thông tin cá nhân
              </a>
              <a 
                href="#" 
                class="list-group-item list-group-item-action"
                :class="{ 'active': activeTab === 'password' }"
                @click.prevent="activeTab = 'password'"
              >
                <i class="fas fa-key me-2"></i> Đổi mật khẩu
              </a>
              <hr class="my-2">
              <a 
                href="#" 
                class="list-group-item list-group-item-action text-danger"
                @click.prevent="logout"
              >
                <i class="fas fa-sign-out-alt me-2"></i> Đăng xuất
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-9">
        <div class="card">
          <div class="card-body">
            <ProfileSettings v-if="activeTab === 'profile'" />
            <ChangePassword v-if="activeTab === 'password'" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import ProfileSettings from '@/components/user/ProfileSettings.vue';
import ChangePassword from '@/components/user/ChangePassword.vue';

const store = useStore();
const router = useRouter();
const activeTab = ref('profile');

// Đăng xuất
const logout = async () => {
  try {
    await store.dispatch('auth/logout');
    router.push('/login');
    store.dispatch('showSuccessToast', 'Đăng xuất thành công!', { root: true });
  } catch (error) {
    console.error('Logout error:', error);
  }
};
</script>

<style scoped>
.account-settings {
  min-height: calc(100vh - 200px);
}

.list-group-item.active {
  background-color: #f8f9fa;
  color: #212529;
  border-color: #dee2e6;
  border-left: 3px solid #0d6efd;
  font-weight: 500;
}

.list-group-item {
  border-left: 3px solid transparent;
}
</style> 