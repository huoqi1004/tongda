import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Phone, Lock, ShieldCheck, ArrowLeft, Eye, EyeOff, CheckCircle2, Clock } from 'lucide-react'
import api from '../api'

const STEPS = [
  { key: 'account', title: '验证账号', desc: '请输入注册时使用的手机号或邮箱' },
  { key: 'verify', title: '输入验证码', desc: '请输入发送到您账号的 6 位验证码' },
  { key: 'reset', title: '重置密码', desc: '请设置一个新的登录密码' },
]

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [account, setAccount] = useState('')
  const [maskedAccount, setMaskedAccount] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [resetToken, setResetToken] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [devCode, setDevCode] = useState('') // 开发环境后端直接返回的验证码
  const [cooldown, setCooldown] = useState(0) // 重新发送倒计时
  const codeRefs = useRef([])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  useEffect(() => { setError('') }, [step])

  // 步骤1：发送验证码
  const sendCode = async () => {
    if (!account.trim()) { setError('请输入手机号或邮箱'); return }
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/forgot/send-code', { account: account.trim() })
      const data = res.data?.data || {}
      setMaskedAccount(data.maskedAccount || account)
      if (data.devCode) setDevCode(data.devCode) // 开发环境直接展示
      setCooldown(Math.ceil((data.cooldown || 60)))
      setStep(1)
      setSuccess(`验证码已发送至 ${data.maskedAccount || account}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || '发送失败，请稍后重试')
    } finally { setLoading(false) }
  }

  // 步骤2：校验验证码
  const verifyCode = async () => {
    const full = code.join('')
    if (full.length !== 6) { setError('请输入完整的 6 位验证码'); return }
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/forgot/verify-code', { account: account.trim(), code: full })
      setResetToken(res.data?.data?.resetToken || '')
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || '验证失败')
      // 清空输入框
      setCode(['', '', '', '', '', ''])
      codeRefs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  // 步骤3：提交新密码
  const submitReset = async () => {
    if (!newPwd || !confirmPwd) { setError('请填写新密码和确认密码'); return }
    if (newPwd !== confirmPwd) { setError('两次输入的密码不一致'); return }
    if (newPwd.length < 6) { setError('密码长度不能少于 6 位'); return }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(newPwd)) { setError('密码必须包含字母和数字'); return }
    setLoading(true); setError('')
    try {
      await api.post('/auth/forgot/reset', { resetToken, newPassword: newPwd })
      setSuccess('密码重置成功！正在跳转登录页...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || '重置失败，请重试')
    } finally { setLoading(false) }
  }

  // 验证码输入处理
  const handleCodeInput = (idx, val) => {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[idx] = v
    setCode(next)
    if (v && idx < 5) codeRefs.current[idx + 1]?.focus()
  }
  const handleCodeKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      codeRefs.current[idx - 1]?.focus()
    } else if (e.key === 'Enter' && code.join('').length === 6) {
      verifyCode()
    }
  }
  const handleCodePaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) {
      e.preventDefault()
      setCode(text.split(''))
      codeRefs.current[5]?.focus()
    }
  }

  const pwdStrength = (() => {
    if (!newPwd) return { level: 0, label: '', color: 'bg-gray-200' }
    let s = 0
    if (newPwd.length >= 8) s++
    if (/[A-Z]/.test(newPwd)) s++
    if (/\d/.test(newPwd)) s++
    if (/[^A-Za-z0-9]/.test(newPwd)) s++
    if (s <= 1) return { level: 1, label: '弱', color: 'bg-red-500' }
    if (s === 2) return { level: 2, label: '中', color: 'bg-yellow-500' }
    return { level: 3, label: '强', color: 'bg-green-500' }
  })()

  return (
    <div className="min-h-screen bg-td-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* 顶部 Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-td-red rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">通</span>
          </div>
          <h1 className="text-2xl font-bold text-td-dark">找回密码</h1>
          <p className="text-td-gray text-sm mt-1">通达丝网 · 用户端</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* 步骤指示器 */}
          <div className="flex items-center justify-between mb-6">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    i < step ? 'bg-td-red text-white' :
                    i === step ? 'bg-td-red text-white ring-4 ring-red-100' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <div className={`mt-1.5 text-xs ${i <= step ? 'text-td-dark font-medium' : 'text-td-silver'}`}>
                    {s.title}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 -mt-5 transition-colors ${i < step ? 'bg-td-red' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-td-gray mb-4 text-center">{STEPS[step].desc}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">{success}</div>
          )}

          {/* 步骤1：输入账号 */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">手机号/邮箱</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                  <input
                    type="text" value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                    placeholder="请输入注册时的手机号或邮箱"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm"
                  />
                </div>
              </div>
              <button onClick={sendCode} disabled={loading} className="w-full py-3 bg-td-red text-white rounded-lg font-medium hover:bg-td-red-dark transition-colors disabled:opacity-50">
                {loading ? '发送中...' : '获取验证码'}
              </button>
            </div>
          )}

          {/* 步骤2：输入验证码 */}
          {step === 1 && (
            <div className="space-y-4">
              {devCode && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg px-4 py-2.5">
                  <span className="font-medium">[开发环境]</span> 验证码：<span className="font-mono font-bold text-base tracking-widest">{devCode}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">验证码</label>
                <div className="flex gap-2 justify-between" onPaste={handleCodePaste}>
                  {code.map((c, i) => (
                    <input
                      key={i}
                      ref={el => codeRefs.current[i] = el}
                      type="text" inputMode="numeric" maxLength={1} value={c}
                      onChange={(e) => handleCodeInput(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none"
                    />
                  ))}
                </div>
                <p className="text-xs text-td-silver mt-2">已发送至 {maskedAccount}</p>
              </div>
              <button onClick={verifyCode} disabled={loading} className="w-full py-3 bg-td-red text-white rounded-lg font-medium hover:bg-td-red-dark transition-colors disabled:opacity-50">
                {loading ? '验证中...' : '下一步'}
              </button>
              <div className="text-center text-sm">
                {cooldown > 0 ? (
                  <span className="text-td-silver inline-flex items-center gap-1"><Clock className="w-3 h-3" />{cooldown}s 后可重新发送</span>
                ) : (
                  <button onClick={sendCode} disabled={loading} className="text-td-red hover:underline">重新发送验证码</button>
                )}
              </div>
            </div>
          )}

          {/* 步骤3：设置新密码 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1.5">新密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                  <input
                    type={showPwd ? 'text' : 'password'} value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="请输入新密码（字母+数字，至少 6 位）"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-td-silver hover:text-td-gray">
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
                    type={showPwd ? 'text' : 'password'} value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitReset()}
                    placeholder="请再次输入新密码"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm"
                  />
                </div>
              </div>
              <button onClick={submitReset} disabled={loading} className="w-full py-3 bg-td-red text-white rounded-lg font-medium hover:bg-td-red-dark transition-colors disabled:opacity-50">
                {loading ? '重置中...' : '重置密码'}
              </button>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/login" className="inline-flex items-center gap-1 text-td-gray hover:text-td-red">
              <ArrowLeft className="w-4 h-4" /> 返回登录
            </Link>
            {step > 0 && step < 2 && (
              <button onClick={() => setStep(step - 1)} className="text-td-gray hover:text-td-red">上一步</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
