<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <!-- Sidebar -->
      <div class="col-md-3 col-lg-2 d-md-block bg-light sidebar py-3">
        <div class="position-sticky">
          <ul class="nav flex-column">
            <li class="nav-item">
              <router-link class="nav-link" :to="{ name: 'AdminDashboard' }">
                <i class="fas fa-chart-line me-2"></i>
                Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :to="{ name: 'AdminPosts' }">
                <i class="fas fa-newspaper me-2"></i>
                Quản lý bài viết
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :to="{ name: 'AdminComments' }">
                <i class="fas fa-comments me-2"></i>
                Quản lý bình luận
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" :to="{ name: 'AdminLikes' }">
                <i class="fas fa-heart me-2"></i>
                Quản lý lượt thích
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link active" :to="{ name: 'AdminCreatePost' }">
                <i class="fas fa-plus-circle me-2"></i>
                Đăng bài mới
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- Main content -->
      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
          <h1 class="h2">{{ isEditMode ? 'Chỉnh sửa bài viết' : 'Đăng bài mới' }}</h1>
          <div class="btn-toolbar mb-2 mb-md-0">
            <router-link :to="{ name: 'AdminPosts' }" class="btn btn-sm btn-outline-secondary">
              <i class="fas fa-arrow-left me-1"></i> Quay lại danh sách
            </router-link>
          </div>
        </div>

        <!-- Post form -->
        <div class="card shadow mb-4">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">{{ isEditMode ? 'Thông tin bài viết cần sửa' : 'Thông tin bài viết mới' }}</h6>
          </div>
          <div class="card-body">
            <form @submit.prevent="savePost" class="needs-validation" novalidate>
              <!-- Title -->
              <div class="mb-4">
                <label for="postTitle" class="form-label">Tiêu đề <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="postTitle" 
                  v-model="post.title" 
                  required
                  placeholder="Nhập tiêu đề bài viết..."
                  :class="{ 'is-invalid': titleError }"
                >
                <div class="invalid-feedback" v-if="titleError">
                  {{ titleError }}
                </div>
              </div>

              <!-- Content -->
              <div class="mb-4">
                <label for="content" class="form-label">Nội dung <span class="text-danger">*</span></label>
                <textarea 
                  id="content" 
                  class="form-control" 
                  v-model="post.content"
                  rows="10"
                  placeholder="Viết nội dung bài viết của bạn tại đây..."
                  :class="{ 'is-invalid': contentError }"
                ></textarea>
                <div class="invalid-feedback" v-if="contentError">
                  {{ contentError }}
                </div>
              </div>

              <!-- Image Upload -->
              <div class="mb-4">
                <label for="imageFile" class="form-label">Ảnh bài viết</label>
                <div class="input-group mb-3">
                  <input 
                    type="file" 
                    class="form-control" 
                    id="imageFile" 
                    accept="image/*"
                    @change="handleImageUpload"
                    ref="imageInput"
                  >
                  <button class="btn btn-outline-secondary" type="button" @click="resetImage">
                    <i class="fas fa-times"></i> Xóa
                  </button>
                </div>
                <div v-if="imagePreview" class="mt-2 text-center">
                  <img :src="imagePreview" class="img-thumbnail" style="max-height: 200px;" alt="Preview">
                  <p class="text-muted mt-1">{{ imageName }}</p>
                </div>
                <div v-if="imageError" class="text-danger small mt-1">
                  {{ imageError }}
                </div>
                <small class="text-muted">Hỗ trợ định dạng: JPG, PNG, GIF (tối đa 5MB)</small>
              </div>

              <div class="d-flex justify-content-between mt-4">
                <button type="button" class="btn btn-secondary" @click="resetForm">
                  <i class="fas fa-undo me-1"></i> Làm mới
                </button>
                <button type="submit" class="btn btn-primary" :disabled="loading">
                  <i class="fas fa-save me-1"></i> {{ loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật bài viết' : 'Tạo bài viết') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

// eslint-disable-next-line no-undef, no-unused-vars
const props = defineProps({
  id: {
    type: [String, Number],
    default: null
  }
});

const router = useRouter();
const store = useStore();
const loading = ref(false);
const isEditMode = computed(() => !!props.id);

// Form validation errors
const titleError = ref('');
const contentError = ref('');
const imageError = ref('');

// Image upload
const imageInput = ref(null);
const imageFile = ref(null);
const imagePreview = ref('');
const imageName = ref('');
const imageBase64 = ref('');

// Initialize post object
const post = reactive({
  title: '',
  content: '',
  image: ''
});

// Nếu là chế độ chỉnh sửa, tải dữ liệu bài viết khi component được tạo
onMounted(async () => {
  if (isEditMode.value) {
    await fetchPostData();
  }
});

// Hàm lấy dữ liệu bài viết để chỉnh sửa
const fetchPostData = async () => {
  loading.value = true;
  try {
    await store.dispatch('post/fetchPost', props.id);
    const postData = store.getters['post/currentPost'];
    
    if (postData) {
      console.log('Fetched post data:', postData);
      // Cập nhật dữ liệu bài viết
      post.title = postData.title || '';
      post.content = postData.content || '';
      post.image = postData.image || '';
      
      // Nếu có hình ảnh, hiển thị preview
      if (post.image) {
        if (post.image.startsWith('data:')) {
          // Nếu là base64 thì dùng trực tiếp
          imagePreview.value = post.image;
          imageBase64.value = post.image;
          imageName.value = 'Ảnh hiện tại';
        } else {
          // Nếu là đường dẫn file thì tạo URL
          imagePreview.value = getImageUrl(post.image);
          // Lấy tên file từ đường dẫn
          const fileName = post.image.split('/').pop();
          imageName.value = fileName || 'Ảnh hiện tại';
        }
      }
    } else {
      alert('Không tìm thấy bài viết!');
      router.push('/admin/posts');
    }
  } catch (error) {
    console.error('Error fetching post data:', error);
    alert('Có lỗi khi tải dữ liệu bài viết. Vui lòng thử lại sau.');
    router.push('/admin/posts');
  } finally {
    loading.value = false;
  }
};

// Helper function để hiển thị ảnh đúng
const getImageUrl = (imagePath) => {
  // Nếu path null/undefined, trả về ảnh placeholder
  if (!imagePath) {
    return '';
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
      return '';
    }
  }
  
  return '';
};

// Validate form
const validateForm = () => {
  let isValid = true;
  
  // Reset errors
  titleError.value = '';
  contentError.value = '';
  imageError.value = '';
  
  // Validate title
  if (!post.title.trim()) {
    titleError.value = 'Tiêu đề không được để trống';
    isValid = false;
  }
  
  // Validate content
  if (!post.content.trim()) {
    contentError.value = 'Nội dung không được để trống';
    isValid = false;
  }
  
  return isValid;
};

// Xử lý upload ảnh
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  imageError.value = '';
  
  if (!file) {
    resetImage();
    return;
  }
  
  // Kiểm tra định dạng file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    imageError.value = 'Định dạng không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG hoặc GIF';
    resetImage();
    return;
  }
  
  // Kiểm tra kích thước file (tối đa 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    imageError.value = 'Kích thước ảnh quá lớn. Tối đa 5MB';
    resetImage();
    return;
  }
  
  // Lưu thông tin file
  imageFile.value = file;
  imageName.value = file.name;
  
  // Hiển thị preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
    imageBase64.value = e.target.result;
    // Lưu dữ liệu ảnh vào đối tượng post
    post.image = imageBase64.value;
  };
  reader.readAsDataURL(file);
};

// Reset ảnh
const resetImage = () => {
  imageFile.value = null;
  imagePreview.value = '';
  imageName.value = '';
  imageBase64.value = '';
  post.image = '';
  if (imageInput.value) {
    imageInput.value.value = '';
  }
};

// Lưu bài viết
const savePost = async () => {
  if (!validateForm()) {
    return;
  }
  
  try {
    loading.value = true;
    console.log("Saving post in mode:", isEditMode.value ? "edit" : "create");
    
    // Tạo dữ liệu bài viết
    const postData = {
      title: post.title,
      content: post.content
    };
    
    // Chỉ gửi dữ liệu ảnh nếu đã thay đổi
    if (imageBase64.value) {
      postData.imageData = imageBase64.value;
    } else if (post.image) {
      // Nếu không có dữ liệu ảnh mới, giữ nguyên ảnh cũ
      postData.image = post.image;
    }
    
    console.log("Post data prepared:", { ...postData, imageData: postData.imageData ? '[base64 data]' : undefined });
    
    let result;
    
    // Xác định nếu là tạo mới hay cập nhật
    if (isEditMode.value) {
      // Cập nhật bài viết hiện có
      result = await store.dispatch('post/updatePost', { 
        postId: props.id, 
        postData 
      });
      console.log("Update result:", result);
      alert('Cập nhật bài viết thành công!');
    } else {
      // Tạo bài viết mới
      result = await store.dispatch('post/createPost', postData);
      console.log("Create result:", result);
      alert('Bài viết đã được tạo thành công!');
    }
    
    if (result) {
      router.push('/admin/posts');
    }
  } catch (error) {
    console.error('Error saving post:', error);
    alert(isEditMode.value ? 'Không thể cập nhật bài viết. Vui lòng thử lại sau.' : 'Không thể tạo bài viết. Vui lòng thử lại sau.');
  } finally {
    loading.value = false;
  }
};

// Reset form
const resetForm = () => {
  post.title = '';
  post.content = '';
  post.image = '';
  
  resetImage();
  
  // Reset errors
  titleError.value = '';
  contentError.value = '';
  imageError.value = '';
};
</script>

<style scoped>
.sidebar {
  position: sticky;
  top: 80px;
  height: calc(100vh - 80px);
  z-index: 100;
}

.nav-link {
  color: #333;
  border-radius: 5px;
  margin: 3px 0;
  padding: 10px;
}

.nav-link.active {
  background-color: #e1f0ff;
  color: #3498db;
  font-weight: bold;
}

.card {
  border-radius: 8px;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1);
  border: none;
}

.card-header {
  background-color: #f8f9fc;
  border-bottom: 1px solid #e3e6f0;
}

.text-primary {
  color: #4e73df !important;
}

.font-weight-bold {
  font-weight: 700 !important;
}
</style>