<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100 fade-in">
    <div class="col-md-5 col-lg-4">
      <div class="card shadow-lg border-0">
        <div class="card-body p-4">
          <h2 class="card-title text-center mb-4 fw-bold">Đăng nhập</h2>

          <!-- Thông báo đăng nhập thành công -->
          <transition name="fade">
            <div v-if="loginSuccess" class="alert alert-success py-2 small text-center">
              Đăng nhập thành công! Đang chuyển hướng...
            </div>
          </transition>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="username" class="form-label fw-semibold">Tên đăng nhập</label>
              <input
                type="text"
                class="form-control"
                id="username"
                v-model="credentials.username"
                required
                :disabled="loading"
              />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label fw-semibold">Mật khẩu</label>
              <input
                type="password"
                class="form-control"
                id="password"
                v-model="credentials.password"
                required
                :disabled="loading"
              />
            </div>

            <transition name="fade">
              <div v-if="error" class="alert alert-danger py-2 small text-center">
                {{ error }}
              </div>
            </transition>

            <div class="d-grid">
              <button type="submit" class="btn btn-primary btn-lg" :disabled="loading || loginSuccess">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
              </button>
            </div>
          </form>

          <p class="mt-3 text-center text-muted small">
            Chưa có tài khoản?
            <router-link :to="{ name: 'Register' }" class="text-decoration-none">Đăng ký ngay</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';

const store = useStore();
const router = useRouter();
const route = useRoute();

const credentials = ref({
  username: '',
  password: '',
});

const loading = computed(() => store.getters['auth/loading']);
const error = computed(() => store.getters['auth/error']);
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
const loginSuccess = ref(false);

watch(isAuthenticated, (newValue) => {
  if (newValue) {
    loginSuccess.value = true;
    setTimeout(() => {
      const redirectPath = route.query.redirect || '/home';
      router.push(redirectPath);
    }, 1000);
  }
});

const handleLogin = async () => {
  loginSuccess.value = false;

  try {
    const success = await store.dispatch('auth/login', credentials.value);

    if (success) {
      loginSuccess.value = true;
      setTimeout(() => {
        const redirectPath = route.query.redirect || '/home';
        router.push(redirectPath);
      }, 1000);
    }
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
  }
};
</script>

<style scoped>
/* Căn giữa form */
.d-flex {
  min-height: 100vh;
}

/* Hiệu ứng xuất hiện */
.fade-in {
  opacity: 0;
  animation: fadeIn 0.5s ease-in forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hiệu ứng mượt cho alert */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Tăng độ đẹp của form */
.card {
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.btn-lg {
  padding: 10px;
  font-size: 1.1rem;
}
</style>
