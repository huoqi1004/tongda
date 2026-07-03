import { useState, useEffect, useRef } from 'react'
import { Send, User, Bot, Headphones, RefreshCw, Trash2, Info, X } from 'lucide-react'
import api from '../../api'

export default function ServiceDesk() {
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [convUser, setConvUser] = useState(null)
  const [showUserInfo, setShowUserInfo] = useState(false)
  const msgEndRef = useRef(null)
  const [pollInterval, setPollInterval] = useState(null)

  useEffect(() => {
    fetchConversations()
    return () => { if (pollInterval) clearInterval(pollInterval) }
  }, [])

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await api.get('/admin/conversations')
      const list = res.data.data?.list || res.data.data?.items || res.data.data || res.data || []
      setConversations(list)
    } catch { /* ignore */ }
  }

  const fetchMessages = async (convId) => {
    try {
      const res = await api.get(`/admin/conversations/${convId}/messages`)
      const list = res.data.data?.list || res.data.data || []
      setMessages(list)
    } catch { /* ignore */ }
  }

  const fetchConvUser = async (convId) => {
    try {
      const res = await api.get(`/admin/conversations/${convId}/user`)
      if (res.data.code === 0) {
        setConvUser(res.data.data)
      }
    } catch { /* ignore */ }
  }

  const handleSelectConv = (conv) => {
    setActiveConv(conv)
    fetchMessages(conv.id)
    fetchConvUser(conv.id)
    if (pollInterval) clearInterval(pollInterval)
    const interval = setInterval(() => fetchMessages(conv.id), 5000)
    setPollInterval(interval)
  }

  const handleDeleteConv = async (convId, e) => {
    e.stopPropagation()
    if (!window.confirm('确定删除该会话吗？所有聊天记录将被清除且不可恢复。')) return
    try {
      await api.delete(`/admin/conversations/${convId}`)
      if (activeConv?.id === convId) { setActiveConv(null); setMessages([]); setConvUser(null) }
      fetchConversations()
    } catch { alert('删除失败') }
  }

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('确定删除该条消息吗？')) return
    try {
      await api.delete(`/admin/messages/${msgId}`)
      if (activeConv) fetchMessages(activeConv.id)
    } catch { alert('删除失败') }
  }

  const handleTakeover = async (convId) => {
    try {
      await api.post(`/admin/conversations/${convId}/takeover`)
      fetchConversations()
      if (activeConv?.id === convId) fetchMessages(convId)
    } catch { alert('接管失败') }
  }

  const handleSend = async () => {
    if (!input.trim() || !activeConv) return
    setLoading(true)
    try {
      await api.post(`/admin/conversations/${activeConv.id}/message`, { content: input })
      setInput('')
      fetchMessages(activeConv.id)
      fetchConversations()
    } catch { alert('发送失败') }
    setLoading(false)
  }

  const handleStatus = async (convId, status) => {
    try {
      await api.put(`/admin/conversations/${convId}/status`, { status })
      fetchConversations()
    } catch { alert('操作失败') }
  }

  const getStatusLabel = (s) => {
    const map = { active: '进行中', ai: 'AI客服中', pending: '待接管', human: '人工服务中', resolved: '已解决', closed: '已关闭' }
    return map[s] || s
  }

  const getStatusColor = (s) => {
    const map = { active: 'bg-blue-100 text-blue-700', ai: 'bg-blue-100 text-blue-700', pending: 'bg-yellow-100 text-yellow-700', human: 'bg-green-100 text-green-700', resolved: 'bg-gray-100 text-gray-500', closed: 'bg-gray-100 text-gray-500' }
    return map[s] || 'bg-gray-100 text-gray-500'
  }

  const getMsgSender = (msg) => {
    if (msg.role === 'user') return 'user'
    if (msg.role === 'assistant') return msg.source === 'manual' ? 'agent' : 'ai'
    if (msg.role === 'system') return 'system'
    return msg.role
  }

  const getSenderIcon = (type) => {
    switch (type) {
      case 'user': return <User className="w-3.5 h-3.5 text-td-blue" />
      case 'ai': return <Bot className="w-3.5 h-3.5 text-green-500" />
      case 'agent': return <Headphones className="w-3.5 h-3.5 text-white" />
      default: return <Bot className="w-3.5 h-3.5 text-td-gray" />
    }
  }

  const getSenderBg = (type) => {
    switch (type) {
      case 'user': return 'bg-blue-500'
      case 'ai': return 'bg-green-200'
      case 'agent': return 'bg-td-red'
      default: return 'bg-gray-200'
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Conversation List */}
      <div className="w-80 bg-white rounded-xl shadow-sm flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-td-dark">会话列表</h3>
          <button onClick={fetchConversations} className="p-1.5 hover:bg-gray-100 rounded-lg" title="刷新">
            <RefreshCw className="w-4 h-4 text-td-gray" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div key={conv.id} onClick={() => handleSelectConv(conv)}
              className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors group ${activeConv?.id === conv.id ? 'bg-red-50 border-l-2 border-l-td-red' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-td-dark text-sm">{conv.title || `会话 #${conv.id}`}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(conv.status)}`}>{getStatusLabel(conv.status)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-td-gray truncate max-w-[200px]">{conv.last_message || '新的对话'}</p>
                  <p className="text-xs text-td-silver mt-0.5">{conv.updated_at ? new Date(conv.updated_at).toLocaleString() : ''}</p>
                </div>
                <button onClick={(e) => handleDeleteConv(conv.id, e)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="删除会话">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="text-center py-8 text-td-gray text-sm">暂无会话</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm flex flex-col">
        {activeConv ? (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <span className="font-semibold text-td-dark">{activeConv.title || `会话 #${activeConv.id}`}</span>
                  <span className={`ml-3 px-2 py-0.5 rounded-full text-xs ${getStatusColor(activeConv.status)}`}>{getStatusLabel(activeConv.status)}</span>
                </div>
                {convUser && (
                  <button onClick={() => setShowUserInfo(true)} className="p-1.5 hover:bg-blue-50 rounded-lg text-td-blue" title="查看用户信息">
                    <Info className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {['pending', 'active'].includes(activeConv.status) && (
                  <button onClick={() => handleTakeover(activeConv.id)}
                    className="px-3 py-1.5 bg-td-red text-white rounded-lg text-xs font-medium hover:bg-td-red-dark">
                    接管会话
                  </button>
                )}
                {activeConv.status === 'active' && (
                  <button onClick={() => handleStatus(activeConv.id, 'closed')}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-td-gray hover:bg-gray-50">关闭会话</button>
                )}
                {['closed', 'resolved'].includes(activeConv.status) && (
                  <button onClick={() => handleStatus(activeConv.id, 'active')}
                    className="px-3 py-1.5 border border-green-300 rounded-lg text-xs text-green-600 hover:bg-green-50">重新打开</button>
                )}
              </div>
            </div>

            {/* User Info Panel */}
            {showUserInfo && convUser && (
              <div className="mx-4 mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-blue-800">关联用户信息</h4>
                  <button onClick={() => setShowUserInfo(false)} className="text-blue-400 hover:text-blue-600"><X className="w-4 h-4" /></button>
                </div>
                {convUser.user ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-blue-600">用户ID：</span><span className="text-blue-800">{convUser.user.id}</span></div>
                    <div><span className="text-blue-600">昵称：</span><span className="text-blue-800">{convUser.user.nickname || '-'}</span></div>
                    <div><span className="text-blue-600">手机号/邮箱：</span><span className="text-blue-800">{convUser.user.phone_or_email || '-'}</span></div>
                    <div><span className="text-blue-600">公司：</span><span className="text-blue-800">{convUser.user.company || '-'}</span></div>
                    <div><span className="text-blue-600">注册时间：</span><span className="text-blue-800">{convUser.user.created_at ? new Date(convUser.user.created_at).toLocaleString('zh-CN', { hour12: false }) : '-'}</span></div>
                  </div>
                ) : (
                  <p className="text-xs text-blue-600">
                    {convUser.visitorId ? `匿名访客 (ID: ${convUser.visitorId.substring(0, 8)}...)` : '无关联用户信息'}
                  </p>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-td-bg">
              {messages.map((msg, i) => {
                const senderType = getMsgSender(msg)
                const isUser = senderType === 'user'
                return (
                  <div key={i} className={`flex group ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 ${getSenderBg(senderType)}`}>
                        {getSenderIcon(senderType)}
                      </div>
                    )}
                    <div className={`max-w-[65%] rounded-2xl px-4 py-2.5 text-sm ${
                      isUser ? 'bg-td-blue text-white rounded-tr-md' :
                      senderType === 'agent' ? 'bg-red-50 text-td-dark border border-red-200 rounded-tl-md' :
                      senderType === 'system' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-tl-md' :
                      'bg-white text-td-dark border border-gray-200 rounded-tl-md'
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] opacity-50">
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour12: false }) : ''}
                        </span>
                        <button onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="删除消息">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {isUser && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 ml-2">
                        <User className="w-3.5 h-3.5 text-td-gray" />
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={msgEndRef} />
            </div>

            {!['closed'].includes(activeConv.status) && (
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <input type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="输入回复内容..."
                    className="flex-1 px-4 py-2.5 bg-td-bg border border-gray-200 rounded-xl text-sm outline-none focus:border-td-red" />
                  <button onClick={handleSend} disabled={loading || !input.trim()}
                    className="p-2.5 bg-td-red text-white rounded-xl hover:bg-td-red-dark disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-td-gray text-sm">请选择一个会话查看详情</div>
        )}
      </div>
    </div>
  )
}
