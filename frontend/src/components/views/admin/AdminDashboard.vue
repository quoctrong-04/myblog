<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <div class="col-md-3 col-lg-2 d-md-block bg-light sidebar py-3">
        <div class="position-sticky">
          <ul class="nav flex-column">
            <li class="nav-item">
              <router-link class="nav-link" :to="{ name: 'AdminDashboard' }">
                <i class="fas fa-chart-line me-2"></i>
                Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :to="{ name: 'AdminPosts' }">
                <i class="fas fa-newspaper me-2"></i>
                Quản lý bài viết
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :to="{ name: 'AdminComments' }">
                <i class="fas fa-comments me-2"></i>
                Quản lý bình luận
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :to="{ name: 'AdminLikes' }">
                <i class="fas fa-heart me-2"></i>
                Quản lý lượt thích
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :to="{ name: 'AdminCreatePost' }">
                <i class="fas fa-plus-circle me-2"></i>
                Đăng bài mới
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- Main content -->
      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
          <h1 class="h2">Dashboard</h1>
          <div class="btn-toolbar mb-2 mb-md-0">
            <div class="btn-group me-2">
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="refreshData">
                <i class="fas fa-sync me-1"></i> Làm mới
              </button>
            </div>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="row">
          <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-primary shadow h-100 py-2">
              <div class="card-body">
                <div class="row no-gutters align-items-center">
                  <div class="col mr-2">
                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                      Tổng bài viết</div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                      <div v-if="loading" class="spinner-border spinner-border-sm" role="status"></div>
                      <span>{{ totalPosts }}</span>
                    </div>
                  </div>
                  <div class="col-auto">
                    <i class="fas fa-newspaper fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-success shadow h-100 py-2" @click="reloadComments">
              <div class="card-body">
                <div class="row no-gutters align-items-center">
                  <div class="col mr-2">
                    <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                      Tổng bình luận</div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                      <div v-if="loading" class="spinner-border spinner-border-sm" role="status"></div>
                      <span>{{ totalComments }}</span>
                    </div>
                  </div>
                  <div class="col-auto">
                    <i class="fas fa-comments fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-info shadow h-100 py-2">
              <div class="card-body">
                <div class="row no-gutters align-items-center">
                  <div class="col mr-2">
                    <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                      Tổng lượt thích</div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                      <div v-if="loading" class="spinner-border spinner-border-sm" role="status"></div>
                      <span>{{ totalLikes }}</span>
                    </div>
                  </div>
                  <div class="col-auto">
                    <i class="fas fa-heart fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-warning shadow h-100 py-2">
              <div class="card-body">
                <div class="row no-gutters align-items-center">
                  <div class="col mr-2">
                    <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                      Tổng lượt xem</div>
                    <div class="h5 mb-0 font-weight-bold text-gray-800">
                      <div v-if="loading" class="spinner-border spinner-border-sm" role="status"></div>
                      <span>{{ totalViews }}</span>
                    </div>
                  </div>
                  <div class="col-auto">
                    <i class="fas fa-eye fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Posts Table -->
        <div class="card shadow mb-4">
          <div class="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 class="m-0 font-weight-bold text-primary">Bài viết gần đây</h6>
            <router-link :to="{ name: 'AdminPosts' }" class="btn btn-sm btn-primary">
              <i class="fas fa-list me-1"></i> Xem tất cả
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
              </div>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th scope="col">Tiêu đề</th>
                    <th scope="col">Tác giả</th>
                    <th scope="col">Ngày đăng</th>
                    <th scope="col">Lượt xem</th>
                    <th scope="col">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="post in recentPosts" :key="post.post_id">
                    <td>
                      <a href="#" @click.prevent="viewPost(post)" class="text-primary">
                        {{ truncateText(post.title, 50) }}
                      </a>
                    </td>
                    <td>{{ post.username }}</td>
                    <td>{{ formatDate(post.created_at) }}</td>
                    <td>{{ post.view_count }}</td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <router-link :to="{ name: 'AdminEditPost', params: { id: post.post_id }}" class="btn btn-primary">
                          <i class="fas fa-edit"></i>
                        </router-link>
                        <button @click="confirmDelete(post)" class="btn btn-danger">
                          <i class="fas fa-trash-alt"></i>
                        </button>
                        <button @click="viewPost(post)" class="btn btn-info">
                          <i class="fas fa-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="recentPosts.length === 0">
                    <td colspan="5" class="text-center">Không có bài viết nào</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Recent Likes Table -->
        <div class="card shadow mb-4">
          <div class="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 class="m-0 font-weight-bold text-primary">Lượt thích gần đây</h6>
            <router-link :to="{ name: 'AdminLikes' }" class="btn btn-sm btn-primary">
              <i class="fas fa-list me-1"></i> Xem tất cả
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="loadingLikes" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
              </div>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Người dùng</th>
                    <th scope="col">Bài viết</th>
                    <th scope="col">Thời gian</th>
                    <th scope="col">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="like in recentLikes" :key="`${like.user_id}-${like.post_id}`">
                    <td>{{ like.id || `${like.user_id}-${like.post_id}` }}</td>
                    <td>{{ like.username || like.user_id }}</td>
                    <td>
                      <router-link :to="{ name: 'PostDetail', params: { id: like.post_id } }">
                        {{ truncateText(like.post_title || 'Bài viết', 30) }}
                      </router-link>
                    </td>
                    <td>{{ formatDate(like.created_at) }}</td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button @click="deleteLike(like)" class="btn btn-danger">
                          <i class="fas fa-trash-alt"></i>
                        </button>
                        <router-link :to="{ name: 'PostDetail', params: { id: like.post_id }}" class="btn btn-info">
                          <i class="fas fa-eye"></i>
                        </router-link>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="recentLikes.length === 0">
                    <td colspan="5" class="text-center">Không có lượt thích nào</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();
const loading = ref(false);
const loadingLikes = ref(false);
const recentPosts = ref([]);
const recentLikes = ref([]);

// Thống kê
const totalPosts = ref(0);
const totalComments = ref(0);
const totalLikes = ref(0);
const totalViews = ref(0);

// Lấy dữ liệu khi component được mount
onMounted(async () => {
  await refreshData();
});

// Làm mới dữ liệu
const refreshData = async () => {
  loading.value = true;
  loadingLikes.value = true;
  try {
    // Đặt giá trị hiển thị ngay để không bị nhảy
    totalPosts.value = 0;
    totalComments.value = 0;
    totalLikes.value = 0;
    totalViews.value = 0;
    
    // Lấy bài viết
    await store.dispatch('post/fetchPosts');
    const posts = store.getters['post/posts'];
    recentPosts.value = [...posts].slice(0, 5); // Lấy 5 bài viết gần nhất
    
    // Lấy dữ liệu lượt thích
    try {
      const likesResponse = await store.dispatch('like/fetchRecentLikes', { limit: 5 });
      recentLikes.value = likesResponse?.slice(0, 5) || [];
    } catch (error) {
      console.error('Error fetching likes:', error);
      recentLikes.value = [];
    }
    
    // Lấy tổng số bình luận từ backend
    await loadAllComments();
    
    // Tính toán các thống kê khác
    calculateStatisticsExceptComments(posts);
  } catch (error) {
    console.error('Error refreshing data:', error);
    // Không hiển thị thông báo lỗi để tránh làm phiền người dùng
  } finally {
    loading.value = false;
    loadingLikes.value = false;
  }
};

// Tải tất cả bình luận
const loadAllComments = async () => {
  try {
    // Lấy tất cả bài viết từ store
    const posts = store.getters['post/posts'];
    if (posts.length === 0) {
      // Nếu chưa có bài viết, tải bài viết trước
      await store.dispatch('post/fetchPosts');
    }
    
    // Dùng API comments để lấy tất cả bình luận
    try {
      // Gọi API trực tiếp để lấy tất cả bình luận
      // eslint-disable-next-line no-unused-vars
      const commentsResponse = await store.dispatch('comment/fetchAllComments', { page: 1 });
      totalComments.value = store.getters['comment/allComments'].length;
    } catch {
      // Nếu API lỗi, thử phương án dự phòng
      // Tổng hợp bình luận từ từng bài viết
      const posts = store.getters['post/posts'];
      let allComments = [];
      
      for (const post of posts) {
        const postId = post.post_id || post.id;
        if (postId) {
          try {
            const response = await store.dispatch('comment/fetchComments', postId);
            if (Array.isArray(response)) {
              allComments = [...allComments, ...response];
            }
          } catch (err) {
            console.error(`Error fetching comments for post ${postId}:`, err);
          }
        }
      }
      
      // Cập nhật tổng số bình luận
      totalComments.value = allComments.length;
    }
  } catch (error) {
    console.error('Error loading all comments:', error);
    totalComments.value = 0; // Đặt giá trị mặc định
  }
};

// Thêm chức năng này để làm mới số lượng bình luận
const reloadComments = async () => {
  try {
    await loadAllComments();
  } catch (error) {
    console.error('Error reloading comments:', error);
  }
};

// Tính toán thống kê tất cả trừ comments
const calculateStatisticsExceptComments = (posts) => {
  totalPosts.value = posts.length;
  
  // Tính tổng lượt xem
  totalViews.value = posts.reduce((sum, post) => sum + (post.view_count || 0), 0);
  
  // Tính tổng lượt thích
  totalLikes.value = posts.reduce((sum, post) => sum + (post.like_count || 0), 0);
};

// eslint-disable-next-line no-unused-vars
const calculateStatistics = (posts) => {
  totalPosts.value = posts.length;
  
  // Tính tổng lượt xem
  totalViews.value = posts.reduce((sum, post) => sum + (post.view_count || 0), 0);
  
  // Tính tổng lượt thích
  totalLikes.value = posts.reduce((sum, post) => sum + (post.like_count || 0), 0);
  
  // Tổng số bình luận
  totalComments.value = posts.reduce((sum, post) => sum + (post.comment_count || 0), 0);
};

// Xác nhận xóa bài viết
const confirmDelete = (post) => {
  if (confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}"?`)) {
    deletePost(post.post_id);
  }
};

// Xóa bài viết
const deletePost = async (postId) => {
  try {
    await store.dispatch('post/deletePost', postId);
    store.dispatch('showSuccessToast', 'Đã xóa bài viết thành công!', { root: true });
    await refreshData();
  } catch (error) {
    console.error('Error deleting post:', error);
    store.dispatch('showErrorToast', 'Không thể xóa bài viết. Vui lòng thử lại sau.', { root: true });
  }
};

// Xóa lượt thích
const deleteLike = async (like) => {
  if (confirm('Bạn có chắc chắn muốn xóa lượt thích này?')) {
    try {
      await store.dispatch('like/deleteLike', { userId: like.user_id, postId: like.post_id });
      store.dispatch('showSuccessToast', 'Đã xóa lượt thích thành công!', { root: true });
      await refreshData();
    } catch (error) {
      console.error('Error deleting like:', error);
      store.dispatch('showErrorToast', 'Không thể xóa lượt thích. Vui lòng thử lại sau.', { root: true });
    }
  }
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
};

// Cắt ngắn text
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Tăng lượt xem bài viết
const viewPost = async (post) => {
  try {
    // Tăng lượt xem trước khi chuyển hướng
    await store.dispatch('post/incrementViewCount', post.post_id || post.id);
    
    // Cập nhật UI ngay lập tức
    post.view_count = (post.view_count || 0) + 1;
    totalViews.value += 1;
    
    // Hiển thị thông báo
    store.dispatch('showSuccessToast', 'Đã tăng lượt xem bài viết!', { root: true });
    
    // Chuyển hướng đến trang chi tiết bài viết
    router.push({ name: 'PostDetail', params: { id: post.post_id || post.id }});
  } catch (error) {
    console.error('Error incrementing view count:', error);
    
    // Vẫn chuyển hướng ngay cả khi có lỗi
    router.push({ name: 'PostDetail', params: { id: post.post_id || post.id }});
  }
};
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 80px; /* Tương ứng với chiều cao header */
  height: calc(100vh - 80px);
  z-index: 100;
}

.nav-link {
  color: #333;
  border-radius: 5px;
  margin: 3px 0;
  padding: 10px;
  transition: all 0.2s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: #f0f7ff;
  color: #3498db;
}

.nav-link.router-link-exact-active {
  background-color: #e1f0ff;
  color: #3498db;
  font-weight: bold;
}

.card {
  border-radius: 8px;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
  border: none;
}

.card-header {
  background-color: #f8f9fc;
  border-bottom: 1px solid #e3e6f0;
}

.border-left-primary {
  border-left: 4px solid #4e73df;
}

.border-left-success {
  border-left: 4px solid #1cc88a;
}

.border-left-info {
  border-left: 4px solid #36b9cc;
}

.border-left-warning {
  border-left: 4px solid #f6c23e;
}

.text-primary {
  color: #4e73df !important;
}

.text-gray-300 {
  color: #dddfeb !important;
}

.text-gray-800 {
  color: #5a5c69 !important;
}

.text-uppercase {
  text-transform: uppercase !important;
}

.font-weight-bold {
  font-weight: 700 !important;
}

.text-xs {
  font-size: 0.7rem;
}

.btn-group button,
.btn-group a {
  padding: 0.25rem 0.5rem;
}

main {
  padding-bottom: 2rem;
}
</style>