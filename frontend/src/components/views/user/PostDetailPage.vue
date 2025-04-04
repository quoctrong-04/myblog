<template>
  <div class="post-detail">
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    <div v-else-if="post">
      <article>
        <!-- Featured Image -->
        <div v-if="post.image" class="featured-image-container mb-4">
          <img :src="getImageUrl(post.image)" class="img-fluid featured-image" :alt="post.title">
        </div>

        <header class="mb-4">
          <h1 class="fw-bolder mb-3">{{ post.title }}</h1>
          <div class="post-meta mb-4">
            <div class="author-info d-flex align-items-center mb-3">
              <img class="rounded-circle me-2" :src="post.avatar || 'https://via.placeholder.com/40'" alt="Author avatar" width="40" height="40">
              <div>
                <div class="author-name">{{ post.username || 'Người dùng' }}</div>
                <div class="text-muted small">{{ formatDate(post.created_at) }}</div>
              </div>
            </div>
            <div class="post-actions d-flex flex-wrap">
              <span class="post-stat me-3"> 
                <i class="fas fa-eye me-1"></i> {{ post.view_count || 0 }} lượt xem
              </span>
              <span class="post-stat me-3"> 
                <i class="fas fa-comment me-1"></i> {{ post.comment_count || 0 }} bình luận
              </span>
              <button
                class="btn btn-sm me-1"
                :class="isPostLiked ? 'btn-danger' : 'btn-outline-danger'"
                @click="toggleLike"
                :disabled="!isAuthenticated || likeInProgress"
              >
                <i class="fas fa-heart me-1"></i> {{ post.likes_count || post.like_count || 0 }}
                <span v-if="!isAuthenticated" class="ms-1">(Đăng nhập để thích)</span>
                <span v-if="isAuthenticated && !isPostLiked" class="ms-1">Thích</span>
                <span v-if="isAuthenticated && isPostLiked" class="ms-1">Bỏ thích</span>
                <span v-if="likeInProgress" class="spinner-border spinner-border-sm ms-1" role="status" aria-hidden="true"></span>
              </button>
            </div>
          </div>
        </header>
        <section class="post-content mb-5" v-html="post.content"></section>
      </article>

      <hr class="my-5" />

      <CommentSection v-if="post.post_id" :post-id="post.post_id" />
    </div>
    <div v-else>
      <p class="text-muted">Không tìm thấy bài viết.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import CommentSection from '@/components/blog/CommentSection.vue';

// eslint-disable-next-line no-undef
const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  }
});

const store = useStore();
const route = useRoute();
const likeInProgress = ref(false);

const post = computed(() => store.getters['post/currentPost']);
const loading = computed(() => store.getters['post/loading']);
const error = computed(() => store.getters['post/error']);
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
const isPostLiked = computed(() => {
  if (!post.value) return false;
  return post.value.liked_by_user || 
         store.getters['post/isPostLiked'](post.value.post_id);
});

const fetchData = async (id) => {
  if (!id) return;
  
  try {
    await store.dispatch('post/fetchPost', id);
    
    // Tăng lượt xem sau khi bài viết đã được hiển thị
    if (post.value) {
      try {
        // Tăng lượt xem sau một khoảng thời gian ngắn để tránh tăng lượt xem khi người dùng chỉ nhanh chóng nhấp qua
        setTimeout(async () => {
          await store.dispatch('post/incrementViewCount', id);
        }, 2000);
      } catch (viewError) {
        console.error('Error incrementing view count:', viewError);
      }
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    // Xử lý lỗi mạng
    if (error.message && (error.message.includes('network error') || error.message.includes('ERR_NAME_NOT_RESOLVED'))) {
      store.dispatch('showInfoToast', 'Đang sử dụng dữ liệu ngoại tuyến', { root: true });
    }
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
};

// Helper function to build correct image URL
const getImageUrl = (imagePath) => {
  // Nếu path null/undefined, trả về ảnh placeholder
  if (!imagePath) {
    return 'https://via.placeholder.com/800x400?text=No+Image';
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
      return 'https://via.placeholder.com/800x400?text=Error+Loading+Image';
    }
  }
  
  // Trường hợp khác
  return 'https://via.placeholder.com/800x400?text=No+Image';
};

const toggleLike = async () => {
  if (!isAuthenticated.value || !post.value) {
    store.dispatch('showErrorToast', 'Vui lòng đăng nhập để thích bài viết', { root: true });
    return;
  }

  // Ngăn chặn nhiều yêu cầu like liên tiếp
  if (likeInProgress.value) return;
  likeInProgress.value = true;

  try {
    // Lưu trạng thái hiện tại để có thể hoàn tác nếu API thất bại
    const currentLikeStatus = isPostLiked.value;
    const currentLikeCount = post.value.likes_count || post.value.like_count || 0;
    const postId = post.value.post_id;
    
    // Cập nhật UI ngay lập tức (optimistic update)
    store.commit('post/UPDATE_POST_LIKES', {
      postId,
      likeCount: currentLikeStatus ? Math.max(0, currentLikeCount - 1) : currentLikeCount + 1,
      isLiked: !currentLikeStatus
    });
    
    // Gọi API sử dụng module like
    const result = await store.dispatch('like/toggleLike', postId);
    
    if (!result.success) {
      // Hoàn tác nếu API thất bại
      store.commit('post/UPDATE_POST_LIKES', {
        postId,
        likeCount: currentLikeCount,
        isLiked: currentLikeStatus
      });
      store.dispatch('showErrorToast', 'Không thể thích/bỏ thích bài viết. Vui lòng thử lại sau.', { root: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    store.dispatch('showErrorToast', 'Đã xảy ra lỗi. Vui lòng thử lại sau.', { root: true });
  } finally {
    likeInProgress.value = false;
  }
};

onMounted(async () => {
  await fetchData(props.id);
});

watch(() => props.id, async (newId) => {
  await fetchData(newId);
});

// Xử lý trường hợp route thay đổi nhưng props không thay đổi
watch(() => route.params.id, async (newId) => {
  if (newId && newId !== props.id) {
    await fetchData(newId);
  }
});
</script>

<style scoped>
.post-detail {
  max-width: 900px;
  margin: 0 auto;
}

.featured-image-container {
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  position: relative;
  max-height: 500px;
}

.featured-image {
  width: 100%;
  object-fit: cover;
  display: block;
}

.post-meta {
  border-bottom: 1px solid rgba(0,0,0,0.1);
  padding-bottom: 1rem;
}

.author-name {
  font-weight: 600;
  color: #333;
}

.post-actions {
  margin-top: 0.5rem;
}

.post-stat {
  color: #6c757d;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.post-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
}

.post-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.post-content :deep(h2) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
  font-size: 1.8rem;
  color: #222;
}

.post-content :deep(h3) {
  margin-top: 1.8rem;
  margin-bottom: 0.8rem;
  font-weight: 600;
  font-size: 1.5rem;
  color: #333;
}

.post-content :deep(p) {
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

.post-content :deep(ul), .post-content :deep(ol) {
  margin-bottom: 1.5rem;
  padding-left: 2rem;
}

.post-content :deep(li) {
  margin-bottom: 0.5rem;
}

.post-content :deep(blockquote) {
  border-left: 4px solid #3498db;
  padding-left: 1rem;
  margin-left: 0;
  color: #555;
  font-style: italic;
  margin: 1.5rem 0;
}

.post-content :deep(a) {
  color: #3498db;
  text-decoration: none;
  border-bottom: 1px dotted #3498db;
  transition: all 0.2s;
}

.post-content :deep(a:hover) {
  color: #2980b9;
  border-bottom: 1px solid #2980b9;
}
</style>