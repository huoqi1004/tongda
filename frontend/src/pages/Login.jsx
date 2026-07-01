import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, Lock, User, Eye, EyeOff } from 'lucide-react'
import api from '../api'
import useAuthStore from '../store/useAuthStore'

export default function Login() {
  const [tab, setTab] = useState('login')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const [loginForm, setLoginForm] = useState({ phoneOrEmail: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ phoneOrEmail: '', password: '', confirmPassword: '', nickname: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', loginForm)
      useAuthStore.setAuth(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || '登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (registerForm.password.length < 6) {
      setError('密码长度不能少于6位')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        phoneOrEmail: registerForm.phoneOrEmail,
        password: registerForm.password,
        nickname: registerForm.nickname,
      })
      useAuthStore.setAuth(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-td-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-td-red rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">通</span>
          </div>
          <h1 className="text-2xl font-bold text-td-dark">通达丝网</h1>
          <p className="text-td-gray text-sm mt-1">专业金属丝网与工程防护</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Tab Switch */}
          <div className="flex bg-td-bg rounded-lg p-1 mb-6">
            <button onClick={() => { setTab('login'); setError('') }} className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${tab === 'login' ? 'bg-white text-td-dark shadow-sm' : 'text-td-gray hover:text-td-dark'}`}>登录</button>
            <button onClick={() => { setTab('register'); setError('') }} className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${tab === 'register' ? 'bg-white text-td-dark shadow-sm' : 'text-td-gray hover:text-td-dark'}`}>注册</button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">手机号/邮箱</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                  <input type="text" value={loginForm.phoneOrEmail} onChange={(e) => setLoginForm({ ...loginForm, phoneOrEmail: e.target.value })} required placeholder="请输入手机号或邮箱" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                  <input type={showPwd ? 'text' : 'password'} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required placeholder="请输入密码" className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-td-silver hover:text-td-gray">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-td-red hover:underline">忘记密码？</Link>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-td-red text-white rounded-lg font-medium hover:bg-td-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? '登录中...' : '登录'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">手机号</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                  <input type="text" value={registerForm.phoneOrEmail} onChange={(e) => setRegisterForm({ ...registerForm, phoneOrEmail: e.target.value })} required placeholder="请输入手机号" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">昵称</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                  <input type="text" value={registerForm.nickname} onChange={(e) => setRegisterForm({ ...registerForm, nickname: e.target.value })} required placeholder="请输入您的昵称" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                  <input type={showPwd ? 'text' : 'password'} value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required placeholder="请输入密码（不少于6位）" className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-td-silver hover:text-td-gray">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                  <input type={showPwd ? 'text' : 'password'} value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} required placeholder="请再次输入密码" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-td-red text-white rounded-lg font-medium hover:bg-td-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? '注册中...' : '注册'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}