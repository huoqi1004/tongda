import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken && config.url?.startsWith('/admin')) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 仅在确认是"未授权/令牌失效"时清理 token，避免 404/500 等业务错误误清
    const status = err.response?.status;
    const msg = err.response?.data?.message || '';
    const isAuthFail = status === 401 || (status === 403 && /登录|令牌|权限|登录失效/.test(msg));
    if (isAuthFail) {
      if (err.config.url?.startsWith('/admin')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(err);
  }
);

export default api;