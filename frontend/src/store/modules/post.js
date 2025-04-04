// src/store/modules/post.js
import { posts as api } from '@/services/api';

export default {
  namespaced: true,
  state: {
    posts: [], // Danh sách bài viết (cho trang list)
    currentPost: null, // Bài viết đang xem (cho trang detail)
    popularPosts: [], // Bài viết phổ biến
    userLikes: {}, // Lưu trạng thái like của user { postId: true/false }
    loading: false,
    error: null,
    pagination: { // Thông tin phân trang từ API
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0,
    },
  },
  getters: {
    posts: state => state.posts,
    currentPost: state => state.currentPost,
    popularPosts: state => state.popularPosts,
    loading: state => state.loading,
    error: state => state.error,
    pagination: state => state.pagination,
    isPostLiked: state => postId => !!state.userLikes[postId], // Kiểm tra user đã like post chưa
  },
  mutations: {
    setPosts(state, { posts, pagination }) {
      state.posts = posts;
      if (pagination) {
          state.pagination = pagination;
      }
    },
    setCurrentPost(state, post) {
      state.currentPost = post;
    },
    setPopularPosts(state, posts) {
        state.popularPosts = posts;
    },
    setLoading(state, status) {
      state.loading = status;
    },
    setError(state, error) {
      state.error = error;
    },
    addPost(state, post) {
      // Thêm vào đầu danh sách nếu đang ở trang 1 hoặc không có phân trang
      if (state.pagination.currentPage === 1 || state.posts.length < 10) { // Giả sử page size là 10
          state.posts.unshift(post);
      }
      state.pagination.totalPosts++; // Tăng tổng số bài
    },
    updatePost(state, updatedPost) {
      // Cập nhật trong danh sách posts
      const index = state.posts.findIndex(p => p.post_id === updatedPost.post_id);
      if (index !== -1) {
        state.posts.splice(index, 1, updatedPost);
      }
      // Cập nhật trong currentPost nếu đang xem bài đó
      if (state.currentPost && state.currentPost.post_id === updatedPost.post_id) {
        state.currentPost = { ...state.currentPost, ...updatedPost };
      }
    },
    deletePost(state, postId) {
      state.posts = state.posts.filter(p => p.post_id !== postId);
      state.pagination.totalPosts--; // Giảm tổng số bài
      if (state.currentPost && state.currentPost.post_id === postId) {
          state.currentPost = null; // Xóa nếu đang xem bài đó
      }
    },
    clearPosts(state) {
        state.posts = [];
        state.currentPost = null;
        state.popularPosts = [];
        state.userLikes = {};
        state.pagination = { currentPage: 1, totalPages: 1, totalPosts: 0 };
    },
    // Like mutations
    incrementLikeCount(state, postId) {
        const post = state.posts.find(p => p.post_id === postId || p.id === postId);
        if (post) {
          post.like_count = (post.like_count || 0) + 1;
          post.likes_count = post.like_count; // Cập nhật cả hai trường để đảm bảo
        }
        if (state.currentPost && (state.currentPost.post_id === postId || state.currentPost.id === postId)) {
          state.currentPost.like_count = (state.currentPost.like_count || 0) + 1;
          state.currentPost.likes_count = state.currentPost.like_count;
        }
    },
    decrementLikeCount(state, postId) {
        const post = state.posts.find(p => p.post_id === postId || p.id === postId);
        if (post && post.like_count > 0) {
          post.like_count--;
          post.likes_count = post.like_count; // Cập nhật cả hai trường để đảm bảo
        }
        if (state.currentPost && (state.currentPost.post_id === postId || state.currentPost.id === postId) && 
            state.currentPost.like_count > 0) {
          state.currentPost.like_count--;
          state.currentPost.likes_count = state.currentPost.like_count;
        }
    },
    setUserLikedStatus(state, { postId, liked }) {
         // Dùng Vue.set hoặc {...state.userLikes} để đảm bảo reactivity nếu cần
         state.userLikes[postId] = liked;
         state.userLikes = { ...state.userLikes }; // Trigger reactivity
    },
    // (Optional) Mutation to update view count if needed from frontend
    incrementViewCount(state, postId) {
        const post = state.posts.find(p => p.post_id === postId);
        if (post) post.view_count++;
        if (state.currentPost && state.currentPost.post_id === postId) state.currentPost.view_count++;
    },
    // Cập nhật số lượng comment cho bài viết
    updatePostCommentCount(state, { postId, count }) {
      // Cập nhật trong danh sách posts
      const post = state.posts.find(p => p.post_id == postId);
      if (post) {
        post.comment_count = count;
      }
      
      // Cập nhật trong currentPost nếu đang xem bài đó
      if (state.currentPost && state.currentPost.post_id == postId) {
        state.currentPost.comment_count = count;
      }
    },
    UPDATE_POST_LIKES(state, { postId, likeCount, isLiked }) {
      // Cập nhật trong danh sách posts
      const post = state.posts.find(p => p.id === postId || p.post_id === postId);
      if (post) {
        post.likes_count = likeCount;
        post.like_count = likeCount;
        post.liked_by_user = isLiked;
      }
      
      // Cập nhật trong currentPost nếu đang xem bài viết đó
      if (state.currentPost && (state.currentPost.id === postId || state.currentPost.post_id === postId)) {
        state.currentPost.likes_count = likeCount;
        state.currentPost.like_count = likeCount;
        state.currentPost.liked_by_user = isLiked;
      }
      
      // Cập nhật userLikes
      state.userLikes = {
        ...state.userLikes,
        [postId]: isLiked
      };
    },
    // Cập nhật comment count cho post
    UPDATE_POST_COMMENT_COUNT(state, { postId, count }) {
      // Cập nhật trong danh sách posts
      const post = state.posts.find(p => p.id === postId || p.post_id === postId);
      if (post) {
        post.comment_count = count;
      }
      
      // Cập nhật trong currentPost
      if (state.currentPost && (state.currentPost.id === postId || state.currentPost.post_id === postId)) {
        state.currentPost.comment_count = count;
      }
    },
    // Update post like status và count từ kết quả API
    UPDATE_POST_LIKE_STATUS(state, { postId, liked, likeCount }) {
      // Cập nhật trong danh sách posts
      const post = state.posts.find(p => p.id === postId || p.post_id === postId);
      if (post) {
        post.likes_count = likeCount !== undefined ? likeCount : post.likes_count;
        post.like_count = likeCount !== undefined ? likeCount : post.like_count;
        post.liked_by_user = liked;
      }
      
      // Cập nhật trong currentPost nếu đang xem bài viết đó
      if (state.currentPost && (state.currentPost.id === postId || state.currentPost.post_id === postId)) {
        state.currentPost.likes_count = likeCount !== undefined ? likeCount : state.currentPost.likes_count;
        state.currentPost.like_count = likeCount !== undefined ? likeCount : state.currentPost.like_count;
        state.currentPost.liked_by_user = liked;
      }
    },
    // Update post view count 
    UPDATE_POST_VIEW_COUNT(state, { postId, viewCount }) {
      // Cập nhật trong danh sách posts
      const post = state.posts.find(p => p.id === postId || p.post_id === postId);
      if (post) {
        post.view_count = viewCount;
      }
      
      // Cập nhật trong currentPost nếu đang xem bài viết đó
      if (state.currentPost && (state.currentPost.id === postId || state.currentPost.post_id === postId)) {
        state.currentPost.view_count = viewCount;
      }
    },
  },
  actions: {
    // eslint-disable-next-line no-unused-vars
    async fetchPosts({ commit, dispatch }, { page = 1, limit = 10 } = {}) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        const response = await api.getAllPosts();
        if (response && response.data) {
          // Lưu trạng thái liked_by_user cho mỗi bài viết
          const posts = response.data.posts || [];
          
          // Đảm bảo tất cả bài viết có comment_count
          for (const post of posts) {
            // Đảm bảo comment_count có giá trị
            if (post.comment_count === undefined || post.comment_count === null) {
              post.comment_count = 0;
              
              // Lấy số lượng bình luận từ server nếu có
              try {
                const commentsResponse = await api.getCommentsByPostId(post.post_id);
                if (commentsResponse?.data) {
                  let comments = [];
                  if (Array.isArray(commentsResponse.data)) {
                    comments = commentsResponse.data;
                  } else if (commentsResponse.data.comments && Array.isArray(commentsResponse.data.comments)) {
                    comments = commentsResponse.data.comments;
                  } else if (commentsResponse.data.data && Array.isArray(commentsResponse.data.data)) {
                    comments = commentsResponse.data.data;
                  }
                  
                  // Cập nhật comment_count
                  post.comment_count = comments.length;
                }
              } catch (err) {
                console.error(`Error fetching comments for post ${post.post_id}:`, err);
              }
            }
            
            // Lưu trạng thái liked_by_user nếu có
            if (typeof post.liked_by_user !== 'undefined') {
              commit('setUserLikedStatus', { postId: post.post_id, liked: post.liked_by_user });
            }
          }

          commit('setPosts', { 
            posts, 
            pagination: response.data.pagination || {
              currentPage: 1,
              totalPages: 1,
              totalPosts: posts.length || 0
            }
          });
        } else {
          throw new Error('Dữ liệu không hợp lệ');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Lỗi tải danh sách bài viết.';
        commit('setError', errorMessage);
        dispatch('showErrorToast', errorMessage, { root: true });
      } finally {
        commit('setLoading', false);
      }
    },

    async fetchPost({ commit, dispatch }, postId) {
      if (!postId) {
        commit('setError', 'ID bài viết không hợp lệ');
        return;
      }
      
      commit('setLoading', true);
      commit('setCurrentPost', null);
      commit('setError', null);
      
      try {
        const response = await api.getPostById(postId);
        
        if (response?.data?.post) {
          const post = response.data.post;
          commit('setCurrentPost', post);
          
          // Lưu trạng thái like từ server
          if (typeof post.liked_by_user !== 'undefined') {
            commit('like/setUserLikedStatus', { 
              postId: post.id || post.post_id, 
              liked: post.liked_by_user 
            }, { root: true });
          }
          
          // Tăng lượt xem bài viết
          dispatch('incrementViewCount', post.id || post.post_id);
          
          // Lấy số lượng bình luận mới nhất
          try {
            const commentsResponse = await api.getCommentsByPostId(post.id || post.post_id);
            if (commentsResponse?.data) {
              let comments = [];
              if (Array.isArray(commentsResponse.data)) {
                comments = commentsResponse.data;
              } else if (commentsResponse.data.comments && Array.isArray(commentsResponse.data.comments)) {
                comments = commentsResponse.data.comments;
              } else if (commentsResponse.data.data && Array.isArray(commentsResponse.data.data)) {
                comments = commentsResponse.data.data;
              }
              
              // Cập nhật số lượng bình luận
              commit('UPDATE_POST_COMMENT_COUNT', { 
                postId: post.id || post.post_id, 
                count: comments.length 
              });
            }
          } catch (commentError) {
            console.error('Error fetching comments count for post:', commentError);
          }
          
          return post;
        } else {
          throw new Error('Không tìm thấy bài viết hoặc dữ liệu không hợp lệ');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        
        const errorMessage = error.response?.data?.message || 'Lỗi khi tải bài viết.';
        commit('setError', errorMessage);
        dispatch('showErrorToast', errorMessage, { root: true });
        return null;
      } finally {
        commit('setLoading', false);
      }
    },

    async createPost({ commit, dispatch }, postData) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        const response = await api.createPost(postData);
        if (response && response.data) {
          commit('addPost', response.data.post);
          dispatch('showSuccessToast', 'Tạo bài viết thành công!', { root: true });
          return response.data.post;
        } else {
          throw new Error('Dữ liệu không hợp lệ');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Lỗi tạo bài viết.';
        commit('setError', errorMessage);
        dispatch('showErrorToast', errorMessage, { root: true });
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async updatePost({ commit, dispatch }, { postId, postData }) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        const response = await api.updatePost(postId, postData);
        if (response && response.data) {
          commit('updatePost', response.data.post);
          dispatch('showSuccessToast', 'Cập nhật bài viết thành công!', { root: true });
          return response.data.post;
        } else {
          throw new Error('Dữ liệu không hợp lệ');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Lỗi cập nhật bài viết.';
        commit('setError', errorMessage);
        dispatch('showErrorToast', errorMessage, { root: true });
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },

    async deletePost({ commit, dispatch }, postId) {
      commit('setLoading', true);
      commit('setError', null);
      try {
        await api.deletePost(postId);
        commit('deletePost', postId);
        dispatch('showSuccessToast', 'Xóa bài viết thành công!', { root: true });
        return true;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Lỗi xóa bài viết.';
        commit('setError', errorMessage);
        dispatch('showErrorToast', errorMessage, { root: true });
        return false;
      } finally {
        commit('setLoading', false);
      }
    },

    // eslint-disable-next-line no-unused-vars
    async toggleLike({ commit, rootState, state }, postId) {
      if (!rootState.auth.user) {
        // Không đăng nhập, không thể like
        return false;
      }
      
      // Tìm bài viết trong state để lấy trạng thái like hiện tại
      const index = state.posts.findIndex(p => p.post_id == postId || p.id == postId);
      const currentPost = state.currentPost && (state.currentPost.post_id == postId || state.currentPost.id == postId) ? state.currentPost : null;
      
      // Xác định trạng thái like hiện tại từ state
      const isCurrentlyLiked = state.userLikes[postId] || (currentPost && currentPost.liked_by_user) || false;
      
      // Xác định số lượng like hiện tại
      let currentLikeCount = 0;
      if (index !== -1) {
        currentLikeCount = state.posts[index].likes_count || state.posts[index].like_count || 0;
      } else if (currentPost) {
        currentLikeCount = currentPost.likes_count || currentPost.like_count || 0;
      }
      
      // Tính toán trạng thái và số lượng like mới
      const newLikeStatus = !isCurrentlyLiked;
      const newLikeCount = newLikeStatus 
        ? currentLikeCount + 1 
        : Math.max(0, currentLikeCount - 1);
      
      // Cập nhật UI ngay lập tức
      commit('UPDATE_POST_LIKES', { 
        postId,
        likeCount: newLikeCount,
        isLiked: newLikeStatus
      });
      
      try {
        // Gọi API thích hoặc bỏ thích tùy thuộc vào trạng thái cũ
        let response;
        if (isCurrentlyLiked) {
          response = await api.unlikePost(postId);
        } else {
          response = await api.likePost(postId);
        }
        
        // Cập nhật state dựa trên kết quả từ API
        if (response && response.data) {
          const apiLiked = !!response.data.liked;
          commit('setUserLikedStatus', { postId, liked: apiLiked });
          
          // Nếu API trả về trạng thái khác với UI, cập nhật lại số lượng
          if (apiLiked !== newLikeStatus) {
            const apiLikeCount = apiLiked ? currentLikeCount + 1 : Math.max(0, currentLikeCount - 1);
            commit('UPDATE_POST_LIKES', {
              postId,
              likeCount: apiLikeCount,
              isLiked: apiLiked
            });
          }
        } else {
          // Nếu không có dữ liệu trả về, giữ nguyên trạng thái đã cập nhật
          commit('setUserLikedStatus', { postId, liked: newLikeStatus });
        }
        
        return true;
      } catch (error) {
        console.error('Error toggling like:', error);
        
        // Hoàn tác UI nếu API gọi thất bại
        commit('UPDATE_POST_LIKES', { 
          postId,
          likeCount: currentLikeCount,
          isLiked: isCurrentlyLiked
        });
        
        // Khôi phục trạng thái like trong state
        commit('setUserLikedStatus', { postId, liked: isCurrentlyLiked });
        
        return false;
      }
    },

    // Action để cập nhật số lượng comment
    // eslint-disable-next-line no-unused-vars
    updatePostCommentCount({ commit, dispatch }, { postId, count }) {
      try {
        commit('UPDATE_POST_COMMENT_COUNT', { postId, count });
        return true;
      } catch (error) {
        console.error('Error updating post comment count:', error);
        return false;
      }
    },
    
    // Action để tăng số lượng like
    incrementLikeCount({ commit }, postId) {
      commit('incrementLikeCount', postId);
    },
    
    // Action để giảm số lượng like
    decrementLikeCount({ commit }, postId) {
      commit('decrementLikeCount', postId);
    },

    // Tăng lượt xem cho bài viết
    async incrementViewCount({ commit }, postId) {
      if (!postId) return;
      
      try {
        // Gọi API để tăng lượt xem
        const response = await api.incrementViewCount(postId);
        
        if (response && response.data) {
          const viewCount = response.data.view_count || response.data.viewCount;
          
          // Cập nhật UI với lượt xem mới
          if (viewCount !== undefined) {
            commit('UPDATE_POST_VIEW_COUNT', { postId, viewCount });
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error incrementing view count:', error);
        return false;
      }
    },

    // Update post like status (gọi từ like.js sau khi toggle like thành công)
    updatePostLikeStatus({ commit }, { postId, liked, likeCount }) {
      commit('UPDATE_POST_LIKE_STATUS', { postId, liked, likeCount });
    },
    
    // Giảm tổng số bình luận trong dashboard khi xóa bình luận
    decrementTotalCommentCount() {
      // Không cần làm gì ở đây vì tổng số bình luận sẽ được tính lại khi refreshData trong AdminDashboard
      return true;
    }
  }
};

// Mutation hoặc action để đồng bộ hóa số lượng comment trong admin
export const UPDATE_ADMIN_COMMENT_COUNT = 'UPDATE_ADMIN_COMMENT_COUNT';

// Đảm bảo có action để update số lượng comment
// eslint-disable-next-line no-unused-vars
export const updatePostCommentCount = ({ commit, dispatch }, { postId, count }) => {
  // Action này sẽ cập nhật comment count cho post trong state
  commit('UPDATE_POST_COMMENT_COUNT', { postId, count });
  
  // Cũng cập nhật cho admin dashboard nếu cần
  commit('UPDATE_ADMIN_COMMENT_COUNT', count);
};