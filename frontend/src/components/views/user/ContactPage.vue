<template>
    <div class="contact-page">
      <div class="container py-5">
        <!-- Header Section -->
        <div class="text-center mb-5">
          <h1 class="display-4 fw-bold text-gradient mb-4">Liên Hệ</h1>
          <p class="lead text-muted">
            Hãy kết nối với tôi để trao đổi về công nghệ, dự án hoặc cơ hội hợp tác
          </p>
        </div>
  
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <!-- Contact Cards -->
            <div class="row mb-5">
              <!-- Email Card -->
              <div class="col-md-6 mb-4">
                <div class="contact-card">
                  <div class="card-icon">
                    <font-awesome-icon :icon="['fas', 'envelope']" />
                  </div>
                  <h3>Email</h3>
                  <p>your.email@example.com</p>
                  <a href="mailto:your.email@example.com" class="btn btn-outline-primary">
                    Gửi email
                  </a>
                </div>
              </div>
  
              <!-- Social Media Card -->
              <div class="col-md-6 mb-4">
                <div class="contact-card">
                  <div class="card-icon">
                    <font-awesome-icon :icon="['fas', 'share-nodes']" />
                  </div>
                  <h3>Mạng xã hội</h3>
                  <div class="social-links">
                    <a href="https://github.com/yourusername" target="_blank" class="social-link">
                      <font-awesome-icon :icon="['fab', 'github']" />
                    </a>
                    <a href="https://linkedin.com/in/yourusername" target="_blank" class="social-link">
                      <font-awesome-icon :icon="['fab', 'linkedin']" />
                    </a>
                    <a href="https://twitter.com/yourusername" target="_blank" class="social-link">
                      <font-awesome-icon :icon="['fab', 'twitter']" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Contact Form -->
            <div class="content-card">
              <div class="card-icon mb-4">
                <font-awesome-icon :icon="['fas', 'paper-plane']" />
              </div>
              <h2 class="text-center mb-4">Gửi tin nhắn</h2>
              
              <form @submit.prevent="handleContactSubmit" class="contact-form">
                <div class="form-floating mb-3">
                  <input 
                    type="text" 
                    class="form-control" 
                    id="contactName" 
                    placeholder="Họ và tên"
                    required 
                    v-model="contactForm.name"
                  >
                  <label for="contactName">Họ và tên</label>
                </div>
  
                <div class="form-floating mb-3">
                  <input 
                    type="email" 
                    class="form-control" 
                    id="contactEmail" 
                    placeholder="name@example.com"
                    required 
                    v-model="contactForm.email"
                  >
                  <label for="contactEmail">Email</label>
                </div>
  
                <div class="form-floating mb-4">
                  <textarea 
                    class="form-control" 
                    id="contactMessage" 
                    placeholder="Nội dung tin nhắn"
                    style="height: 150px"
                    required 
                    v-model="contactForm.message"
                  ></textarea>
                  <label for="contactMessage">Nội dung tin nhắn</label>
                </div>
  
                <div class="text-center">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg"
                    :disabled="submitting"
                  >
                    <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    {{ submitting ? 'Đang gửi...' : 'Gửi tin nhắn' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useStore } from 'vuex';
  
  const store = useStore();
  const submitting = ref(false);
  const contactForm = ref({
    name: '',
    email: '',
    message: ''
  });
  
  const handleContactSubmit = async () => {
    submitting.value = true;
    try {
      // Giả lập gửi form
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hiển thị thông báo thành công
      store.dispatch('showSuccessToast', 'Tin nhắn của bạn đã được gửi thành công!', { root: true });
      
      // Reset form
      contactForm.value = {
        name: '',
        email: '',
        message: ''
      };
    } catch (error) {
      store.dispatch('showErrorToast', 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.', { root: true });
    } finally {
      submitting.value = false;
    }
  };
  </script>
  
  <style scoped>
  .contact-page {
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
    min-height: 100vh;
  }
  
  .text-gradient {
    background: linear-gradient(120deg, #2c3e50, #3498db);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .contact-card {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    height: 100%;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }
  
  .contact-card:hover {
    transform: translateY(-5px);
  }
  
  .content-card {
    background: white;
    border-radius: 15px;
    padding: 2.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
  
  .card-icon {
    font-size: 2rem;
    color: #3498db;
    margin-bottom: 1rem;
  }
  
  .social-links {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .social-link {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f8f9fa;
    color: #2c3e50;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: all 0.3s ease;
  }
  
  .social-link:hover {
    background: #3498db;
    color: white;
    transform: translateY(-2px);
  }
  
  .contact-form .form-control {
    border: 2px solid #e9ecef;
    border-radius: 10px;
    padding: 1rem;
  }
  
  .contact-form .form-control:focus {
    border-color: #3498db;
    box-shadow: none;
  }
  
  .contact-form .form-floating label {
    padding: 1rem;
  }
  
  .btn-primary {
    background: linear-gradient(90deg, #3498db, #2ecc71);
    border: none;
    padding: 0.8rem 2rem;
    border-radius: 25px;
    font-weight: 500;
    transition: all 0.3s ease;
  }
  
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
  }
  
  .btn-outline-primary {
    border: 2px solid #3498db;
    color: #3498db;
    border-radius: 25px;
    padding: 0.5rem 1.5rem;
    transition: all 0.3s ease;
  }
  
  .btn-outline-primary:hover {
    background: #3498db;
    color: white;
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    .content-card {
      padding: 1.5rem;
    }
    
    .contact-card {
      padding: 1.5rem;
    }
  }
  </style>