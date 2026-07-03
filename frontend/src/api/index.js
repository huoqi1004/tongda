import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');
  // 凡是管理员端的请求（admin/、knowledge/、security-questions/）都用 adminToken
  // config.url 经 baseURL 拼接后是 "/api/admin/..." 或 "/api/knowledge/..." 等
  const isAdminPath = /^\/(admin|knowledge|security-questions)(\/|$)/.test(config.url || '');
  if (adminToken && isAdminPath) {
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
      const reqUrl = err.config?.url || '';
      if (reqUrl.startsWith('/admin') || reqUrl.startsWith('/knowledge') || reqUrl.startsWith('/security-questions')) {
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