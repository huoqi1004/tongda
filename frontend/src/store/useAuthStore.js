let listeners = [];
// 容错：localStorage 里可能存了字符串 "undefined"（之前 setAuth(undefined) 留下的脏数据）
const safeParse = (key) => {
  const raw = localStorage.getItem(key)
  if (!raw || raw === 'undefined' || raw === 'null') return null
  try { return JSON.parse(raw) } catch { return null }
}
let state = {
  user: safeParse('user'),
  token: localStorage.getItem('token') && localStorage.getItem('token') !== 'undefined'
    ? localStorage.getItem('token') : null,
}

const useAuthStore = {
  getState: () => state,
  subscribe: (fn) => {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  },
  setState: (newState) => {
    state = { ...state, ...newState };
    listeners.forEach(fn => fn(state));
  },
  setAuth: (user, token) => {
    // 容错：避免把 undefined 序列化成字符串 "undefined" 写入 localStorage
    if (user !== undefined) localStorage.setItem('user', JSON.stringify(user))
    if (token !== undefined && token !== null) localStorage.setItem('token', token)
    state = { ...state, user: user ?? state.user, token: token ?? state.token };
    listeners.forEach(fn => fn(state));
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    state = { ...state, user: null, token: null };
    listeners.forEach(fn => fn(state));
  },
};

export default useAuthStore;