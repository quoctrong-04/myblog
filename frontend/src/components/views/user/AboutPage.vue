<template>
  <div class="about-page">
    <div class="container py-5">
      <!-- Header Section -->
      <div class="text-center mb-5">
        <h1 class="display-4 fw-bold text-gradient mb-4">Về Tôi</h1>
        <div class="subtitle">Lập trình viên Full-stack & Người chia sẻ kiến thức</div>
      </div>

      <!-- Main Content -->
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Introduction Card -->
          <div class="content-card mb-5">
            <div class="card-icon">
              <font-awesome-icon :icon="['fas', 'user-code']" />
            </div>
            <h2>Giới thiệu</h2>
            <p class="lead">
              Xin chào! Tôi là một lập trình viên đam mê công nghệ và phát triển phần mềm. 
              Blog này là nơi tôi chia sẻ kiến thức, kinh nghiệm và những insight về lập trình 
              và công nghệ thông tin.
            </p>
          </div>

          <!-- Skills Section -->
          <div class="content-card mb-5">
            <div class="card-icon">
              <font-awesome-icon :icon="['fas', 'laptop-code']" />
            </div>
            <h2>Kỹ năng chuyên môn</h2>
            <div class="skills-container">
              <!-- Backend -->
              <div class="skill-category">
                <h3>Backend Development</h3>
                <div class="skill-items">
                  <div class="skill-item">
                    <font-awesome-icon :icon="['fab', 'node-js']" class="text-success" />
                    <span>Node.js</span>
                  </div>
                  <div class="skill-item">
                    <font-awesome-icon :icon="['fab', 'python']" class="text-primary" />
                    <span>Python</span>
                  </div>
                  <div class="skill-item">
                    <font-awesome-icon :icon="['fab', 'java']" class="text-danger" />
                    <span>Java</span>
                  </div>
                  <div class="skill-item">
                    <i class="devicon-csharp-plain colored"></i>
                    <span>C#</span>
                  </div>
                </div>
              </div>

              <!-- Frontend -->
              <div class="skill-category">
                <h3>Frontend Development</h3>
                <div class="skill-items">
                  <div class="skill-item">
                    <font-awesome-icon :icon="['fab', 'vuejs']" class="text-success" />
                    <span>Vue.js</span>
                  </div>
                  <div class="skill-item">
                    <font-awesome-icon :icon="['fab', 'html5']" class="text-danger" />
                    <span>HTML5</span>
                  </div>
                  <div class="skill-item">
                    <font-awesome-icon :icon="['fab', 'css3']" class="text-primary" />
                    <span>CSS3</span>
                  </div>
                  <div class="skill-item">
                    <font-awesome-icon :icon="['fab', 'js']" class="text-warning" />
                    <span>JavaScript</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Connect Section -->
          <div class="content-card">
            <div class="card-icon">
              <font-awesome-icon :icon="['fas', 'network-wired']" />
            </div>
            <h2>Kết nối với tôi</h2>
            <div class="social-links">
              <a href="mailto:your.email@example.com" class="social-link">
                <font-awesome-icon :icon="['fas', 'envelope']" />
                <span>Email</span>
              </a>
              <a href="https://github.com/yourusername" target="_blank" class="social-link">
                <font-awesome-icon :icon="['fab', 'github']" />
                <span>GitHub</span>
              </a>
              <a href="https://linkedin.com/in/yourusername" target="_blank" class="social-link">
                <font-awesome-icon :icon="['fab', 'linkedin']" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component logic here
</script>

<style scoped>
.about-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  min-height: 100vh;
}

.text-gradient {
  background: linear-gradient(120deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 1.2rem;
  color: #6c757d;
  font-weight: 500;
}

.content-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.content-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #3498db, #2ecc71);
}

.card-icon {
  font-size: 2rem;
  color: #3498db;
  margin-bottom: 1rem;
}

.skills-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.skill-category h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 600;
}

.skill-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 25px;
  font-size: 0.9rem;
  color: #2c3e50;
  transition: transform 0.2s;
}

.skill-item:hover {
  transform: translateY(-2px);
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  color: #2c3e50;
  text-decoration: none;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.social-link:hover {
  background: #3498db;
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .content-card {
    padding: 1.5rem;
  }

  .social-links {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .social-link {
    justify-content: center;
  }
}
</style>