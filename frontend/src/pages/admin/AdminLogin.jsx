import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, User, LogIn } from 'lucide-react'
import api from '../../api'

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('adminToken')) navigate('/admin/dashboard', { replace: true })
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/admin/login', form)
      localStorage.setItem('adminToken', res.data.data.token)
      localStorage.setItem('adminUser', JSON.stringify(res.data.data.admin))
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || '登录失败')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-td-red rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">通</span>
          </div>
          <h1 className="text-2xl font-bold text-td-dark">管理员登录</h1>
          <p className="text-td-gray text-sm mt-1">通达丝网后台管理系统</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-td-dark mb-1.5">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required placeholder="请输入管理员用户名" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-td-dark mb-1.5">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="请输入密码" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/admin/forgot-password" className="text-xs text-td-red hover:underline">忘记密码？</Link>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-td-red text-white rounded-lg font-medium hover:bg-td-red-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" /> {loading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}