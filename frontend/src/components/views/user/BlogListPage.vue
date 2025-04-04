<template>
  <div class="blog-container">
    <header class="blog-header text-center mb-5">
      <h1 class="fw-bold">Blog</h1>
      <p class="lead text-muted">Chia sẻ kiến thức và kinh nghiệm</p>
    </header>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    <div v-else>
      <div v-if="filteredPosts.length > 0">
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          <div v-for="post in filteredPosts" :key="post.post_id" class="col">
            <PostCard :post="post" />
          </div>
        </div>

        <nav v-if="pagination.totalPages > 1" aria-label="Page navigation" class="my-5">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
              <button class="page-link" @click="changePage(pagination.currentPage - 1)" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </button>
            </li>
            <li v-for="page in pagination.totalPages" :key="page" class="page-item" :class="{ active: page === pagination.currentPage }">
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
              <button class="page-link" @click="changePage(pagination.currentPage + 1)" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div v-else class="text-center py-5 my-5">
        <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
        <p class="lead text-muted">Chưa có bài viết nào.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import PostCard from '@/components/blog/PostCard.vue';

const store = useStore();
const route = useRoute();
const router = useRouter();

const posts = computed(() => store.getters['post/posts']);
const loading = computed(() => store.getters['post/loading']);
const error = computed(() => store.getters['post/error']);
const pagination = computed(() => store.getters['post/pagination']);

// Lọc bỏ các post không hợp lệ (undefined hoặc không có post_id)
const filteredPosts = computed(() => {
  return posts.value.filter(post => post && post.post_id);
});

const currentPage = ref(parseInt(route.query.page || '1'));

const fetchPostsData = (page) => {
  store.dispatch('post/fetchPosts', { page });
};

const changePage = (page) => {
  if (page > 0 && page <= pagination.value.totalPages && page !== currentPage.value) {
    currentPage.value = page;
    // Cập nhật URL mà không reload trang
    router.push({ query: { page: page } });
    // fetchPostsData(page); // watcher sẽ gọi hàm này
  }
};

// Fetch data khi component được mount lần đầu
onMounted(() => {
  fetchPostsData(currentPage.value);
});

// Watcher để fetch lại data khi query 'page' thay đổi
watch(() => route.query.page, (newPage) => {
  const pageNum = parseInt(newPage || '1');
  currentPage.value = pageNum;
  fetchPostsData(pageNum);
});
</script>

<style scoped>
.blog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.blog-header {
  margin-top: 4rem;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
}

.blog-header h1 {
  font-size: 2.5rem;
  color: #333;
  position: relative;
  z-index: 2;
}

.lead {
  font-size: 1.2rem;
}

.pagination {
  margin-top: 3rem;
}

.page-link {
  color: #3498db;
  border-color: #e9ecef;
}

.page-item.active .page-link {
  background-color: #3498db;
  border-color: #3498db;
}

.page-link:focus {
  box-shadow: 0 0 0 0.25rem rgba(52, 152, 219, 0.25);
}
</style>