<template>
    <section class="mb-5">
        <div class="card bg-light">
            <div class="card-body">
                <h5 class="card-title mb-3">Bình luận ({{ comments.length }})</h5>

                <form v-if="isAuthenticated" class="mb-4" @submit.prevent="submitComment">
                    <div class="d-flex align-items-start mb-2">
                        <img class="rounded-circle me-2" :src="currentUser?.avatar || 'https://via.placeholder.com/40'" alt="Your avatar" width="40" height="40">
                        <div class="flex-grow-1">
                            <div class="fw-bold text-primary">{{ currentUser?.username || 'Người dùng' }}</div>
                            <textarea
                                class="form-control mt-1"
                                rows="3"
                                placeholder="Viết bình luận của bạn..."
                                v-model="newComment"
                                :disabled="isSubmitting"
                                required
                            ></textarea>
                        </div>
                    </div>
                    <div class="d-flex justify-content-end">
                        <button class="btn btn-primary" type="submit" :disabled="isSubmitting || !newComment.trim()">
                            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            {{ isSubmitting ? 'Đang gửi...' : 'Gửi bình luận' }}
                        </button>
                    </div>
                    <div v-if="commentError" class="alert alert-danger mt-2 small">{{ commentError }}</div>
                </form>
                 <p v-else class="text-muted">
                    <router-link :to="{ name: 'Login', query: { redirect: $route.fullPath } }">Đăng nhập</router-link> để gửi bình luận.
                </p>

                <div v-if="loading" class="text-center py-3">
                    <div class="spinner-border text-secondary" role="status">
                        <span class="visually-hidden">Đang tải bình luận...</span>
                    </div>
                </div>
                <div v-else-if="comments.length > 0">
                    <div v-for="comment in comments" :key="comment.comment_id" class="d-flex mb-4">
                        <div class="flex-shrink-0">
                            <img class="rounded-circle" :src="comment.avatar || 'https://via.placeholder.com/50'" alt="User Avatar" width="50" />
                        </div>
                        <div class="ms-3 flex-grow-1">
                            <div class="fw-bold">{{ comment.username || 'Người dùng' }}</div>
                            <small class="text-muted">{{ formatDate(comment.created_at) }}</small>
                            <p class="mt-1 mb-1">{{ comment.content }}</p>
                            <div class="d-flex">
                                <button
                                    v-if="canDeleteComment(comment)"
                                    class="btn btn-sm btn-outline-danger py-0 px-1 me-2"
                                    @click="deleteComment(comment.comment_id)"
                                    :disabled="isDeleting === comment.comment_id"
                                    title="Xóa bình luận"
                                >
                                    <span v-if="isDeleting === comment.comment_id" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    <i v-else class="fas fa-trash-alt small"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <p v-else class="text-muted">Chưa có bình luận nào.</p>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';

// eslint-disable-next-line no-undef
const props = defineProps({
    postId: {
        type: [Number, String],
        required: true,
    }
});

// eslint-disable-next-line no-undef
const emit = defineEmits(['update-comment-count']);

const store = useStore();
const route = useRoute();

const newComment = ref('');
const isSubmitting = ref(false); // Trạng thái loading cho form submit
const isDeleting = ref(null); // Để track comment nào đang được xóa

const comments = computed(() => store.getters['comment/comments'] || []);
const loading = computed(() => store.getters['comment/loading']);
const commentError = computed(() => store.getters['comment/error']);
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
const isAdmin = computed(() => store.getters['auth/isAdmin']);
const currentUserId = computed(() => store.getters['auth/userId']);
const currentUser = computed(() => store.getters['auth/user']);

// Theo dõi thay đổi số lượng bình luận
watch(comments, (newComments) => {
    // Thông báo cho component cha biết số lượng bình luận đã thay đổi
    emit('update-comment-count', newComments.length);
    
    // Cập nhật số lượng bình luận trong store của bài viết
    store.dispatch('post/updatePostCommentCount', {
        postId: props.postId,
        count: newComments.length
    });
});

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
};

const submitComment = async () => {
    if (!newComment.value.trim()) {
        store.dispatch('showErrorToast', 'Vui lòng nhập nội dung bình luận', { root: true });
        return;
    }
    
    if (!isAuthenticated.value) {
        store.dispatch('showErrorToast', 'Vui lòng đăng nhập để bình luận', { root: true });
        return;
    }
    
    try {
        isSubmitting.value = true;
        store.commit('comment/SET_ERROR', null);
        
        const result = await store.dispatch('comment/createComment', {
            postId: props.postId,
            content: newComment.value
        });
        
        if (result) {
            newComment.value = '';
            store.dispatch('showSuccessToast', 'Bình luận của bạn đã được đăng thành công!', { root: true });
            
            // Thông báo số lượng bình luận đã thay đổi
            emit('update-comment-count', comments.value.length);
        }
    } catch (error) {
        console.error('Error in submitComment:', error);
    } finally {
        isSubmitting.value = false;
    }
};

const canDeleteComment = (comment) => {
    if (!comment || !currentUserId.value) return false;
    
    // Admin có thể xóa mọi comment
    // User có thể xóa comment của chính mình
    return isAdmin.value || 
           (isAuthenticated.value && 
            (comment.user_id === currentUserId.value || 
             comment.userId === currentUserId.value));
};

const deleteComment = async (commentId) => {
    if (!commentId || !confirm('Bạn có chắc muốn xóa bình luận này?')) {
        return;
    }

    try {
        console.log(`Xóa comment với ID: ${commentId}`);
        // Tìm comment để debug
        const comment = comments.value.find(c => {
            const cid = String(c.comment_id || c.id);
            return cid === String(commentId);
        });
        console.log('Comment sẽ bị xóa:', comment);
        
        isDeleting.value = commentId;
        
        // Thực hiện xóa comment
        const result = await store.dispatch('comment/deleteComment', commentId);
        
        if (result) {
            console.log('Xóa comment thành công, cập nhật UI');
            
            // Cập nhật UI - giảm số lượng comment hiển thị
            const updatedCount = comments.value.length;
            
            // Cập nhật số lượng comment trong post tiêu đề
            store.commit('post/UPDATE_POST_COMMENT_COUNT', { 
                postId: props.postId, 
                count: updatedCount
            });
            
            // Reload page sau 100ms để đảm bảo state đã cập nhật
            setTimeout(async () => {
                await loadComments();
            }, 100);
        }
    } catch (error) {
        console.error('Error deleting comment from component:', error);
        store.dispatch('showErrorToast', 'Không thể xóa bình luận. Vui lòng thử lại sau.', { root: true });
    } finally {
        isDeleting.value = null;
    }
};

const loadComments = async () => {
  if (!props.postId) return;
  
  try {
    await store.dispatch('comment/fetchComments', props.postId);
    
    // Thông báo số lượng bình luận sau khi tải
    emit('update-comment-count', comments.value.length);
  } catch (error) {
    console.error('Error loading comments:', error);
  }
};

onMounted(() => {
  loadComments();
});

// Watch for changes in postId to reload comments
watch(() => props.postId, (newPostId) => {
  if (newPostId) {
    loadComments();
  }
});

// Watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId && `${newId}` === `${props.postId}`) {
    loadComments();
  }
});
</script>

<style scoped>
.card {
    border-radius: 0.5rem;
}
.form-control {
    border-radius: 0.25rem;
}
</style>