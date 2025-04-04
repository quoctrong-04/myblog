<template>
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1100">
        <div
            v-if="toast.show"
            :class="['toast', 'show', toastClass]"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <div class="d-flex">
                 <div class="toast-body">
                    {{ toast.message }}
                 </div>
                 <button
                    type="button"
                    class="btn-close me-2 m-auto"
                    @click="hide"
                    aria-label="Close"
                 ></button>
            </div>
        </div>
    </div>
 </template>
 
 <script setup>
 import { computed } from 'vue';
 import { useStore } from 'vuex';
 
 const store = useStore();
 const toast = computed(() => store.getters.toast);
 
 const toastClass = computed(() => {
     switch (toast.value.type) {
         case 'success': return 'text-white bg-success';
         case 'error': return 'text-white bg-danger';
         case 'warning': return 'text-dark bg-warning';
         case 'info':
         default: return 'text-dark bg-light border'; // Hoặc bg-info
     }
 });
 
 const hide = () => {
     store.commit('hideToast');
 };
 </script>
 
 <style scoped>
 /* Không cần style nhiều vì dùng class Bootstrap */
 </style>