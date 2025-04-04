<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="text-center mb-4">Đăng ký</h2>
            
            <form @submit.prevent="handleSubmit">
              <!-- Username field -->
              <div class="mb-3">
                <label for="username" class="form-label">Tên đăng nhập</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="formData.username"
                  required
                  :disabled="loading"
                  autocomplete="username"
                >
              </div>

              <!-- Full name field -->
              <div class="mb-3">
                <label for="full_name" class="form-label">Họ và tên</label>
                <input
                  type="text"
                  class="form-control"
                  id="full_name"
                  v-model="formData.full_name"
                  required
                  :disabled="loading"
                  autocomplete="name"
                >
              </div>

              <!-- Email field -->
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="formData.email"
                  required
                  :disabled="loading"
                  autocomplete="email"
                >
              </div>

              <!-- Password field -->
              <div class="mb-3">
                <label for="password" class="form-label">Mật khẩu</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="formData.password"
                  required
                  :disabled="loading"
                  autocomplete="new-password"
                >
              </div>

              <!-- Confirm Password field -->
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  class="form-control"
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  required
                  :disabled="loading"
                  autocomplete="new-password"
                >
              </div>

              <!-- Submit button -->
              <button 
                type="submit" 
                class="btn btn-primary w-100"
                :disabled="loading || !isFormValid"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
              </button>

              <!-- Login link -->
              <div class="text-center mt-3">
                <p class="mb-0">
                  Đã có tài khoản? 
                  <router-link :to="{ name: 'Login' }">Đăng nhập</router-link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();

const loading = ref(false);
const formData = ref({
  username: '',
  full_name: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const isFormValid = computed(() => {
  return formData.value.username &&
         formData.value.full_name &&
         formData.value.email &&
         formData.value.password &&
         formData.value.confirmPassword &&
         formData.value.password === formData.value.confirmPassword;
});

const handleSubmit = async () => {
  if (!isFormValid.value) {
    store.dispatch('showErrorToast', 'Vui lòng kiểm tra lại thông tin đăng ký', { root: true });
    return;
  }

  loading.value = true;
  
  try {
    await store.dispatch('auth/register', {
      username: formData.value.username,
      full_name: formData.value.full_name,
      email: formData.value.email,
      password: formData.value.password
    });
    
    store.dispatch('showSuccessToast', 'Đăng ký thành công! Vui lòng đăng nhập.', { root: true });
    router.push({ name: 'Login' });
  } catch (error) {
    console.error('Register error:', error);
    store.dispatch('showErrorToast', 'Đăng ký thất bại. Vui lòng thử lại.', { root: true });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
}
</style>