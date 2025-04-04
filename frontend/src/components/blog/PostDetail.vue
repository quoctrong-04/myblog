<template>
  <div class="post-detail">
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="post" class="container">
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <!-- Hình ảnh bài viết -->
          <img v-if="post.image" :src="post.image" alt="Post cover" class="img-fluid rounded mb-4">
          
          <!-- Tiêu đề và thông tin -->
          <h1 class="mb-3">{{ post.title }}</h1>
          <div class="d-flex justify-content-between mb-4">
            <div class="post-meta text-muted">
              <span><i class="fas fa-user me-1"></i> {{ post.username || 'Admin' }}</span>
              <span class="mx-2">•</span>
              <span><i class="fas fa-calendar me-1"></i> {{ formatDate(post.created_at) }}</span>
            </div>
            <div class="post-stats">
              <span class="me-3" title="Lượt xem"><i class="far fa-eye me-1"></i> {{ post.view_count || 0 }}</span>
              <span class="me-3" title="Bình luận"><i class="far fa-comment me-1"></i> {{ commentCount }}</span>
              <button 
                class="btn btn-sm"
                :class="isLiked ? 'btn-danger' : 'btn-outline-danger'"
                @click="toggleLike"
                :disabled="likeLoading"
              >
                <i :class="isLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
                {{ likeCount }}
              </button>
            </div>
          </div>
          
          <!-- Nội dung bài viết -->
          <div class="post-content mb-5">
            <div v-html="post.content"></div>
          </div>
          
          <!-- Phần bình luận -->
          <div class="comments-section">
            <h3 class="mb-4">Bình luận ({{ commentCount }})</h3>
            <comment-section 
              :post-id="post.post_id" 
              @update-comment-count="updateCommentCount"
            ></comment-section>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="alert alert-info">
      Không tìm thấy bài viết hoặc bài viết đã bị xóa.
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import CommentSection from '@/components/blog/CommentSection.vue';

export default {
  name: 'PostDetail',
  components: {
    CommentSection
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const likeLoading = ref(false);
    const commentCount = ref(0);
    
    const post = computed(() => store.getters['post/currentPost']);
    const loading = computed(() => store.getters['post/loading']);
    const error = computed(() => store.getters['post/error']);
    
    // Lấy ID bài viết từ route
    const postId = computed(() => route.params.id);
    
    // Thông tin like từ store
    const isLiked = computed(() => {
      return post.value?.liked_by_user || store.getters['like/isPostLiked'](postId.value);
    });
    
    const likeCount = computed(() => {
      return post.value?.likes_count || post.value?.like_count || 0;
    });
    
    // Tải bài viết khi component được mount
    onMounted(async () => {
      await store.dispatch('post/fetchPost', postId.value);
      
      // Lấy số lượng bình luận ban đầu từ bài viết
      if (post.value) {
        commentCount.value = post.value.comment_count || 0;
      }
      
      // Lấy danh sách bình luận
      const comments = await store.dispatch('comment/fetchComments', postId.value);
      commentCount.value = comments.length;
    });
    
    // Format date
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN');
    };
    
    // Cập nhật số lượng bình luận
    const updateCommentCount = (count) => {
      commentCount.value = count;
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
        // Gọi API toggle like
        const result = await store.dispatch('like/toggleLike', postId.value);
        
        // Hiển thị thông báo nếu có lỗi
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
    
    return {
      post,
      loading,
      error,
      postId,
      isLiked,
      likeCount,
      likeLoading,
      commentCount,
      formatDate,
      toggleLike,
      updateCommentCount
    };
  }
};
</script>

<style scoped>
.post-detail {
  padding: 30px 0;
}

.post-meta {
  font-size: 0.9rem;
}

.post-content {
  line-height: 1.8;
}

.post-stats {
  display: flex;
  align-items: center;
}

.comments-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e5e5e5;
}
</style> 