<template>
  <div class="profile-settings">
    <h2 class="mb-4">Thông tin tài khoản</h2>
    
    <!-- Loading -->
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>
    
    <!-- Error -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <!-- Form thông tin -->
    <form v-else @submit.prevent="updateProfile" class="card p-4">
      <div class="mb-3">
        <label for="username" class="form-label">Tên đăng nhập</label>
        <input 
          type="text" 
          class="form-control" 
          id="username" 
          v-model="profileData.username"
          readonly
        >
        <small class="text-muted">Tên đăng nhập không thể thay đổi</small>
      </div>
      
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input 
          type="email" 
          class="form-control" 
          id="email" 
          v-model="profileData.email"
          required
        >
      </div>
      
      <div class="mb-3">
        <label for="fullName" class="form-label">Họ và tên</label>
        <input 
          type="text" 
          class="form-control" 
          id="fullName" 
          v-model="profileData.full_name"
        >
      </div>
      
      <div class="mb-3">
        <label for="bio" class="form-label">Tiểu sử</label>
        <textarea 
          class="form-control" 
          id="bio" 
          rows="3" 
          v-model="profileData.bio"
        ></textarea>
      </div>
      
      <div class="mb-3">
        <label for="avatar" class="form-label">Ảnh đại diện</label>
        <div class="d-flex align-items-center mb-2">
          <img 
            :src="profileData.avatar || 'https://via.placeholder.com/100'" 
            alt="Avatar" 
            class="rounded-circle me-3" 
            style="width: 100px; height: 100px; object-fit: cover;"
          >
          <button 
            type="button" 
            class="btn btn-outline-secondary" 
            @click="$refs.avatarInput.click()"
          >
            Thay đổi ảnh
          </button>
        </div>
        <input 
          type="file" 
          ref="avatarInput" 
          @change="handleAvatarChange" 
          class="d-none" 
          accept="image/*"
        >
      </div>
      
      <div class="d-flex justify-content-end">
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="updating"
        >
          <span v-if="updating" class="spinner-border spinner-border-sm me-2" role="status"></span>
          Cập nhật thông tin
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const loading = ref(false);
const updating = ref(false);
const error = ref(null);
const profileData = ref({
  username: '',
  email: '',
  full_name: '',
  bio: '',
  avatar: ''
});

// Avatar preview
const avatarFile = ref(null);

// Lấy thông tin người dùng hiện tại
const currentUser = computed(() => store.getters['auth/currentUser']);

// Load thông tin người dùng khi component mount
onMounted(async () => {
  if (currentUser.value) {
    loading.value = true;
    try {
      // Nạp thông tin người dùng từ API
      const userData = await store.dispatch('auth/fetchUserProfile');
      profileData.value = {
        username: userData.username || '',
        email: userData.email || '',
        full_name: userData.full_name || '',
        bio: userData.bio || '',
        avatar: userData.avatar || ''
      };
    } catch (err) {
      error.value = 'Không thể tải thông tin tài khoản. Vui lòng thử lại sau.';
      console.error('Error loading profile:', err);
    } finally {
      loading.value = false;
    }
  } else {
    error.value = 'Bạn cần đăng nhập để xem thông tin này.';
  }
});

// Upload avatar khi người dùng chọn file
const handleAvatarChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Giới hạn kích thước (2MB)
  if (file.size > 2 * 1024 * 1024) {
    store.dispatch('showErrorToast', 'File ảnh không được vượt quá 2MB', { root: true });
    return;
  }
  
  // Tạo preview
  avatarFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    profileData.value.avatar = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Cập nhật thông tin cá nhân
const updateProfile = async () => {
  updating.value = true;
  try {
    // Tạo FormData để gửi cả thông tin và avatar
    const formData = new FormData();
    formData.append('email', profileData.value.email);
    formData.append('full_name', profileData.value.full_name);
    formData.append('bio', profileData.value.bio);
    
    if (avatarFile.value) {
      formData.append('avatar', avatarFile.value);
    }
    
    // Gọi API cập nhật
    await store.dispatch('auth/updateUserProfile', formData);
    store.dispatch('showSuccessToast', 'Cập nhật thông tin thành công!', { root: true });
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.';
    store.dispatch('showErrorToast', errorMessage, { root: true });
    console.error('Error updating profile:', err);
  } finally {
    updating.value = false;
  }
};
</script> 