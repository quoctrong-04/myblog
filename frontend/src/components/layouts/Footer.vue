<template>
  <footer class="bg-light text-center text-lg-start mt-auto py-3 border-top">
    <div class="container">
      <p class="mb-0 text-muted">&copy; {{ new Date().getFullYear() }} My Personal Blog. All rights reserved.</p>
      </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
/* footer {
   position: absolute;
   bottom: 0;
   width: 100%;
} */
</style>