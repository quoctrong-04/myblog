<template>
    <div v-if="post" class="card h-100 shadow-sm hover-effect">
        <router-link :to="{ name: 'PostDetail', params: { id: post.post_id } }">
            <div class="card-img-container" @click="navigateToPost()">
                <img v-if="post.image" :src="getImageUrl(post.image)" class="card-img-top" :alt="post.title">
                <div v-else class="card-img-top placeholder-image">
                    <i class="fas fa-image fa-3x text-light"></i>
                </div>
            </div>
        </router-link>
        <div class="card-body d-flex flex-column">
            <h5 class="card-title">
                <router-link :to="{ name: 'PostDetail', params: { id: post.post_id } }" class="text-decoration-none text-primary" @click="navigateToPost()">
                    {{ post.title }}
                </router-link>
            </h5>
            <p class="card-text text-muted flex-grow-1">{{ generateExcerpt(post.content) }}</p>
            <div class="card-meta">
                <div class="d-flex align-items-center">
                    <img :src="post.avatar || 'https://via.placeholder.com/30?text=User'" class="rounded-circle me-2" width="30" height="30" :alt="post.username || 'User'">
                    <span class="small text-muted">{{ post.username || 'Người dùng' }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <div class="post-stats">
                        <span class="me-2"><i class="fas fa-eye me-1"></i> {{ displayViewCount }}</span>
                        <button 
                          @click.stop.prevent="toggleLike" 
                          class="btn btn-sm p-0 me-2"
                          :class="{'text-danger': isPostLiked, 'text-secondary': !isPostLiked}"
                          :disabled="!isAuthenticated || likeInProgress"
                        >
                          <i class="fas fa-heart me-1"></i>
                          <span>{{ post.like_count || 0 }}</span>
                          <span class="ms-1">{{ isPostLiked ? 'Bỏ thích' : 'Thích' }}</span>
                          <span v-if="likeInProgress" class="spinner-border spinner-border-sm ms-1" role="status" aria-hidden="true"></span>
                        </button>
                        <span><i class="fas fa-comment me-1 text-primary"></i> {{ post.comment_count || 0 }}</span>
                    </div>
                    <small class="text-muted">{{ formatDate(post.created_at) }}</small>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="card h-100 shadow-sm">
        <div class="card-img-container">
            <div class="card-img-top placeholder-image">
                <i class="fas fa-image fa-3x text-light"></i>
            </div>
        </div>
        <div class="card-body d-flex flex-column">
            <h5 class="card-title placeholder-glow">
                <span class="placeholder col-6"></span>
            </h5>
            <p class="card-text placeholder-glow">
                <span class="placeholder col-7"></span>
                <span class="placeholder col-4"></span>
                <span class="placeholder col-4"></span>
                <span class="placeholder col-6"></span>
            </p>
        </div>
    </div>
</template>

<script setup>
/* eslint-disable no-undef */
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// Định nghĩa props
// eslint-disable-next-line no-undef, no-unused-vars
const props = defineProps({
  post: {
    type: Object,
    default: () => null
  }
});

const store = useStore();
const router = useRouter();
const likeInProgress = ref(false);
const localViewCount = ref(0); // Biến cục bộ để lưu trữ lượt xem

// Khởi tạo giá trị ban đầu cho localViewCount
if (props.post) {
  localViewCount.value = props.post.view_count || 0;
}

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
const isPostLiked = computed(() => {
  if (!props.post) return false;
  // Ưu tiên sử dụng trạng thái liked_by_user từ server
  if (typeof props.post.liked_by_user !== 'undefined') {
    return props.post.liked_by_user;
  }
  // Fallback về trạng thái local nếu không có từ server
  return store.getters['like/isPostLikedByUser'](props.post.post_id);
});

// Lấy lượt xem hiển thị (ưu tiên từ props bài viết)
const displayViewCount = computed(() => {
  // Ưu tiên hiển thị từ prop post
  if (props.post && typeof props.post.view_count !== 'undefined') {
    return props.post.view_count;
  }
  // Fallback về biến cục bộ
  return localViewCount.value;
});

// Toggle like
const toggleLike = async () => {
  if (!isAuthenticated.value || !props.post) {
    store.dispatch('showErrorToast', 'Vui lòng đăng nhập để thích bài viết', { root: true });
    return;
  }

  // Ngăn chặn nhiều yêu cầu like liên tiếp
  if (likeInProgress.value) return;
  likeInProgress.value = true;

  try {
    const postId = props.post.post_id || props.post.id;
    
    // Gọi API toggle like và cập nhật UI dựa trên kết quả API
    const result = await store.dispatch('like/toggleLike', postId);
    
    // Hiển thị thông báo nếu có lỗi (thông báo thành công đã được xử lý trong like module)
    if (!result.success) {
      store.dispatch('showErrorToast', result.message, { root: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    store.dispatch('showErrorToast', 'Đã xảy ra lỗi khi thích/bỏ thích bài viết', { root: true });
  } finally {
    likeInProgress.value = false;
  }
};

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN'); // Định dạng ngày Việt Nam
};

// Helper function to generate excerpt
const generateExcerpt = (content, length = 100) => {
     if (!content) return '';
     // Remove HTML tags (basic version)
     const text = content.replace(/<[^>]*>/g, '');
     if (text.length <= length) return text;
     return text.substring(0, length) + '...';
};

// Helper function to build correct image URL
const getImageUrl = (imagePath) => {
    // Nếu path null/undefined, trả về ảnh placeholder
    if (!imagePath) {
        return 'https://via.placeholder.com/300x200?text=No+Image';
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
            return 'https://via.placeholder.com/300x200?text=Error+Loading+Image';
        }
    }
    
    // Trường hợp khác
    return 'https://via.placeholder.com/300x200?text=No+Image';
};

// Hàm chuyển hướng đến trang chi tiết bài viết
const navigateToPost = async () => {
  // Không tăng lượt xem từ danh sách, để lượt xem chỉ tăng ở trang chi tiết
  // Điều này tránh trường hợp tăng lượt xem nhiều lần khi người dùng chỉ xem qua danh sách
    
  // Chuyển hướng đến trang chi tiết
  router.push({
    name: 'PostDetail',
    params: { id: props.post.post_id || props.post.id }
  });
};
</script>

<style scoped>
.card {
    transition: all 0.3s ease;
    overflow: hidden;
    border-radius: 10px;
    border: none;
}

.hover-effect:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}

.card-img-container {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.card-img-top {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.hover-effect:hover .card-img-top {
    transform: scale(1.05);
}

.placeholder-image {
    background-color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.card-title {
    font-weight: 700;
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.card-text {
    color: #6c757d;
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}

.card-meta {
    margin-top: auto;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(0,0,0,0.05);
}

.post-stats {
    font-size: 0.8rem;
    color: #6c757d;
}
</style>