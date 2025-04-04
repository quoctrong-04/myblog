<template>
  <div class="container text-center py-5">
      <h1 class="display-1 fw-bold">404</h1>
      <p class="fs-3"> <span class="text-danger">Opps!</span> Trang không tồn tại.</p>
      <p class="lead">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <router-link :to="{ name: 'Home' }" class="btn btn-primary">Quay về trang chủ</router-link>
  </div>
</template>

<script setup>
// Trang tĩnh
</script>

<style scoped>
/* Thêm style nếu muốn */
</style>