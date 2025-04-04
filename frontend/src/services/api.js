import axios from 'axios';

// Tạo instance của axios với các cấu hình mặc định
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3003/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Interceptor để thêm token vào header nếu có
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Thêm response interceptor để xử lý lỗi
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Sử dụng handleApiError để xử lý lỗi
    return Promise.reject(handleApiError(error));
  }
);

// Auth APIs
const auth = {
  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },
  register(userData) {
    return apiClient.post('/auth/register', userData);
  },
  logout() {
    return apiClient.post('/auth/logout');
  },
  checkAuth() {
    return apiClient.get('/auth/check');
  },
  getProfile() {
    return apiClient.get('/auth/profile');
  },
  changePassword(passwordData) {
    return apiClient.post('/auth/change-password', passwordData);
  }
};

// Post APIs
const posts = {
  getAllPosts(page = 1, limit = 10) {
    return apiClient.get('/posts', { params: { page, limit } });
  },
  getPostById(postId) {
    return apiClient.get(`/posts/${postId}`);
  },
  createPost(postData) {
    return apiClient.post('/posts', postData);
  },
  updatePost(postId, postData) {
    return apiClient.put(`/posts/${postId}`, postData);
  },
  deletePost(postId) {
    return apiClient.delete(`/posts/${postId}`);
  },
  toggleLike(postId) {
    return apiClient.post(`/posts/${postId}/toggle-like`);
  },
  getPopularPosts() {
    return apiClient.get('/posts/popular');
  },
  incrementViewCount(postId) {
    return apiClient.post(`/posts/${postId}/increment-view`);
  }
};

// Comment APIs
const comments = {
  getCommentsByPostId: (postId) => apiClient.get(`/posts/${postId}/comments`),
  addComment: (postId, content) => apiClient.post(`/posts/${postId}/comments`, { content }),
  deleteComment: (commentId) => apiClient.delete(`/posts/comment/${commentId}`),
  getAllComments: (page = 1, limit = 20) => apiClient.get(`/admin/comments`, { params: { page, limit } })
};

// User APIs
const users = {
  getUsers() {
    return apiClient.get('/users');
  },
  getUserById(userId) {
    return apiClient.get(`/users/${userId}`);
  },
  updateUser(userId, userData) {
    return apiClient.put(`/users/${userId}`, userData);
  },
  deleteUser(userId) {
    return apiClient.delete(`/users/${userId}`);
  },
  getUserProfile() {
    return apiClient.get('/users/profile');
  },
  updateProfile(userData) {
    return apiClient.put('/users/profile', userData);
  }
};

// Like APIs
const likes = {
  getAllLikes(page = 1, limit = 20) {
    return apiClient.get('/likes', { params: { page, limit } });
  },
  getUserLikes() {
    return apiClient.get('/likes/user');
  },
  getRecentLikes(limit = 5) {
    // Fallback to getAllLikes để tránh gọi API không tồn tại
    return apiClient.get('/likes', { params: { page: 1, limit } });
  },
  getLikeByPostAndUser(postId, userId) {
    return apiClient.get(`/likes/post/${postId}/user/${userId}`);
  },
  deleteLike(userId, postId) {
    return apiClient.delete(`/likes/user/${userId}/post/${postId}`);
  }
};

// Fallback handler khi API không hoạt động
const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // Server trả về lỗi
    return {
      status: error.response.status,
      message: error.response.data.message || 'Có lỗi xảy ra'
    };
  } else if (error.request) {
    // Không nhận được response
    return {
      status: 0,
      message: 'Không thể kết nối đến máy chủ'
    };
  } else {
    // Lỗi khác
    return {
      status: 0,
      message: error.message
    };
  }
};

// Kết hợp tất cả API vào một đối tượng
export default {
  ...auth,
  ...posts,
  ...comments,
  ...users,
  ...likes
};

// Export riêng các nhóm API để có thể import riêng lẻ nếu cần
export { auth, posts, comments, users, likes, apiClient }; 