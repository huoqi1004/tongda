import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Phone, MessageSquare, MessageCircle, Settings, LogOut, Save } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import api from '../api'

export default function UserCenter() {
  const navigate = useNavigate()
  const [authState, setAuthState] = useState(useAuthStore.getState())
  const [activeTab, setActiveTab] = useState('consultations')
  const [profileForm, setProfileForm] = useState({ nickname: '', phone: '' })
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    const unsub = useAuthStore.subscribe((s) => setAuthState(s))
    return unsub
  }, [])

  useEffect(() => {
    if (!authState.token) {
      navigate('/login', { replace: true })
      return
    }
    setProfileForm({
      nickname: authState.user?.nickname || '',
      phone: authState.user?.phone || '',
    })
  }, [authState.token, authState.user, navigate])

  const handleLogout = () => {
    useAuthStore.logout()
    navigate('/')
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaveMsg('')
    try {
      const res = await api.put('/user/profile', profileForm)
      useAuthStore.setAuth({ ...authState.user, ...profileForm }, authState.token)
      setSaveMsg('修改成功')
      setTimeout(() => setSaveMsg(''), 3000)
    } catch {
      setSaveMsg('修改失败，请稍后重试')
    }
  }

  if (!authState.user) {
    return (
      <div className="min-h-screen bg-td-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-td-gray">请先登录</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { key: 'consultations', label: '我的咨询', icon: MessageSquare },
    { key: 'messages', label: '我的留言', icon: MessageCircle },
    { key: 'profile', label: '修改资料', icon: Settings },
  ]

  return (
    <div className="bg-td-bg min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left: User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-20 h-20 bg-td-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {authState.user.nickname?.[0] || authState.user.phone?.[0] || 'U'}
              </div>
              <h3 className="font-bold text-lg text-td-dark">{authState.user.nickname || '用户'}</h3>
              <div className="flex items-center justify-center gap-1 mt-1 text-td-gray text-sm">
                <Phone className="w-3.5 h-3.5" />
                <span>{authState.user.phone}</span>
              </div>
              <button onClick={handleLogout} className="mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-td-gray hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors w-full">
                <LogOut className="w-4 h-4" /> 退出登录
              </button>
            </div>

            {/* Tab Nav (Mobile) */}
            <div className="mt-4 lg:hidden">
              <div className="flex bg-white rounded-xl shadow-sm p-1 gap-1">
                {tabs.map((tab) => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-colors ${activeTab === tab.key ? 'bg-td-red text-white' : 'text-td-gray hover:bg-gray-100'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-3">
            {/* Tab Nav (Desktop) */}
            <div className="hidden lg:flex bg-white rounded-xl shadow-sm mb-6 p-1 gap-1">
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-td-red text-white' : 'text-td-gray hover:bg-gray-100'}`}>
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Consultations Tab */}
            {activeTab === 'consultations' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-lg text-td-dark mb-4">我的咨询</h3>
                <div className="text-center py-12 text-td-gray">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-td-silver" />
                  <p>暂无咨询记录</p>
                  <p className="text-sm mt-1">点击右下角客服图标开始咨询</p>
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-lg text-td-dark mb-4">我的留言</h3>
                <div className="text-center py-12 text-td-gray">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-td-silver" />
                  <p>暂无留言记录</p>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-lg text-td-dark mb-6">修改资料</h3>
                {saveMsg && (
                  <div className={`text-sm rounded-lg px-4 py-2 mb-4 ${saveMsg === '修改成功' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{saveMsg}</div>
                )}
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-td-dark mb-1.5">昵称</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                      <input type="text" value={profileForm.nickname} onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value })} placeholder="请输入昵称" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-td-dark mb-1.5">手机号</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                      <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="请输入手机号" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
                    </div>
                  </div>
                  <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-td-red text-white rounded-lg font-medium hover:bg-td-red-dark transition-colors text-sm">
                    <Save className="w-4 h-4" /> 保存修改
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}