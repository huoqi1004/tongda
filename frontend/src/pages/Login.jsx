import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle, ShieldQuestion } from 'lucide-react'
import api from '../api'
import useAuthStore from '../store/useAuthStore'

export default function Login() {
  const [tab, setTab] = useState('login') // login, register
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])

  // 表单状态
  const [loginForm, setLoginForm] = useState({ phoneOrEmail: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ 
    phoneOrEmail: '', 
    nickname: '', 
    password: '', 
    confirmPassword: '', 
    agreeTerms: false,
    securityQuestion: '',
    securityAnswer: ''
  })
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, errors: [] })

  // 获取密保问题列表
  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/security-questions')
      if (res.data.code === 0) {
        setQuestions(res.data.data)
      }
    } catch (err) {
      console.error('获取密保问题失败:', err)
    }
  }

  // 密码强度验证
  const validatePasswordStrength = (password) => {
    const errors = []
    let score = 0

    if (password.length < 8) errors.push('至少8位')
    else score += 25

    if (/[A-Z]/.test(password)) score += 25
    else if (password.length >= 8) errors.push('包含大写字母')

    if (/[a-z]/.test(password)) score += 25
    else if (password.length >= 8) errors.push('包含小写字母')

    if (/\d/.test(password)) score += 25
    else if (password.length >= 8) errors.push('包含数字')

    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 10

    setPasswordStrength({ score: Math.min(score, 100), errors })
    return errors.length === 0 && score >= 75
  }

  // 用户密码登录
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', loginForm)
      useAuthStore.setAuth(res.data.data.user, res.data.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || '登录失败，请检查账号密码')
    } finally {
      setLoading(false)
    }
  }

  // 用户注册
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!registerForm.agreeTerms) {
      setError('请先同意用户协议和隐私政策')
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    const isValid = validatePasswordStrength(registerForm.password)
    if (!isValid) {
      setError(`密码不符合要求: ${passwordStrength.errors.join('、')}`)
      return
    }

    if (!registerForm.securityQuestion) {
      setError('请选择密保问题')
      return
    }

    if (!registerForm.securityAnswer || !registerForm.securityAnswer.trim()) {
      setError('请填写密保答案')
      return
    }

    setLoading(true)
    try {
      // 先注册用户
      const res = await api.post('/auth/register', {
        phoneOrEmail: registerForm.phoneOrEmail,
        password: registerForm.password,
        nickname: registerForm.nickname,
      })

      // 注册成功后设置密保问题
      if (res.data.code === 0 && res.data.data.user?.id) {
        await api.post('/security-questions/set', {
          userId: res.data.data.user.id,
          questionId: parseInt(registerForm.securityQuestion),
          answer: registerForm.securityAnswer.trim()
        })
      }

      useAuthStore.setAuth(res.data.data.user, res.data.data.token)
      setSuccess('注册成功！')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 密码强度指示器
  const getStrengthColor = (score) => {
    if (score < 50) return 'bg-red-500'
    if (score < 75) return 'bg-yellow-500'
    return 'bg-green-500'
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
          {/* 主Tab切换 */}
          <div className="flex bg-td-bg rounded-lg p-1 mb-6">
            <button onClick={() => { setTab('login'); setError('') }} className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${tab === 'login' ? 'bg-white text-td-dark shadow-sm' : 'text-td-gray hover:text-td-dark'}`}>登录</button>
            <button onClick={() => { setTab('register'); setError('') }} className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors ${tab === 'register' ? 'bg-white text-td-dark shadow-sm' : 'text-td-gray hover:text-td-dark'}`}>注册</button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4 flex items-start">
              <AlertCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3 mb-4 flex items-start">
              <CheckCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
              <span>{success}</span>
            </div>
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
              <div className="flex justify-between items-center">
                <Link to="/forgot-password" className="text-xs text-td-red hover:underline">忘记密码？</Link>
                <span className="text-xs text-td-gray">登录即同意用户协议和隐私政策</span>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-td-red text-white rounded-lg font-medium hover:bg-td-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? '登录中...' : '登录'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">手机号/邮箱</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                  <input type="text" value={registerForm.phoneOrEmail} onChange={(e) => setRegisterForm({ ...registerForm, phoneOrEmail: e.target.value })} required placeholder="请输入手机号或邮箱" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
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
                  <input type={showPwd ? 'text' : 'password'} value={registerForm.password} onChange={(e) => {
                    setRegisterForm({ ...registerForm, password: e.target.value })
                    validatePasswordStrength(e.target.value)
                  }} required placeholder="请输入密码（不少于8位，包含大小写字母、数字、特殊字符）" className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-td-silver hover:text-td-gray">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* 密码强度指示器 */}
                {registerForm.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-td-gray">密码强度</span>
                      <span className="text-xs text-td-gray">{passwordStrength.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`${getStrengthColor(passwordStrength.score)} h-2 rounded-full transition-all duration-300`} style={{ width: `${passwordStrength.score}%` }}></div>
                    </div>
                    {passwordStrength.errors.length > 0 && (
                      <p className="text-xs text-red-500 mt-1">
                        还需: {passwordStrength.errors.join('、')}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                  <input type={showPwd ? 'text' : 'password'} value={registerForm.confirmPassword} onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })} required placeholder="请再次输入密码" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
                </div>
              </div>
              
              {/* 密保问题设置 */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldQuestion className="w-4 h-4 text-td-red" />
                  <span className="text-sm font-medium text-td-dark">设置密保问题（用于密码找回）</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-td-gray mb-1">选择密保问题</label>
                    <select
                      value={registerForm.securityQuestion}
                      onChange={(e) => setRegisterForm({ ...registerForm, securityQuestion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm"
                      required
                    >
                      <option value="">请选择密保问题</option>
                      {questions.map((q) => (
                        <option key={q.id} value={q.id}>{q.question}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-td-gray mb-1">密保答案</label>
                    <input
                      type="text"
                      value={registerForm.securityAnswer}
                      onChange={(e) => setRegisterForm({ ...registerForm, securityAnswer: e.target.value })}
                      placeholder="请输入您的答案"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm"
                      required
                    />
                    <p className="text-xs text-td-silver mt-1">请牢记您的答案，找回密码时需要验证</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <input type="checkbox" checked={registerForm.agreeTerms} onChange={(e) => setRegisterForm({ ...registerForm, agreeTerms: e.target.checked })} className="mt-1 mr-2" required />
                <span className="text-xs text-td-gray">我已阅读并同意 <span className="text-td-red cursor-pointer">《用户协议》</span> 和 <span className="text-td-red cursor-pointer">《隐私政策》</span></span>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-td-red text-white rounded-lg font-medium hover:bg-td-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? '注册中...' : '注册'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/admin/login" className="text-xs text-td-gray hover:text-td-red">管理员登录 →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
