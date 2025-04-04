// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// Admin Views
const AdminDashboard = () => import('@/components/views/admin/AdminDashboard.vue');
const AdminPosts = () => import('@/components/views/admin/AdminPosts.vue');
const AdminComments = () => import('@/components/views/admin/AdminComments.vue');
const AdminLikes = () => import('@/components/views/admin/AdminLikes.vue');
const AdminCreatePost = () => import('@/components/views/admin/AdminCreatePost.vue');

// User Views
const HomePage = () => import('@/components/views/user/HomePage.vue');
const BlogListPage = () => import('@/components/views/user/BlogListPage.vue');
const PostDetailPage = () => import('@/components/views/user/PostDetailPage.vue');
const AboutPage = () => import('@/components/views/user/AboutPage.vue');
const ContactPage = () => import('@/components/views/user/ContactPage.vue');
const LoginPage = () => import('@/components/views/user/LoginPage.vue');
const RegisterPage = () => import('@/components/views/user/RegisterPage.vue');
const NotFoundPage = () => import('@/components/views/user/NotFoundPage.vue');
const AccountSettings = () => import('@/views/AccountSettings.vue');

const routes = [
  // Auth routes
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { guestOnly: true }
  },
  
  // Default route - redirects to login
  {
    path: '/',
    redirect: { name: 'Login' }
  },
  
  // User routes
  {
    path: '/home',
    name: 'HomePage',
    component: HomePage,
    meta: { requiresAuth: false }
  },
  {
    path: '/blog',
    name: 'BlogList',
    component: BlogListPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetailPage,
    props: true,
    meta: { requiresAuth: false }
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: ContactPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/account',
    name: 'AccountSettings',
    component: AccountSettings,
    meta: { requiresAuth: true }
  },
  
  // Admin routes
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/posts',
    name: 'AdminPosts',
    component: AdminPosts,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/comments',
    name: 'AdminComments',
    component: AdminComments,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/likes',
    name: 'AdminLikes',
    component: AdminLikes,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/create-post',
    name: 'AdminCreatePost',
    component: AdminCreatePost,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/edit-post/:id',
    name: 'AdminEditPost',
    component: AdminCreatePost,
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  
  // 404 Not Found
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL || '/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  // Xóa trạng thái xác thực cũ nếu token không hợp lệ
  const token = localStorage.getItem('token');
  const isAuthenticated = token !== null;
  
  // Lấy thông tin người dùng từ localStorage
  let userRole = 'user';
  if (isAuthenticated) {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData.role) {
        userRole = userData.role;
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      // Nếu có lỗi khi parse thông tin người dùng, xóa token và chuyển hướng đến trang đăng nhập
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      next({ name: 'Login' });
      return;
    }
  }
  
  // Nếu route yêu cầu xác thực và người dùng chưa đăng nhập
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
    return;
  } 
  
  // Nếu route yêu cầu quyền admin và người dùng không phải admin
  if (to.matched.some(record => record.meta.requiresAdmin) && userRole !== 'admin') {
    next({ name: 'HomePage' });
    return;
  } 
  
  // Nếu route chỉ dành cho khách (chưa đăng nhập) và người dùng đã đăng nhập
  if (to.matched.some(record => record.meta.guestOnly) && isAuthenticated) {
    if (userRole === 'admin') {
      next({ name: 'AdminDashboard' });
    } else {
      next({ name: 'HomePage' });
    }
    return;
  }
  
  // Các trường hợp khác
  next();
});

export default router;