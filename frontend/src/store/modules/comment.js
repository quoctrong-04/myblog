// src/store/modules/comment.js
import { comments as api } from '@/services/api';

// Initial state
const state = {
  comments: [], // comments cho bài viết hiện tại
  allComments: [], // comments cho trang admin list
  loading: false, // loading cho fetchComments (chi tiết bài viết)
  loadingAll: false, // loading cho fetchAllComments (admin)
  error: null,
  errorAll: null, // Lỗi riêng cho fetchAllComments
  pagination: { // Phân trang cho allComments (admin)
      currentPage: 1,
      totalPages: 1,
      totalComments: 0,
  },
  submitting: false
};

// Getters
const getters = {
  comments: state => state.comments,
  allComments: state => state.allComments,
  loading: state => state.loading,
  loadingAll: state => state.loadingAll,
  error: state => state.error,
  errorAll: state => state.errorAll,
  pagination: state => state.pagination,
  submitting: state => state.submitting
};

// Mutations
const mutations = {
  SET_COMMENTS(state, comments) {
    state.comments = comments;
  },
  SET_ALL_COMMENTS(state, { comments, pagination }) {
    state.allComments = comments;
    if (pagination) {
      state.pagination = pagination;
    }
  },
  SET_LOADING(state, status) {
    state.loading = status;
  },
  SET_LOADING_ALL(state, status) {
    state.loadingAll = status;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_ERROR_ALL(state, error) {
    state.errorAll = error;
  },
  SET_SUBMITTING(state, status) {
    state.submitting = status;
  },
  ADD_COMMENT(state, comment) {
    state.comments.unshift(comment);
  },
  REMOVE_COMMENT(state, commentId) {
    // Xử lý trường hợp comment có dạng string hoặc number
    const id = String(commentId);
    
    // Xóa từ comments cho bài viết hiện tại
    state.comments = state.comments.filter(c => {
      const cid = String(c.comment_id || c.id);
      return cid !== id;
    });
    
    // Xóa khỏi allComments nếu có
    const index = state.allComments.findIndex(c => {
      const cid = String(c.comment_id || c.id);
      return cid === id;
    });
    
    if (index !== -1) {
      state.allComments.splice(index, 1);
      if (state.pagination) {
        state.pagination.totalComments = Math.max(0, state.pagination.totalComments - 1);
      }
    }
  },
  CLEAR_COMMENTS(state) {
    state.comments = [];
    state.error = null;
  },
  CLEAR_ALL_COMMENTS(state) { // Mutation mới
      state.allComments = [];
      state.errorAll = null;
      state.pagination = { currentPage: 1, totalPages: 1, totalComments: 0 };
  },
  CLEAR_ERROR(state) {
    state.error = null;
  }
};

// Actions
const actions = {
  // Lấy danh sách comments của một bài viết
  async fetchComments({ commit, dispatch }, postId) {
    if (!postId) return [];
    
    try {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      commit('CLEAR_COMMENTS'); // Clear comments cũ trước khi fetch
      
      const response = await api.getCommentsByPostId(postId);
      
      // Xử lý response từ API
      let comments = [];
      if (response?.data) {
        // Kiểm tra các dạng response có thể có
        if (Array.isArray(response.data)) {
          comments = response.data;
        } else if (response.data.comments && Array.isArray(response.data.comments)) {
          comments = response.data.comments;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          comments = response.data.data;
        }
        
        // Chuẩn hóa dữ liệu comment
        comments = comments.map(comment => ({
          ...comment,
          comment_id: comment.comment_id || comment.id,
          user_id: comment.user_id || comment.userId,
          username: comment.username || comment.user?.username || 'Người dùng',
          avatar: comment.avatar || comment.user?.avatar || null,
          created_at: comment.created_at || comment.createdAt || new Date().toISOString()
        }));
      }
      
      commit('SET_COMMENTS', comments);
      
      // Cập nhật số lượng comment cho bài viết
      if (postId) {
        dispatch('post/updatePostCommentCount', {
          postId,
          count: comments.length
        }, { root: true });
      }
      
      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tải bình luận. Vui lòng thử lại sau.';
      commit('SET_ERROR', errorMessage);
      dispatch('showErrorToast', errorMessage, { root: true });
      return [];
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Lấy tất cả comments cho trang admin
  async fetchAllComments({ commit, dispatch }, { page = 1, limit = 20 } = {}) {
    try {
      commit('SET_LOADING_ALL', true);
      commit('SET_ERROR_ALL', null);
      
      const response = await api.getAllComments(page, limit);
      
      if (response?.data) {
        let comments = [];
        let pagination = {
          currentPage: page,
          totalPages: 1,
          totalComments: 0
        };
        
        // Xử lý các dạng response có thể có
        if (response.data.comments && Array.isArray(response.data.comments)) {
          comments = response.data.comments;
          if (response.data.pagination) {
            pagination = {
              ...pagination,
              ...response.data.pagination
            };
          }
        } else if (response.data.data && Array.isArray(response.data.data)) {
          comments = response.data.data;
          if (response.data.meta) {
            pagination = {
              currentPage: response.data.meta.current_page || page,
              totalPages: response.data.meta.last_page || 1,
              totalComments: response.data.meta.total || comments.length
            };
          }
        } else if (Array.isArray(response.data)) {
          comments = response.data;
        }
        
        // Chuẩn hóa dữ liệu
        comments = comments.map(comment => ({
          ...comment,
          comment_id: comment.comment_id || comment.id,
          user_id: comment.user_id || comment.userId,
          username: comment.username || comment.user?.username || 'Người dùng',
          avatar: comment.avatar || comment.user?.avatar || null,
          created_at: comment.created_at || comment.createdAt || new Date().toISOString()
        }));
        
        commit('SET_ALL_COMMENTS', { comments, pagination });
        return comments;
      }
      return [];
    } catch (error) {
      console.error('Error fetching all comments:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tải danh sách bình luận.';
      commit('SET_ERROR_ALL', errorMessage);
      dispatch('showErrorToast', errorMessage, { root: true });
      return [];
    } finally {
      commit('SET_LOADING_ALL', false);
    }
  },
  
  // Tạo comment mới
  async createComment({ commit, dispatch, rootState }, { postId, content }) {
    if (!content?.trim()) {
      dispatch('showErrorToast', 'Nội dung bình luận không được để trống', { root: true });
      return false;
    }
    
    commit('SET_SUBMITTING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await api.addComment(postId, content.trim());
      
      if (response?.data) {
        // Lấy comment từ response
        let newComment = response.data.comment || response.data.data || response.data;
        
        // Chuẩn hóa dữ liệu comment mới
        newComment = {
          ...newComment,
          comment_id: newComment.comment_id || newComment.id,
          post_id: postId,
          content: content.trim(),
          created_at: newComment.created_at || newComment.createdAt || new Date().toISOString(),
          user_id: newComment.user_id || newComment.userId || rootState.auth.user?.id,
          username: newComment.username || rootState.auth.user?.username || 'Người dùng',
          avatar: newComment.avatar || rootState.auth.user?.avatar || null
        };
        
        commit('ADD_COMMENT', newComment);
        
        // Cập nhật số lượng comment cho bài viết
        const currentCount = rootState.comment.comments.length;
        await dispatch('post/updatePostCommentCount', {
          postId,
          count: currentCount
        }, { root: true });
        
        dispatch('showSuccessToast', 'Đã đăng bình luận thành công!', { root: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating comment:', error);
      const errorMessage = error.response?.data?.message || 'Không thể đăng bình luận.';
      commit('SET_ERROR', errorMessage);
      dispatch('showErrorToast', errorMessage, { root: true });
      return false;
    } finally {
      commit('SET_SUBMITTING', false);
    }
  },
  
  // Xóa comment
  async deleteComment({ commit, dispatch, state }, commentId) {
    try {
      // Tìm comment để biết post_id trước khi xóa
      const comment = state.comments.find(c => String(c.comment_id || c.id) === String(commentId)) || 
                      state.allComments.find(c => String(c.comment_id || c.id) === String(commentId));
      const postId = comment ? comment.post_id : null;
      
      // Xóa comment khỏi state trước để UI phản hồi nhanh (optimistic UI)
      commit('REMOVE_COMMENT', commentId);
      
      try {
        // Thực hiện API call để xóa comment
        const response = await api.deleteComment(commentId);
        
        // Nếu API call thành công
        if (response?.status === 204 || response?.status === 200 || response?.data?.success) {
          // Cập nhật số lượng comment cho bài viết
          const targetPostId = response?.data?.post_id || postId;
          if (targetPostId) {
            // Đếm lại số lượng bình luận của bài viết
            let currentCommentCount = 0;
            
            // Đếm từ state.comments nếu đang xem chi tiết bài viết
            if (state.comments.length > 0) {
              currentCommentCount = state.comments.filter(c => 
                String(c.post_id) === String(targetPostId)
              ).length;
            } else {
              // Nếu không, thử lấy lại số lượng bình luận từ API
              try {
                const commentsResponse = await api.getCommentsByPostId(targetPostId);
                if (commentsResponse?.data) {
                  let comments = [];
                  if (Array.isArray(commentsResponse.data)) {
                    comments = commentsResponse.data;
                  } else if (commentsResponse.data.comments && Array.isArray(commentsResponse.data.comments)) {
                    comments = commentsResponse.data.comments;
                  } else if (commentsResponse.data.data && Array.isArray(commentsResponse.data.data)) {
                    comments = commentsResponse.data.data;
                  }
                  currentCommentCount = comments.length;
                }
              } catch (err) {
                console.error(`Error fetching comments for post ${targetPostId}:`, err);
                // Nếu API lỗi, tính gần đúng số lượng hiện tại từ allComments
                currentCommentCount = state.allComments.filter(c => 
                  String(c.post_id) === String(targetPostId)
                ).length;
              }
            }
            
            // Cập nhật số lượng bình luận trong store
            await dispatch('post/updatePostCommentCount', {
              postId: targetPostId,
              count: currentCommentCount
            }, { root: true });
            
            // Cập nhật tổng số bình luận trong admin dashboard
            try {
              await dispatch('post/decrementTotalCommentCount', {}, { root: true });
            } catch (dashboardError) {
              console.error('Error updating dashboard comment count:', dashboardError);
            }
          }
          
          // Hiển thị thông báo thành công
          dispatch('showSuccessToast', 'Xóa bình luận thành công!', { root: true });
          return true;
        } else {
          throw new Error('Xóa bình luận không thành công');
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        const errorMessage = error.response?.data?.message || 'Không thể xóa bình luận.';
        
        if (comment) {
          // Thêm lại comment vào state nếu xóa không thành công
          commit('ADD_COMMENT', comment);
        }
        
        dispatch('showErrorToast', errorMessage, { root: true });
        return false;
      }
    } catch (error) {
      console.error('Error in deleteComment action:', error);
      dispatch('showErrorToast', 'Lỗi xử lý xóa bình luận.', { root: true });
      return false;
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};