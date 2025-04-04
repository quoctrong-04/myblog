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
            <li class="nav-item mt-3">
              <router-link class="nav-link text-danger" :to="{ name: 'AdminDashboard' }">
                <i class="fas fa-home me-2"></i>
                Quay lại Dashboard
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- Main content -->
      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
          <h1 class="h2">Quản lý bài viết</h1>
          <div class="btn-toolbar mb-2 mb-md-0">
            <router-link :to="{ name: 'AdminCreatePost' }" class="btn btn-sm btn-primary me-2">
              <i class="fas fa-plus me-1"></i> Đăng bài mới
            </router-link>
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="refreshData">
              <i class="fas fa-sync me-1"></i> Làm mới
            </button>
          </div>
        </div>

        <!-- Search and filter -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-4 mb-3">
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Tìm kiếm bài viết..." 
                    v-model="searchQuery"
                    @input="handleSearch"
                  >
                  <button class="btn btn-outline-secondary" type="button" @click="handleSearch">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <select class="form-select" v-model="sortBy" @change="handleSortChange">
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="mostViewed">Xem nhiều nhất</option>
                  <option value="mostLiked">Thích nhiều nhất</option>
                  <option value="mostCommented">Bình luận nhiều nhất</option>
                </select>
              </div>
              <div class="col-md-3 mb-3">
                <select class="form-select" v-model="filterBy" @change="handleFilterChange">
                  <option value="all">Tất cả bài viết</option>
                  <option value="published">Đã xuất bản</option>
                  <option value="draft">Bản nháp</option>
                </select>
              </div>
              <div class="col-md-2 mb-3">
                <div class="d-grid">
                  <button class="btn btn-secondary" @click="resetFilters">
                    <i class="fas fa-undo me-1"></i> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Posts list -->
        <div class="card shadow mb-4">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Danh sách bài viết ({{ filteredPosts.length }} bài)</h6>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
              </div>
            </div>
            <div v-else-if="error" class="alert alert-danger">
              {{ error }}
            </div>
            <div v-else-if="posts.length === 0" class="text-center py-3">
              <p class="text-muted">Không có bài viết nào.</p>
            </div>
            <div v-else>
              <div class="table-responsive">
                <table class="table table-bordered table-hover">
                  <thead class="table-light">
                    <tr>
                      <th scope="col" style="width: 60px">ID</th>
                      <th scope="col">Hình ảnh</th>
                      <th scope="col">Tiêu đề</th>
                      <th scope="col">Nội dung</th>
                      <th scope="col" style="width: 100px">Tác giả</th>
                      <th scope="col" style="width: 100px">Trạng thái</th>
                      <th scope="col" style="width: 120px">Lượt xem</th>
                      <th scope="col" style="width: 120px">Lượt thích</th>
                      <th scope="col" style="width: 120px">Bình luận</th>
                      <th scope="col" style="width: 150px">Ngày tạo</th>
                      <th scope="col" style="width: 150px">Cập nhật</th>
                      <th scope="col" style="width: 150px">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="post in paginatedPosts" :key="post.post_id">
                      <td>{{ post.post_id }}</td>
                      <td style="width: 80px">
                        <img v-if="post.image" :src="getImageUrl(post.image)" class="img-thumbnail" width="70" height="70" alt="Thumbnail">
                        <div v-else class="no-image-placeholder">
                          <i class="fas fa-image text-muted"></i>
                        </div>
                      </td>
                      <td>
                        <div class="text-primary fw-bold">{{ post.title }}</div>
                      </td>
                      <td>
                        <div class="small text-truncate" style="max-width: 200px;">
                          {{ truncateText(post.content, 50) }}
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-info text-dark">{{ post.user_id }}</span>
                      </td>
                      <td>
                        <span :class="getStatusBadgeClass(post.status)">
                          {{ post.status }}
                        </span>
                      </td>
                      <td>{{ post.view_count || 0 }}</td>
                      <td>{{ post.like_count || 0 }}</td>
                      <td>{{ post.comment_count || 0 }}</td>
                      <td>{{ formatDate(post.created_at) }}</td>
                      <td>{{ formatDate(post.updated_at) }}</td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-primary" @click="editPost(post)">
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn btn-success" @click="togglePostStatus(post)">
                            <i class="fas" :class="post.status === 'published' ? 'fa-eye-slash' : 'fa-eye'"></i>
                          </button>
                          <button class="btn btn-danger" @click="confirmDelete(post)">
                            <i class="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
              <nav aria-label="Page navigation">
                <ul class="pagination">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="changePage(currentPage - 1)" aria-label="Previous">
                      <span aria-hidden="true">&laquo;</span>
                    </button>
                  </li>
                  <li v-for="page in paginationRange" :key="page" class="page-item" :class="{ active: page === currentPage }">
                    <button class="page-link" @click="changePage(page)">{{ page }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="changePage(currentPage + 1)" aria-label="Next">
                      <span aria-hidden="true">&raquo;</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useStore();
const loading = ref(false);
const posts = ref([]);
const searchQuery = ref('');
const sortBy = ref('newest');
const filterBy = ref('all');
const currentPage = ref(1);
const pageSize = 10;
const error = ref(null);

// Lấy dữ liệu khi component được mount
onMounted(async () => {
  await refreshData();
});

// Làm mới dữ liệu
const refreshData = async () => {
  loading.value = true;
  error.value = null;
  try {
    await store.dispatch('post/fetchPosts', { refresh: true });
    posts.value = store.getters['post/posts'];
    handleSearch(); // Áp dụng tìm kiếm lại nếu có
    
    // Cập nhật số lượng bình luận cho mỗi bài viết
    for (const post of posts.value) {
      try {
        const commentsResponse = await store.dispatch('comment/fetchComments', post.post_id);
        store.dispatch('post/updatePostCommentCount', {
          postId: post.post_id,
          count: commentsResponse?.length || 0
        });
      } catch (err) {
        console.error(`Error fetching comments count for post ${post.post_id}:`, err);
      }
    }
    
    store.dispatch('showSuccessToast', 'Đã làm mới dữ liệu bài viết!');
  } catch (error) {
    console.error('Error refreshing data:', error);
    error.value = 'Không thể tải dữ liệu bài viết. Vui lòng thử lại sau.';
    store.dispatch('showErrorToast', error.value);
  } finally {
    loading.value = false;
  }
};

// Chức năng tìm kiếm
const handleSearch = () => {
  currentPage.value = 1; // Reset về trang 1 khi tìm kiếm
};

// Thay đổi sắp xếp
const handleSortChange = () => {
  currentPage.value = 1; // Reset về trang 1 khi thay đổi sắp xếp
};

// Thay đổi bộ lọc
const handleFilterChange = () => {
  currentPage.value = 1; // Reset về trang 1 khi thay đổi bộ lọc
};

// Reset tất cả bộ lọc
const resetFilters = () => {
  searchQuery.value = '';
  sortBy.value = 'newest';
  filterBy.value = 'all';
  currentPage.value = 1;
};

// Lọc bài viết theo tìm kiếm và bộ lọc
const filteredPosts = computed(() => {
  let result = [...posts.value];
  
  // Tìm kiếm
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(post => 
      post.title.toLowerCase().includes(query) || 
      post.content.toLowerCase().includes(query)
    );
  }
  
  // Lọc theo trạng thái
  if (filterBy.value !== 'all') {
    result = result.filter(post => post.status === filterBy.value);
  }
  
  // Sắp xếp
  if (sortBy.value === 'title') {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy.value === 'created') {
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy.value === 'updated') {
    result.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  } else if (sortBy.value === 'likes') {
    result.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
  } else if (sortBy.value === 'comments') {
    result.sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0));
  } else if (sortBy.value === 'views') {
    result.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
  }
  
  return result;
});

// Phân trang
const totalPages = computed(() => Math.ceil(filteredPosts.value.length / pageSize));

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredPosts.value.slice(start, end);
});

// Tạo dãy số trang để hiển thị (tối đa 5 trang)
const paginationRange = computed(() => {
  const totalPagesToShow = Math.min(5, totalPages.value);
  let startPage = Math.max(1, currentPage.value - Math.floor(totalPagesToShow / 2));
  const endPage = Math.min(totalPages.value, startPage + totalPagesToShow - 1);
  
  // Điều chỉnh lại startPage nếu không đủ số trang ở cuối
  startPage = Math.max(1, endPage - totalPagesToShow + 1);
  
  const range = [];
  for (let i = startPage; i <= endPage; i++) {
    range.push(i);
  }
  return range;
});

// Đổi trang
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
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
    // Cập nhật lại danh sách sau khi xóa
    posts.value = posts.value.filter(post => post.post_id !== postId);
    
    // Kiểm tra nếu trang hiện tại không còn bài viết nào và không phải trang đầu tiên
    if (paginatedPosts.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    store.dispatch('showErrorToast', 'Không thể xóa bài viết. Vui lòng thử lại sau.', { root: true });
  }
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
};

// Cắt ngắn text
const truncateText = (text, maxLength) => {
  if (!text) return '';
  
  // Loại bỏ HTML tags
  const plainText = text.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
};

// Theo dõi thay đổi searchQuery để áp dụng tìm kiếm với debounce
watch(searchQuery, () => {
  // Trong thực tế, bạn có thể thêm debounce function ở đây
  handleSearch();
});

// Lấy class cho badge trạng thái
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'published':
      return 'badge bg-success';
    case 'draft':
      return 'badge bg-warning text-dark';
    case 'deleted':
      return 'badge bg-danger';
    default:
      return 'badge bg-secondary';
  }
};

// Chuyển đổi trạng thái bài viết
const togglePostStatus = async (post) => {
  try {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    await store.dispatch('post/updatePostStatus', { 
      postId: post.post_id, 
      status: newStatus 
    });
    
    // Cập nhật lại danh sách
    refreshData();
    
    store.dispatch('showSuccessToast', `Đã chuyển trạng thái bài viết thành ${newStatus}`, { root: true });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error);
    store.dispatch('showErrorToast', 'Không thể cập nhật trạng thái bài viết', { root: true });
  }
};

// Chỉnh sửa bài viết
const editPost = (post) => {
  router.push({ 
    name: 'AdminEditPost', 
    params: { id: post.post_id } 
  });
};

// Helper function to build correct image URL
const getImageUrl = (imagePath) => {
  // Nếu path null/undefined, trả về ảnh placeholder
  if (!imagePath) {
    return 'https://via.placeholder.com/70x70?text=No+Image';
  }
  
  // Check if the image path is a full URL or base64 data
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Xử lý đường dẫn uploads
  if (imagePath.includes('uploads')) {
    // Đây là hình ảnh được lưu trong server
    try {
      // Sửa URL trực tiếp đến file hình ảnh
      const fileName = imagePath.split('/').pop();
      return `http://localhost:3003/uploads/${fileName}`;
    } catch (e) {
      console.error('Error parsing image path:', imagePath, e);
      return 'https://via.placeholder.com/70x70?text=Error+Loading+Image';
    }
  }
  
  // Trường hợp khác
  return 'https://via.placeholder.com/70x70?text=No+Image';
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 60px;
  bottom: 0;
  left: 0;
  z-index: 100;
  padding: 20px 0;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1);
  background-color: #f8f9fa;
  width: 16.66667%;
}

.nav-link {
  color: #333;
  border-radius: 5px;
  margin: 3px 10px;
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

main {
  margin-left: 16.66667%;
  padding-top: 80px;
  padding-bottom: 2rem;
  min-height: 100vh;
}

@media (max-width: 767.98px) {
  .sidebar {
    position: static;
    width: 100%;
    padding-top: 0;
    box-shadow: none;
  }
  
  main {
    margin-left: 0;
    padding-top: 20px;
  }
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

.btn-group button,
.btn-group a {
  padding: 0.25rem 0.5rem;
}

.table thead th {
  vertical-align: middle;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  padding: 0.375rem 0.75rem;
}

.text-primary {
  color: #4e73df !important;
}

.font-weight-bold {
  font-weight: 700 !important;
}

.img-thumbnail {
  object-fit: cover;
  height: 70px;
  width: 70px;
}

.no-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70px;
  width: 70px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
}

/* Style for badges */
.badge {
  padding: 0.5em 0.8em;
  font-weight: 500;
}

.badge-published {
  background-color: #28a745;
  color: white;
}

.badge-draft {
  background-color: #6c757d;
  color: white;
}

/* Pagination styles */
.pagination {
  margin-bottom: 0;
}

.page-link {
  color: #4e73df;
}

.page-item.active .page-link {
  background-color: #4e73df;
  border-color: #4e73df;
}
</style>