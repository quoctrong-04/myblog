<template>
  <div class="blog-post-detail">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="mt-2">Đang tải bài viết...</p>
    </div>

    <!-- Lỗi -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- Nội dung bài viết -->
    <div v-else-if="post" class="post-content">
      <!-- Hình ảnh bài viết -->
      <img
        v-if="post.image"
        :src="post.image"
        :alt="post.title"
        class="img-fluid rounded mb-4 w-100"
        style="max-height: 400px; object-fit: cover;"
      />

      <!-- Tiêu đề và thông tin tác giả -->
        <h1 class="post-title mb-3">{{ post.title }}</h1>
        <div class="post-meta d-flex align-items-center mb-4">
          <img
            :src="post.avatar || 'https://via.placeholder.com/40'"
            :alt="post.username"
            class="rounded-circle me-2"
            width="40"
            height="40"
          />
          <div>
            <div class="fw-bold">{{ post.username || 'Người dùng' }}</div>
            <div class="text-muted small">
              {{ formatDate(post.created_at) }}
            </div>
          </div>
        </div>

      <!-- Nội dung bài viết -->
      <div class="post-body mb-4" v-html="post.content"></div>

      <!-- Thống kê -->
      <div class="d-flex align-items-center text-muted mb-4">
        <div class="me-3">
          <i class="fas fa-eye me-1"></i>
          {{ post.view_count || 0 }} lượt xem
        </div>
        <div class="me-3">
          <button 
            class="btn btn-link text-decoration-none p-0"
            :class="{'text-primary': isLiked, 'text-muted': !isLiked}"
            @click="toggleLike"
            :disabled="likeLoading"
          >
            <i class="fas" :class="isLiked ? 'fa-heart' : 'fa-heart-o'"></i>
            {{ likeCount }} {{ isLiked ? 'Bỏ thích' : 'Thích' }}
          </button>
        </div>
        <div>
          <i class="fas fa-comment me-1"></i>
          {{ post.comment_count || 0 }} bình luận
        </div>
      </div>
    </div>

    <!-- Không tìm thấy bài viết -->
    <div v-else class="alert alert-warning">
      Không tìm thấy bài viết hoặc bài viết đã bị xóa.
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const props = defineProps({
  postId: {
    type: [Number, String],
    required: true
  },
  post: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
});

const store = useStore();
const likeLoading = ref(false);

// Lấy thông tin like từ store
const isLiked = computed(() => store.getters['like/isPostLiked'](props.postId));
const likeCount = computed(() => {
  return props.post?.likes_count || props.post?.like_count || 0;
});

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
};

// Thích/Bỏ thích bài viết
const toggleLike = async () => {
  if (likeLoading.value) return;
  
  // Kiểm tra xác thực
  if (!store.getters['auth/isAuthenticated']) {
    store.dispatch('showErrorToast', 'Vui lòng đăng nhập để thích bài viết', { root: true });
    return;
  }
  
  likeLoading.value = true;
  try {
    const postId = props.postId;
    
    // Gọi API toggle like
    const result = await store.dispatch('like/toggleLike', postId);
    
    // Hiển thị thông báo nếu có lỗi (thành công đã được xử lý trong module)
    if (!result.success) {
      store.dispatch('showErrorToast', result.message, { root: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    store.dispatch('showErrorToast', 'Không thể thực hiện thao tác. Vui lòng thử lại sau.', { root: true });
  } finally {
    likeLoading.value = false;
  }
};
</script>

<style scoped>
.post-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.post-body {
  font-size: 1.1rem;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .post-title {
    font-size: 1.75rem;
  }
  
  .post-body {
    font-size: 1rem;
  }
}
</style> 