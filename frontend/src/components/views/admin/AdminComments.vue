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
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>Quản lý bình luận</h2>
          <button class="btn btn-primary" @click="refreshComments">
            <i class="fas fa-sync-alt me-1"></i> Làm mới
          </button>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <p class="mt-2">Đang tải danh sách bình luận...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-if="comments.length === 0" class="card shadow">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Nội dung</th>
                    <th>Bài viết</th>
                    <th>Người dùng</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="6" class="text-center py-3">Không có bình luận nào</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-else class="card shadow">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Nội dung</th>
                    <th>Bài viết</th>
                    <th>Người dùng</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="comment in comments" :key="comment.comment_id">
                    <td>{{ comment.comment_id }}</td>
                    <td>{{ truncate(comment.content, 50) }}</td>
                    <td>
                      <a href="#" @click.prevent="viewPost(comment.post_id)" class="text-primary">
                        {{ truncate(comment.post_title || 'Bài viết #' + comment.post_id, 30) }}
                      </a>
                    </td>
                    <td>{{ comment.username || 'Không có tên' }}</td>
                    <td>{{ formatDate(comment.created_at) }}</td>
                    <td>
                      <button 
                        class="btn btn-sm btn-danger"
                        @click="deleteComment(comment.comment_id)"
                        :disabled="deletingId === comment.comment_id"
                      >
                        <span v-if="deletingId === comment.comment_id" class="spinner-border spinner-border-sm me-1" role="status"></span>
                        <i v-else class="fas fa-trash-alt me-1"></i>
                        Xóa
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <nav v-if="pagination.totalPages > 1" aria-label="Phân trang" class="mt-4">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Trước</a>
                </li>
                <li 
                  v-for="page in paginationPages" 
                  :key="page" 
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === pagination.totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Sau</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { comments as commentsApi } from '@/services/api';
import { useRouter } from 'vue-router';

export default {
  name: 'AdminComments',
  setup() {
    const store = useStore();
    const router = useRouter();
    const currentPage = ref(1);
    const deletingId = ref(null);
    const debugMode = ref(false);
    const responseError = ref('');
    const adminUrl = ref('');

    const comments = computed(() => store.getters['comment/allComments']);
    const loading = computed(() => store.getters['comment/loadingAll']);
    const error = computed(() => store.getters['comment/errorAll']);
    const pagination = computed(() => store.getters['comment/pagination']);
    const postsInStore = computed(() => store.getters['post/posts']);

    const paginationPages = computed(() => {
      const totalPages = pagination.value.totalPages;
      const current = currentPage.value;
      const pages = [];
      
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (current <= 3) {
          // Hiển thị 1 2 3 4 5
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
        } else if (current >= totalPages - 2) {
          // Hiển thị các trang cuối
          for (let i = totalPages - 4; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          // Hiển thị trang hiện tại và xung quanh
          for (let i = current - 2; i <= current + 2; i++) {
            pages.push(i);
          }
        }
      }
      
      return pages;
    });

    const loadComments = async (page = 1) => {
      currentPage.value = page;
      store.commit('comment/SET_LOADING_ALL', true);
      store.commit('comment/SET_ERROR_ALL', null);
      
      try {
        // Thử tải bình luận từ API trực tiếp
        const response = await commentsApi.getAllComments(page, 20);
        
        if (response?.data) {
          let commentsData = [];
          if (Array.isArray(response.data)) {
            commentsData = response.data;
          } else if (response.data.comments) {
            commentsData = response.data.comments;
          } else if (response.data.data) {
            commentsData = response.data.data;
          }

          // Cập nhật store với dữ liệu bình luận
          store.commit('comment/SET_ALL_COMMENTS', {
            comments: commentsData,
            pagination: {
              currentPage: page,
              totalPages: Math.ceil(commentsData.length / 20),
              totalComments: commentsData.length
            }
          });
        } else {
          // Nếu không có dữ liệu từ API trực tiếp, thử tải từ bài viết
          await loadAllPostComments();
        }
      } catch (err) {
        console.error('Error loading comments:', err);
        store.commit('comment/SET_ERROR_ALL', 'Không thể tải danh sách bình luận. Vui lòng thử lại sau.');
        // Thử phương án dự phòng
        await loadAllPostComments();
      } finally {
        store.commit('comment/SET_LOADING_ALL', false);
      }
    };
    
    const loadAllPostComments = async () => {
      try {
        // Lấy danh sách bài viết nếu chưa có
        if (postsInStore.value.length === 0) {
          await store.dispatch('post/fetchPosts');
        }
        
        const allPosts = store.getters['post/posts'];
        let allComments = [];
        
        // Tải bình luận cho từng bài viết
        const commentPromises = allPosts.map(async (post) => {
          try {
            const response = await commentsApi.getCommentsByPostId(post.post_id);
            if (response?.data) {
              const comments = Array.isArray(response.data) ? response.data : 
                             response.data.comments || 
                             response.data.data || [];
              
              return comments.map(comment => ({
                ...comment,
                comment_id: comment.comment_id || comment.id,
                post_id: post.post_id,
                post_title: post.title,
                user_id: comment.user_id || comment.userId,
                username: comment.username || comment.user?.username || 'Người dùng',
                created_at: comment.created_at || comment.createdAt || new Date().toISOString()
              }));
            }
            return [];
          } catch (err) {
            console.error(`Error loading comments for post ${post.post_id}:`, err);
            return [];
          }
        });

        const commentsArrays = await Promise.all(commentPromises);
        allComments = commentsArrays.flat();

        if (allComments.length > 0) {
          store.commit('comment/SET_ALL_COMMENTS', {
            comments: allComments,
            pagination: {
              currentPage: currentPage.value,
              totalPages: Math.ceil(allComments.length / 20),
              totalComments: allComments.length
            }
          });
          store.commit('comment/SET_ERROR_ALL', null);
        } else {
          store.commit('comment/SET_ERROR_ALL', 'Không tìm thấy bình luận nào.');
        }
      } catch (err) {
        console.error('Error in loadAllPostComments:', err);
        store.commit('comment/SET_ERROR_ALL', 'Không thể tải danh sách bình luận. Vui lòng thử lại sau.');
      }
    };

    const refreshComments = () => {
      loadComments(currentPage.value);
    };

    const changePage = (page) => {
      if (page < 1 || page > pagination.value.totalPages) return;
      loadComments(page);
    };

const deleteComment = async (commentId) => {
      if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;
      
      try {
        deletingId.value = commentId;
        await store.dispatch('comment/deleteComment', commentId);
        // Sau khi xóa, tải lại trang hiện tại
        await loadComments(currentPage.value);
        store.dispatch('showSuccessToast', 'Xóa bình luận thành công!', { root: true });
      } catch (error) {
        console.error('Lỗi khi xóa bình luận:', error);
        store.dispatch('showErrorToast', 'Không thể xóa bình luận', { root: true });
      } finally {
        deletingId.value = null;
      }
    };

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
};

    const truncate = (text, maxLength) => {
  if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
    };

    const viewPost = async (postId) => {
      try {
        // Tăng lượt xem trước khi chuyển hướng
        await store.dispatch('post/incrementViewCount', postId);
        
        // Hiển thị thông báo
        store.dispatch('showSuccessToast', 'Đã tăng lượt xem bài viết!', { root: true });
        
        // Chuyển hướng đến trang chi tiết bài viết
        router.push({ name: 'PostDetail', params: { id: postId }});
      } catch (error) {
        console.error('Error incrementing view count:', error);
        
        // Vẫn chuyển hướng ngay cả khi có lỗi
        router.push({ name: 'PostDetail', params: { id: postId }});
      }
    };

    // Tải comments khi component được mount
    onMounted(() => {
      loadComments();
    });

    return {
      comments,
      loading,
      error,
      pagination,
      currentPage,
      paginationPages,
      deletingId,
      debugMode,
      responseError,
      adminUrl,
      loadComments,
      loadAllPostComments,
      refreshComments,
      changePage,
      deleteComment,
      viewPost,
      formatDate,
      truncate
    };
  }
};
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 80px;
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
  border: none;
}

.table th {
  font-weight: 600;
  color: #2c3e50;
  background-color: #f8f9fc;
  border-bottom: 2px solid #e3e6f0;
}

.table td {
  vertical-align: middle;
  color: #5a5c69;
}

.btn-primary {
  background-color: #4e73df;
  border-color: #4e73df;
}

.btn-primary:hover {
  background-color: #2e59d9;
  border-color: #2653d4;
}

.btn-danger {
  padding: 0.25rem 0.5rem;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  color: #4e73df;
  padding: 0.5rem 0.75rem;
}

.page-item.active .page-link {
  background-color: #4e73df;
  border-color: #4e73df;
}

.card-body {
  padding: 1.5rem;
}

.table-responsive {
  margin: 0;
}

@media (max-width: 768px) {
  .sidebar {
    position: static;
    height: auto;
  }
}
</style>