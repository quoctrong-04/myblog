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
          <h1 class="h2">Quản lý lượt thích</h1>
          <div class="btn-toolbar mb-2 mb-md-0">
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="refreshData">
              <i class="fas fa-sync me-1"></i> Làm mới
            </button>
          </div>
        </div>

        <!-- Search and filter -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-5 mb-3">
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Tìm kiếm theo ID người dùng hoặc bài viết..." 
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
                  <option value="user">Người dùng</option>
                  <option value="post">Bài viết</option>
                </select>
              </div>
              <div class="col-md-2 mb-3">
                <div class="d-grid">
                  <button class="btn btn-secondary" @click="resetFilters">
                    <i class="fas fa-undo me-1"></i> Reset
                  </button>
                </div>
              </div>
              <div class="col-md-2 mb-3">
                <div class="d-grid">
                  <button class="btn btn-danger" @click="confirmDeleteMultiple" :disabled="selectedLikes.length === 0">
                    <i class="fas fa-trash-alt me-1"></i> Xóa đã chọn ({{ selectedLikes.length }})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Likes list -->
        <div class="card shadow mb-4">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Danh sách lượt thích ({{ filteredLikes.length }} lượt thích)</h6>
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
            <div v-else-if="likes.length === 0" class="text-center py-3">
              <p class="text-muted">Không có lượt thích nào.</p>
            </div>
            <div v-else>
              <div class="table-responsive">
                <table class="table table-bordered table-hover">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 50px">
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" id="selectAll">
                          <label class="form-check-label" for="selectAll"></label>
                        </div>
                      </th>
                      <th scope="col" style="width: 60px">ID</th>
                      <th scope="col" style="width: 100px">Người dùng</th>
                      <th scope="col" style="width: 100px">Bài viết</th>
                      <th scope="col" style="width: 150px">Ngày tạo</th>
                      <th scope="col" style="width: 150px">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="like in paginatedLikes" :key="like.user_id + '-' + like.post_id">
                      <td>
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" :value="like.id" 
                                v-model="selectedLikes" :id="`like-${like.id}`">
                          <label class="form-check-label" :for="`like-${like.id}`"></label>
                        </div>
                      </td>
                      <td>{{ like.id || (like.user_id + '-' + like.post_id) }}</td>
                      <td>
                        <div>
                          <span class="badge bg-secondary">{{ like.user_id }}</span>
                          <div v-if="like.username" class="small mt-1">{{ like.username }}</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span class="badge bg-info text-dark">{{ like.post_id }}</span>
                          <div v-if="like.post_title" class="small mt-1 text-truncate" style="max-width: 150px;">
                            {{ like.post_title }}
                          </div>
                        </div>
                      </td>
                      <td>{{ formatDate(like.created_at) }}</td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-primary" @click="viewPost(like.post_id)" title="Xem bài viết">
                            <i class="fas fa-eye"></i>
                          </button>
                          <button class="btn btn-info" @click="viewUser(like.user_id)" title="Xem người dùng">
                            <i class="fas fa-user"></i>
                          </button>
                          <button class="btn btn-danger" @click="confirmDeleteSingle(like)" title="Xóa lượt thích">
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
const error = ref(null);
const likes = ref([]);
const searchQuery = ref('');
const sortBy = ref('newest');
const currentPage = ref(1);
const pageSize = 15; 
const selectedLikes = ref([]);

// Lấy dữ liệu khi component được mount
onMounted(async () => {
  await refreshData();
});

// Làm mới dữ liệu
const refreshData = async () => {
  loading.value = true;
  error.value = null;
  selectedLikes.value = [];
  
  try {
    const response = await store.dispatch('like/fetchAllLikes', { page: 1, limit: 100 });
    
    // Xử lý dữ liệu từ API
    if (Array.isArray(response)) {
      // Chuẩn hóa dữ liệu
      likes.value = response.map(like => ({
        id: like.id || `${like.user_id}-${like.post_id}`,
        user_id: like.user_id,
        post_id: like.post_id,
        created_at: like.created_at || new Date().toISOString(),
        username: like.username || like.user?.username || 'Người dùng',
        post_title: like.post_title || like.post?.title || `Bài viết #${like.post_id}`
      }));
    } else {
      likes.value = [];
    }
    
    store.dispatch('showSuccessToast', 'Đã làm mới danh sách lượt thích!');
  } catch (err) {
    console.error('Error fetching likes:', err);
    error.value = 'Không thể tải danh sách lượt thích. Vui lòng thử lại sau.';
    store.dispatch('showErrorToast', error.value);
  } finally {
    loading.value = false;
  }
};

// Chức năng tìm kiếm
const handleSearch = () => {
  currentPage.value = 1; 
};

// Thay đổi sắp xếp
const handleSortChange = () => {
  currentPage.value = 1; 
};

// Reset tất cả bộ lọc
const resetFilters = () => {
  searchQuery.value = '';
  sortBy.value = 'newest';
  currentPage.value = 1;
};

// Lọc lượt thích theo tìm kiếm và bộ lọc
const filteredLikes = computed(() => {
  let result = [...likes.value];
  
  // Tìm kiếm theo ID
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(like => 
      (like.user_id && String(like.user_id).includes(query)) || 
      (like.post_id && String(like.post_id).includes(query)) ||
      (like.username && like.username.toLowerCase().includes(query)) ||
      (like.post_title && like.post_title.toLowerCase().includes(query))
    );
  }
  
  // Sắp xếp
  if (sortBy.value === 'newest') {
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy.value === 'oldest') {
    result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  } else if (sortBy.value === 'user') {
    result.sort((a, b) => String(a.user_id).localeCompare(String(b.user_id)));
  } else if (sortBy.value === 'post') {
    result.sort((a, b) => String(a.post_id).localeCompare(String(b.post_id)));
  }
  
  return result;
});

// Phân trang
const totalPages = computed(() => Math.ceil(filteredLikes.value.length / pageSize));

const paginatedLikes = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredLikes.value.slice(start, end);
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

// Xử lý chọn tất cả
const isAllSelected = computed(() => {
  return paginatedLikes.value.length > 0 && 
         paginatedLikes.value.every(like => 
           selectedLikes.value.includes(like.id)
         );
});

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    // Thêm tất cả lượt thích trên trang hiện tại vào selectedLikes
    paginatedLikes.value.forEach(like => {
      if (!selectedLikes.value.includes(like.id)) {
        selectedLikes.value.push(like.id);
      }
    });
  } else {
    // Loại bỏ tất cả lượt thích trên trang hiện tại khỏi selectedLikes
    selectedLikes.value = selectedLikes.value.filter(id => 
      !paginatedLikes.value.some(like => like.id === id)
    );
  }
};

// Xác nhận xóa một lượt thích
const confirmDeleteSingle = (like) => {
  // Hiển thị thông tin chi tiết hơn trong xác nhận
  let confirmMessage = `Bạn có chắc chắn muốn xóa lượt thích này?`;
  
  if (like.username && like.post_title) {
    confirmMessage = `Bạn có chắc chắn muốn xóa lượt thích của ${like.username} cho bài viết "${like.post_title}"?`;
  } else if (like.username) {
    confirmMessage = `Bạn có chắc chắn muốn xóa lượt thích của ${like.username} cho bài viết ID ${like.post_id}?`;
  } else if (like.post_title) {
    confirmMessage = `Bạn có chắc chắn muốn xóa lượt thích của người dùng ID ${like.user_id} cho bài viết "${like.post_title}"?`;
  } else {
    confirmMessage = `Bạn có chắc chắn muốn xóa lượt thích của người dùng ID ${like.user_id} cho bài viết ID ${like.post_id}?`;
  }
  
  if (confirm(confirmMessage)) {
    deleteLike(like.id || `${like.user_id}-${like.post_id}`);
  }
};

// Xác nhận xóa nhiều lượt thích
const confirmDeleteMultiple = () => {
  if (selectedLikes.value.length === 0) return;
  
  if (confirm(`Bạn có chắc chắn muốn xóa ${selectedLikes.value.length} lượt thích đã chọn?`)) {
    deleteMultipleLikes();
  }
};

// Xóa một lượt thích
const deleteLike = async (likeId) => {
  try {
    loading.value = true;
    
    // Phân tích ID để lấy user_id và post_id
    let userId, postId;
    
    if (typeof likeId === 'string' && likeId.includes('-')) {
      [userId, postId] = likeId.split('-').map(Number);
    } else {
      // Tìm like trong danh sách
      const like = likes.value.find(l => l.id === likeId);
      if (like) {
        userId = like.user_id;
        postId = like.post_id;
      }
    }
    
    if (userId && postId) {
      await store.dispatch('like/deleteLike', { userId, postId });
      
      // Cập nhật danh sách likes
      likes.value = likes.value.filter(like => 
        !(like.user_id == userId && like.post_id == postId)
      );
      
      // Xóa khỏi danh sách đã chọn
      selectedLikes.value = selectedLikes.value.filter(id => id !== likeId);
      
      store.dispatch('showSuccessToast', 'Đã xóa lượt thích thành công');
    } else {
      throw new Error('Không thể xác định thông tin lượt thích');
    }
  } catch (error) {
    console.error('Error deleting like:', error);
    store.dispatch('showErrorToast', 'Không thể xóa lượt thích. Vui lòng thử lại sau.');
  } finally {
    loading.value = false;
  }
};

// Xóa nhiều lượt thích
const deleteMultipleLikes = async () => {
  if (selectedLikes.value.length === 0) return;
  
  loading.value = true;
  try {
    // Xóa từng lượt thích
    const promises = selectedLikes.value.map(async (likeId) => {
      // Phân tích ID để lấy user_id và post_id
      let userId, postId;
      
      if (typeof likeId === 'string' && likeId.includes('-')) {
        [userId, postId] = likeId.split('-').map(Number);
      } else {
        // Tìm like trong danh sách
        const like = likes.value.find(l => l.id === likeId);
        if (like) {
          userId = like.user_id;
          postId = like.post_id;
        }
      }
      
      if (userId && postId) {
        return store.dispatch('like/deleteLike', { userId, postId }).catch(err => {
          console.error(`Error deleting like ${likeId}:`, err);
        });
      }
    });
    
    await Promise.allSettled(promises);
    
    // Cập nhật danh sách
    const deletedIds = selectedLikes.value;
    likes.value = likes.value.filter(like => {
      const likeId = like.id || `${like.user_id}-${like.post_id}`;
      return !deletedIds.includes(likeId);
    });
    
    // Thông báo thành công
    store.dispatch('showSuccessToast', `Đã xóa ${selectedLikes.value.length} lượt thích thành công!`);
    
    // Xóa danh sách đã chọn
    selectedLikes.value = [];
    
    // Kiểm tra nếu trang hiện tại không còn lượt thích nào và không phải trang đầu tiên
    if (paginatedLikes.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  } catch (error) {
    console.error('Error deleting multiple likes:', error);
    store.dispatch('showErrorToast', 'Đã xảy ra lỗi khi xóa lượt thích. Vui lòng thử lại sau.');
  } finally {
    loading.value = false;
  }
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
};

// Xem bài viết
const viewPost = (postId) => {
  if (!postId) return;
  
  try {
    router.push({ 
      name: 'PostDetail', 
      params: { id: postId } 
    });
  } catch (err) {
    console.error('Error navigating to post:', err);
    // Fallback nếu route không tồn tại
    window.open(`/blog/${postId}`, '_blank');
  }
};

// Xem thông tin người dùng
const viewUser = (userId) => {
  if (!userId) return;
  
  try {
    // Kiểm tra xem route UserProfile có tồn tại không
    if (router.hasRoute('UserProfile')) {
      router.push({ name: 'UserProfile', params: { id: userId } });
    } else if (router.hasRoute('AdminUserProfile')) {
      router.push({ name: 'AdminUserProfile', params: { id: userId } });
    } else {
      // Fallback
      store.dispatch('showInfoToast', 'Chức năng xem chi tiết người dùng chưa được cài đặt');
    }
  } catch (err) {
    console.error('Error navigating to user profile:', err);
    store.dispatch('showErrorToast', 'Không thể xem thông tin người dùng.');
  }
};

// Theo dõi thay đổi searchQuery để áp dụng tìm kiếm với debounce
watch(searchQuery, () => {
  handleSearch();
});
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

.btn-group button,
.btn-group a {
  padding: 0.25rem 0.5rem;
}

main {
  padding-bottom: 2rem;
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
</style>