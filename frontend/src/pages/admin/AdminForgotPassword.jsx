import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Lock, ShieldCheck, ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import api from '../../api'

export default function AdminForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [username, setUsername] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    fetchQuestions()
  }, [])

  // 获取密保问题列表
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

  // 验证密保答案
  const verifyAnswer = async () => {
    if (!selectedQuestion || !answer.trim()) {
      setError('请选择密保问题并填写答案')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await api.post('/admin/security-questions/verify', {
        username: username.trim(),
        questionId: parseInt(selectedQuestion),
        answer: answer.trim()
      })

      if (res.data.code === 0) {
        setStep(1)
        setSuccess('验证成功，请设置新密码')
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError(res.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || '验证失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 提交密码重置
  const submitReset = async () => {
    if (!newPwd || !confirmPwd) {
      setError('请填写新密码和确认密码')
      return
    }
    if (newPwd !== confirmPwd) {
      setError('两次输入的密码不一致')
      return
    }

    // 强密码验证
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{12,}$/
    if (!passwordRegex.test(newPwd)) {
      setError('密码不符合要求：至少12位，包含大写字母、小写字母、数字和特殊字符')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await api.post('/admin/security-questions/reset', {
        username: username.trim(),
        questionId: parseInt(selectedQuestion),
        answer: answer.trim(),
        newPassword: newPwd
      })

      if (res.data.code === 0) {
        setSuccess('密码重置成功！正在跳转登录页...')
        setTimeout(() => navigate('/admin/login'), 1500)
      } else {
        setError(res.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || '重置失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 密码强度计算
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: 'bg-gray-200' }
    
    let score = 0
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score++
    
    if (score <= 2) return { level: 1, label: '弱', color: 'bg-red-500' }
    if (score <= 3) return { level: 2, label: '中', color: 'bg-yellow-500' }
    return { level: 3, label: '强', color: 'bg-green-500' }
  }

  const pwdStrength = getPasswordStrength(newPwd)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-td-red rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">通</span>
          </div>
          <h1 className="text-2xl font-bold text-td-dark">找回密码</h1>
          <p className="text-td-gray text-sm mt-1">通达丝网 · 管理员后台</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 步骤指示器 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                step === 0 ? 'bg-td-red text-white ring-4 ring-red-100' : 'bg-td-red text-white'
              }`}>
                {step > 0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : 1}
              </div>
              <div className={`mt-1.5 text-[10px] ${step >= 0 ? 'text-td-dark font-medium' : 'text-td-silver'}`}>
                验证身份
              </div>
            </div>
            <div className={`h-0.5 flex-1 mx-1 -mt-5 transition-colors ${step > 0 ? 'bg-td-red' : 'bg-gray-200'}`} />
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                step >= 1 ? 'bg-td-red text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div className={`mt-1.5 text-[10px] ${step >= 1 ? 'text-td-dark font-medium' : 'text-td-silver'}`}>
                重置密码
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2.5 mb-4 flex items-start">
              <AlertCircle className="w-3 h-3 mt-0.5 mr-1.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2.5 mb-4 flex items-start">
              <CheckCircle2 className="w-3 h-3 mt-0.5 mr-1.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* 步骤0：验证身份 */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">管理员用户名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入管理员用户名"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">密保问题</label>
                <select
                  value={selectedQuestion}
                  onChange={(e) => setSelectedQuestion(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm"
                >
                  <option value="">请选择密保问题</option>
                  {questions.map((q) => (
                    <option key={q.id} value={q.id}>{q.question}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">密保答案</label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="请输入您的答案"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm"
                />
              </div>
              <button 
                onClick={verifyAnswer} 
                disabled={loading} 
                className="w-full py-3 bg-td-red text-white rounded-lg font-medium hover:bg-td-red-dark transition-colors disabled:opacity-50"
              >
                {loading ? '验证中...' : '下一步'}
              </button>
            </div>
          )}

          {/* 步骤1：重置密码 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">新密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="至少12位，包含大小写字母、数字、特殊字符"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPwd(!showPwd)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-td-silver hover:text-td-gray"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPwd && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${pwdStrength.color} transition-all`} style={{ width: `${(pwdStrength.level / 3) * 100}%` }} />
                    </div>
                    <span className="text-xs text-td-gray">{pwdStrength.label}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">确认密码</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitReset()}
                    placeholder="请再次输入新密码"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm"
                  />
                </div>
              </div>
              <button 
                onClick={submitReset} 
                disabled={loading} 
                className="w-full py-3 bg-td-red text-white rounded-lg font-medium hover:bg-td-red-dark transition-colors disabled:opacity-50"
              >
                {loading ? '重置中...' : '重置密码'}
              </button>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/admin/login" className="inline-flex items-center gap-1 text-td-gray hover:text-td-red">
              <ArrowLeft className="w-4 h-4" /> 返回登录
            </Link>
            {step === 1 && (
              <button onClick={() => setStep(0)} className="text-td-gray hover:text-td-red">
                上一步
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
