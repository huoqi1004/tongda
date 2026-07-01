import { useState, useEffect, useRef } from 'react'
import { Send, User, Bot, Headphones, RefreshCw } from 'lucide-react'
import api from '../../api'

export default function ServiceDesk() {
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
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
      setConversations(res.data.data?.items || res.data.data || res.data || [])
    } catch { /* ignore */ }
  }

  const fetchMessages = async (convId) => {
    try {
      const res = await api.get(`/chat/conversations/${convId}/messages`)
      setMessages(res.data.data || res.data || [])
    } catch { /* ignore */ }
  }

  const handleSelectConv = (conv) => {
    setActiveConv(conv)
    fetchMessages(conv.id)
    if (pollInterval) clearInterval(pollInterval)
    const interval = setInterval(() => fetchMessages(conv.id), 5000)
    setPollInterval(interval)
  }

  const handleTakeover = async (convId) => {
    try {
      await api.post(`/admin/conversations/${convId}/takeover`)
      fetchConversations()
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
    const map = { ai: 'AI客服中', pending: '待接管', human: '人工服务中', resolved: '已解决', closed: '已关闭' }
    return map[s] || s
  }

  const getStatusColor = (s) => {
    const map = { ai: 'bg-blue-100 text-blue-700', pending: 'bg-yellow-100 text-yellow-700', human: 'bg-green-100 text-green-700', resolved: 'bg-gray-100 text-gray-500', closed: 'bg-gray-100 text-gray-500' }
    return map[s] || 'bg-gray-100 text-gray-500'
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Conversation List */}
      <div className="w-80 bg-white rounded-xl shadow-sm flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-td-dark">会话列表</h3>
          <button onClick={fetchConversations} className="p-1.5 hover:bg-gray-100 rounded-lg"><RefreshCw className="w-4 h-4 text-td-gray" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div key={conv.id} onClick={() => handleSelectConv(conv)} className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${activeConv?.id === conv.id ? 'bg-red-50 border-l-2 border-l-td-red' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-td-dark text-sm">{conv.visitor_name || `访客${conv.id}`}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(conv.status)}`}>{getStatusLabel(conv.status)}</span>
              </div>
              <p className="text-xs text-td-gray truncate">{conv.last_message || conv.title || '新的对话'}</p>
              <p className="text-xs text-td-silver mt-1">{conv.updated_at ? new Date(conv.updated_at).toLocaleString() : ''}</p>
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
              <div>
                <span className="font-semibold text-td-dark">{activeConv.visitor_name || '访客用户'}</span>
                <span className={`ml-3 px-2 py-0.5 rounded-full text-xs ${getStatusColor(activeConv.status)}`}>{getStatusLabel(activeConv.status)}</span>
              </div>
              <div className="flex gap-2">
                {activeConv.status === 'pending' && (
                  <button onClick={() => handleTakeover(activeConv.id)} className="px-3 py-1.5 bg-td-red text-white rounded-lg text-xs font-medium hover:bg-td-red-dark">接管会话</button>
                )}
                {activeConv.status === 'human' && (
                  <button onClick={() => handleStatus(activeConv.id, 'resolved')} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600">标记解决</button>
                )}
                <button onClick={() => handleStatus(activeConv.id, 'closed')} className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-td-gray hover:bg-gray-50">关闭</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-td-bg">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender_type !== 'user' && (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-2 ${msg.sender_type === 'agent' ? 'bg-td-red' : 'bg-td-blue'}`}>
                      {msg.sender_type === 'agent' ? <Headphones className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
                    </div>
                  )}
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender_type === 'user' ? 'bg-td-blue text-white rounded-tr-md' :
                    msg.sender_type === 'agent' ? 'bg-red-50 text-td-dark border border-red-200 rounded-tl-md' :
                    'bg-white text-td-dark border border-gray-200 rounded-tl-md'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.sender_type === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0 ml-2">
                      <User className="w-3.5 h-3.5 text-td-gray" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={msgEndRef} />
            </div>
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="输入回复..." className="flex-1 px-4 py-2.5 bg-td-bg border border-gray-200 rounded-xl text-sm outline-none focus:border-td-red" />
                <button onClick={handleSend} disabled={loading || !input.trim()} className="p-2.5 bg-td-red text-white rounded-xl hover:bg-td-red-dark disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-td-gray text-sm">请选择一个会话查看详情</div>
        )}
      </div>
    </div>
  )
}