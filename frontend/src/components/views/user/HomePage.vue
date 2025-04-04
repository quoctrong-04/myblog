<template>
  <div>
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container">
        <div class="hero-content text-center">
          <h1 class="display-4 fw-bold text-white">Chào mừng đến với Blog cá nhân</h1>
          <p class="lead text-white-50 mb-4">Nơi chia sẻ kiến thức, kinh nghiệm và những câu chuyện thú vị.</p>
          <router-link :to="{ name: 'BlogList' }" class="btn btn-light btn-lg">
            Khám phá bài viết
            <i class="fas fa-arrow-right ms-2"></i>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Featured Posts Section -->
    <div class="container py-5">
      <div class="section-header text-center mb-5">
        <h2 class="fw-bold">Bài viết nổi bật</h2>
        <div class="separator"></div>
        <p class="text-muted">Những bài viết được đọc nhiều nhất</p>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div v-else-if="error" class="alert alert-danger text-center" role="alert">
        {{ error }}
      </div>
      <div v-else-if="posts.length > 0" class="row g-4">
        <div v-for="post in posts.slice(0, 3)" :key="post.post_id" class="col-md-4">
          <PostCard :post="post" />
        </div>
      </div>
      <div v-else class="text-center py-5">
        <i class="fas fa-newspaper fa-3x text-muted mb-3"></i>
        <p class="lead text-muted">Chưa có bài viết nào.</p>
      </div>

      <div class="text-center mt-4">
        <router-link :to="{ name: 'BlogList' }" class="btn btn-outline-primary">
          Xem tất cả bài viết
          <i class="fas fa-arrow-right ms-2"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import PostCard from '@/components/blog/PostCard.vue';

const store = useStore();

const loading = ref(false);
const error = ref(null);
const posts = computed(() => store.getters['post/posts']);

// Fetch bài viết mới nhất
const fetchLatestPosts = async () => {
  try {
    loading.value = true;
    error.value = null;
    await store.dispatch('post/fetchPosts', { 
      page: 1,
      limit: 3,
      sort: 'created_at:desc'
    });
  } catch (err) {
    error.value = 'Không thể tải bài viết. Vui lòng thử lại sau.';
    console.error('Error fetching posts:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLatestPosts();
});
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
  padding: 120px 0;
  margin-bottom: 80px;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%);
  opacity: 1;
  pointer-events: none;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 60px;
  text-align: center;
}

.section-header h2 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.separator {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #4b6cb7, #182848);
  margin: 20px auto;
  border-radius: 2px;
}

.section-header p {
  font-size: 1.2rem;
  color: #666;
}

/* Card styling */
.row {
  margin: -20px;
}

.col-md-4 {
  padding: 20px;
}

:deep(.card) {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  background: #fff;
}

:deep(.card:hover) {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

:deep(.card-img-top) {
  height: 220px;
  object-fit: cover;
  transition: transform 0.5s ease;
}

:deep(.card:hover .card-img-top) {
  transform: scale(1.05);
}

:deep(.card-body) {
  padding: 1.5rem;
}

:deep(.card-title) {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
}

:deep(.card-text) {
  color: #666;
  line-height: 1.6;
}

.btn-light {
  font-weight: 600;
  padding: 12px 30px;
  border-radius: 30px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.95);
  border: none;
}

.btn-light:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  background: #fff;
}

.btn-outline-primary {
  padding: 12px 30px;
  border-radius: 30px;
  border-width: 2px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 2rem;
}

.btn-outline-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(75, 108, 183, 0.2);
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 80px 0;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  :deep(.card-img-top) {
    height: 180px;
  }
}
</style>