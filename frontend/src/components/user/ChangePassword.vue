<template>
  <div class="change-password">
    <h2 class="mb-4">Đổi mật khẩu</h2>
    
    <div v-if="statusMessage" class="alert" :class="statusMessageType">
      {{ statusMessage }}
    </div>
    
    <form @submit.prevent="changePassword" class="card p-4">
      <div class="mb-3">
        <label for="currentPassword" class="form-label">Mật khẩu hiện tại</label>
        <input 
          type="password" 
          class="form-control" 
          id="currentPassword" 
          v-model="passwordData.currentPassword"
          required
          :disabled="updating"
        >
      </div>
      
      <div class="mb-3">
        <label for="newPassword" class="form-label">Mật khẩu mới</label>
        <input 
          type="password" 
          class="form-control" 
          id="newPassword" 
          v-model="passwordData.newPassword"
          required
          minlength="8"
          :disabled="updating"
        >
        <small class="text-muted">Mật khẩu phải có ít nhất 8 ký tự</small>
      </div>
      
      <div class="mb-3">
        <label for="confirmPassword" class="form-label">Xác nhận mật khẩu mới</label>
        <input 
          type="password" 
          class="form-control" 
          id="confirmPassword" 
          v-model="passwordData.confirmPassword"
          required
          :disabled="updating"
        >
        <div v-if="!passwordsMatch && passwordData.confirmPassword" class="form-text text-danger">
          Mật khẩu xác nhận không khớp
        </div>
      </div>
      
      <div class="d-flex justify-content-end">
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="updating || !passwordsMatch || !formValid"
        >
          <span v-if="updating" class="spinner-border spinner-border-sm me-2" role="status"></span>
          Đổi mật khẩu
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const updating = ref(false);
const statusMessage = ref('');
const statusMessageType = ref('');
const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Kiểm tra mật khẩu mới và xác nhận khớp nhau
const passwordsMatch = computed(() => {
  if (!passwordData.value.confirmPassword) return true;
  return passwordData.value.newPassword === passwordData.value.confirmPassword;
});

// Kiểm tra form hợp lệ
const formValid = computed(() => {
  return (
    passwordData.value.currentPassword.length > 0 && 
    passwordData.value.newPassword.length >= 8 && 
    passwordsMatch.value
  );
});

// Thay đổi mật khẩu
const changePassword = async () => {
  if (!formValid.value) return;
  
  statusMessage.value = '';
  updating.value = true;
  
  try {
    // Hiển thị thông báo đang xử lý
    statusMessage.value = 'Đang xử lý yêu cầu...';
    statusMessageType.value = 'alert-info';
    
    await store.dispatch('auth/changePassword', {
      currentPassword: passwordData.value.currentPassword,
      newPassword: passwordData.value.newPassword
    });
    
    // Reset form sau khi thành công
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    // Hiển thị thông báo thành công
    statusMessage.value = 'Đổi mật khẩu thành công!';
    statusMessageType.value = 'alert-success';
    store.dispatch('showSuccessToast', 'Đổi mật khẩu thành công!', { root: true });
  } catch (err) {
    console.error('Chi tiết lỗi đổi mật khẩu:', err);
    
    // Xử lý lỗi một cách chi tiết hơn
    let errorMessage = 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại thông tin.';
    
    if (err.response) {
      if (err.response.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      } else if (err.response.status === 400 && err.response.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response.data?.message) {
        errorMessage = err.response.data.message;
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    statusMessage.value = errorMessage;
    statusMessageType.value = 'alert-danger';
    
    // Nếu là lỗi mật khẩu hiện tại không đúng, xóa chỉ trường mật khẩu hiện tại
    if (errorMessage.includes('mật khẩu hiện tại') || errorMessage.includes('current password')) {
      passwordData.value.currentPassword = '';
    }
    
    store.dispatch('showErrorToast', errorMessage, { root: true });
  } finally {
    updating.value = false;
  }
};
</script>

<style scoped>
.alert {
  margin-bottom: 1rem;
}
</style> 