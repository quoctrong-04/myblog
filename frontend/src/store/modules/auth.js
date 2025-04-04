// src/store/modules/auth.js
import { apiClient } from '@/services/api';
import axios from 'axios';

export default {
  namespaced: true,
  
  state: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },

  getters: {
    isAuthenticated: state => !!state.token && !!state.user,
    isLoggedIn: state => state.isAuthenticated,
    user: state => state.user,
    userId: state => state.user?.id || state.user?.user_id || null,
    token: state => state.token,
    isAdmin: state => !!state.user && state.user.role === 'admin',
    loading: state => state.loading,
    error: state => state.error,
    currentUser: state => state.user
  },

  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setToken(state, token) {
      state.token = token;
      // Lưu token vào localStorage
      if (token) {
        localStorage.setItem('token', token);
        // Không thiết lập header Authorization ở đây để tránh lỗi 
      } else {
        localStorage.removeItem('token');
      }
    },
    setAuthenticated(state, status) {
      state.isAuthenticated = status;
    },
    setLoading(state, status) {
      state.loading = status;
    },
    setError(state, error) {
      state.error = error;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUserInfo(state, userData) {
      state.user = { ...state.user, ...userData };
      // Cập nhật thông tin user trong localStorage
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  },

  actions: {
    async login({ commit, dispatch }, credentials) {
      try {
        commit('setLoading', true);
        commit('setError', null);
        
        // Gọi API login bằng API hoàn chỉnh
        try {
          console.log('Đang gửi thông tin đăng nhập:', {
            username: credentials.username,
            // Không log mật khẩu vì lý do bảo mật
            password: '********'
          });
          
          const response = await axios.post('http://localhost:3003/api/auth/login', credentials, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          // Kiểm tra response theo cấu trúc API
          if (!response.data || !response.data.success) {
            throw new Error(response.data?.message || 'Đăng nhập thất bại');
          }
          
          const { user, accessToken } = response.data;

          // Lưu thông tin user và token
          commit('setUser', user);
          commit('setToken', accessToken);
          commit('setAuthenticated', true);

          // Lưu token vào localStorage để duy trì phiên đăng nhập
          localStorage.setItem('token', accessToken);
          localStorage.setItem('user', JSON.stringify(user));

          // Hiển thị thông báo thành công
          dispatch('showSuccessToast', 'Đăng nhập thành công!', { root: true });
          
          return true;
        } catch (error) {
          if (error.response && error.response.status === 404) {
            // Thử với apiClient nếu URL trực tiếp không làm việc
            const response = await apiClient.login(credentials);
            
            if (!response.data || !response.data.success) {
              throw new Error(response.data?.message || 'Đăng nhập thất bại');
            }
            
            const { user, accessToken } = response.data;
            
            commit('setUser', user);
            commit('setToken', accessToken);
            commit('setAuthenticated', true);
            
            // Lưu token vào localStorage để duy trì phiên đăng nhập
            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            
            dispatch('showSuccessToast', 'Đăng nhập thành công!', { root: true });
            return true;
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error('Lỗi đăng nhập:', error.message);
        
        if (error.response) {
          console.error('Status code:', error.response.status);
        }
        
        const errorMessage = error.response?.data?.message || error.message || 'Lỗi đăng nhập. Vui lòng thử lại.';
        commit('setError', errorMessage);
        dispatch('showErrorToast', errorMessage, { root: true });
        return false;
      } finally {
        commit('setLoading', false);
      }
    },

    async register({ commit, dispatch }, userData) {
      try {
        commit('setLoading', true);
        commit('setError', null);
        
        // Chuẩn bị dữ liệu gửi đi theo đúng cấu trúc bảng users
        const registerData = {
          username: userData.username,
          password: userData.password, // Lưu ý: Trong thực tế, mật khẩu nên được băm ở phía server
          email: userData.email,
          full_name: userData.full_name
        };
        
        console.log('Dữ liệu đăng ký:', {
          ...registerData,
          password: '********' // Không log mật khẩu thật
        });
        
        try {
          // Gọi API register trực tiếp bằng URL tuyệt đối
          const response = await axios.post('http://localhost:3003/api/auth/register', registerData, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          // Kiểm tra response theo cấu trúc API
          if (!response.data || !response.data.success) {
            throw new Error(response.data?.message || 'Đăng ký thất bại');
          }
          
          dispatch('showSuccessToast', 'Đăng ký thành công! Vui lòng đăng nhập.', { root: true });
          return true;
        } catch (error) {
          // Xử lý lỗi API
          console.error('Lỗi đăng ký:', error);
          
          // Xử lý thông báo lỗi
          let errorMessage = 'Lỗi đăng ký. Vui lòng thử lại.';
          
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
            
            // Xử lý thông báo lỗi kết nối
            if (error.message.includes('Network Error')) {
              errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.';
            } else if (error.message.includes('404')) {
              errorMessage = 'Không tìm thấy API đăng ký. Vui lòng kiểm tra cấu hình server.';
            }
          }
          
          commit('setError', errorMessage);
          dispatch('showErrorToast', errorMessage, { root: true });
          return false;
        }
      } catch (error) {
        console.error('Lỗi xử lý đăng ký:', error);
        commit('setError', 'Lỗi hệ thống. Vui lòng thử lại sau.');
        dispatch('showErrorToast', 'Lỗi hệ thống. Vui lòng thử lại sau.', { root: true });
        return false;
      } finally {
        commit('setLoading', false);
      }
    },

    async logout({ commit, dispatch }) {
      try {
        commit('clearAuth');
        dispatch('showSuccessToast', 'Đăng xuất thành công!', { root: true });
      } catch (error) {
        console.error('Logout error:', error);
      }
    },

    // Khôi phục trạng thái đăng nhập từ localStorage
    restoreAuth({ commit }) {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (token && user) {
          commit('setToken', token);
          commit('setUser', user);
          commit('setAuthenticated', true);
          return true;
        }
      } catch (error) {
        console.error('Restore auth error:', error);
        commit('clearAuth');
      }
      return false;
    },

    // Kiểm tra token còn hạn không
    async checkAuth({ commit, dispatch }) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return false;
        }
        
        // Có thể thêm endpoint kiểm tra token nếu cần
        // const response = await apiClient.checkAuth();
        
        // Giữ nguyên trạng thái đăng nhập nếu có token
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          commit('setUser', user);
          commit('setAuthenticated', true);
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Check auth error:', error);
        dispatch('logout');
        return false;
      }
    },

    // Lấy thông tin profile người dùng
    async fetchUserProfile({ commit, state, dispatch }) {
      try {
        if (!state.token) {
          throw new Error('Bạn chưa đăng nhập');
        }

        const response = await axios.get('http://localhost:3003/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${state.token}`
          }
        });

        if (!response.data || !response.data.success) {
          throw new Error(response.data?.message || 'Không thể tải thông tin người dùng');
        }

        // Cập nhật thông tin người dùng
        commit('updateUserInfo', response.data.user);
        return response.data.user;
      } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tải thông tin người dùng';
        commit('setError', errorMessage);
        dispatch('showErrorToast', errorMessage, { root: true });
        throw error;
      }
    },

    // Cập nhật thông tin profile
    async updateUserProfile({ commit, state, dispatch }, userData) {
      try {
        if (!state.token) {
          throw new Error('Bạn chưa đăng nhập');
        }

        // FormData đã được tạo từ component
        const response = await axios.put('http://localhost:3003/api/users/profile', userData, {
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        if (!response.data || !response.data.success) {
          throw new Error(response.data?.message || 'Không thể cập nhật thông tin người dùng');
        }

        // Cập nhật thông tin người dùng
        commit('updateUserInfo', response.data.user);
        dispatch('showSuccessToast', 'Cập nhật thông tin thành công!', { root: true });
        return response.data.user;
      } catch (error) {
        console.error('Lỗi khi cập nhật thông tin người dùng:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật thông tin người dùng';
        commit('setError', errorMessage);
        dispatch('showErrorToast', errorMessage, { root: true });
        throw error;
      }
    },

    // Đổi mật khẩu
    async changePassword({ commit, state, dispatch }, passwordData) {
      try {
        if (!state.token) {
          throw new Error('Bạn chưa đăng nhập');
        }

        console.log('Gửi yêu cầu đổi mật khẩu:', {
          currentPassword: '********', // Ẩn mật khẩu thật
          newPassword: '********',
          endpoint: '/api/auth/change-password'
        });

        // Sử dụng axios trực tiếp với URL đầy đủ
        const response = await axios.post('http://localhost:3003/api/auth/change-password', {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }, {
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Phản hồi từ server:', {
          status: response.status,
          success: response.data?.success,
          message: response.data?.message
        });

        if (!response.data || !response.data.success) {
          throw new Error(response.data?.message || 'Không thể đổi mật khẩu');
        }

        dispatch('showSuccessToast', 'Đổi mật khẩu thành công!', { root: true });
        return true;
      } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        console.error('Chi tiết lỗi:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        // Thử xác định nguyên nhân lỗi cụ thể
        let errorMessage = 'Không thể đổi mật khẩu';
        
        if (error.response) {
          if (error.response.status === 400) {
            errorMessage = error.response.data?.message || 'Dữ liệu không hợp lệ. Kiểm tra lại mật khẩu.';
          } else if (error.response.status === 401) {
            errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
          } else if (error.response.status === 404) {
            errorMessage = 'Không tìm thấy API đổi mật khẩu. Vui lòng kiểm tra lại cấu hình.';
          } else {
            errorMessage = error.response.data?.message || `Lỗi server (${error.response.status})`;
          }
        } else if (error.request) {
          errorMessage = 'Không thể kết nối đến server. Kiểm tra kết nối mạng.';
        } else {
          errorMessage = error.message;
        }
        
        commit('setError', errorMessage);
        dispatch('showErrorToast', errorMessage, { root: true });
        throw error;
      }
    }
  }
};