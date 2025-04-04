// src/store/index.js
import { createStore } from 'vuex';
import auth from './modules/auth';
import post from './modules/post';
import user from './modules/user';
import comment from './modules/comment'; // *** THÊM MODULE COMMENT ***
import like from './modules/like'; // *** THÊM MODULE LIKE ***

const store = createStore({
  state: {
    appName: 'My Blog',
    appVersion: '1.0.0',
    isLoading: false, // Global loading state (có thể dùng nếu cần)
    globalError: null,
    toast: {
      show: false,
      message: '',
      type: 'info', // 'success', 'error', 'warning', 'info'
      timeout: 3000,
    }
  },
  getters: {
    isLoading: state => state.isLoading,
    globalError: state => state.globalError,
    toast: state => state.toast
  },
  mutations: {
    setLoading(state, status) {
      state.isLoading = status;
    },
    setGlobalError(state, error) {
      state.globalError = error;
    },
    clearGlobalError(state) {
      state.globalError = null;
    },
    showToast(state, { message, type = 'info', timeout = 3000 }) {
      state.toast = { show: true, message, type, timeout };
    },
    hideToast(state) {
      state.toast.show = false;
    },
  },
  actions: {
    // Actions showToast gốc đã có timeout, có thể dùng trực tiếp
    showSuccessToast({ commit }, message) {
      commit('showToast', { message, type: 'success' });
    },
    showErrorToast({ commit }, message) {
      commit('showToast', { message, type: 'error', timeout: 5000 });
    },
    showWarningToast({ commit }, message) {
        commit('showToast', { message, type: 'warning' });
    },
    showInfoToast({ commit }, message) {
        commit('showToast', { message, type: 'info' });
    },
  },
  modules: {
    auth,
    post,
    user,
    comment, // *** ĐĂNG KÝ MODULE COMMENT ***
    like, // *** ĐĂNG KÝ MODULE LIKE ***
  },
  strict: process.env.NODE_ENV !== 'production',
});

// Tự động ẩn Toast sau thời gian timeout
let toastTimer = null;
store.subscribe((mutation, state) => {
  if (mutation.type === 'showToast') {
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      store.commit('hideToast');
    }, state.toast.timeout);
  }
  // Log mutations trong development (đã có sẵn)
  if (process.env.NODE_ENV === 'development' && mutation.type !== 'hideToast') {
        console.log('Mutation:', mutation.type);
        // console.log('Payload:', mutation.payload);
        // console.log('State after mutation:', state);
  }
});

export default store;