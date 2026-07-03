import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, User, Bot, Phone, Headphones } from 'lucide-react'
import api from '../../api'

const WELCOME_MSG = '您好！我是通达丝网智能客服，很高兴为您服务。您可以询问产品价格、规格参数、定制流程、配送方式等问题。'
const QUICK_REPLIES = ['产品价格', '规格参数', '配送方式', '定制流程', '现货库存']

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'ai', content: WELCOME_MSG, time: new Date().toISOString() }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [status, setStatus] = useState('ai')
  const msgEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return
    const userMsg = { role: 'user', content: text, time: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/chat/message', { conversationId, content: text })
      // 后端返回 { code, message, data: { reply, conversationId, status, isReal, source, ... } }
      const payload = res.data?.data || res.data || {}
      const aiMsg = {
        role: 'ai',
        content: payload.reply || '抱歉，我暂时无法回答这个问题，请点击"转人工客服"获取帮助。',
        time: new Date().toISOString(),
        isReal: payload.isReal, // true=真实 AI 回答，false=本地模板
      }
      setMessages(prev => [...prev, aiMsg])
      if (payload.conversationId || payload.conversation_id) setConversationId(payload.conversationId || payload.conversation_id)
      if (payload.status) setStatus(payload.status)
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: '网络连接失败，请稍后重试或直接拨打 17352186111 联系我们。', time: new Date().toISOString() }])
    } finally {
      setLoading(false)
    }
  }

  const handleTransfer = async () => {
    if (!conversationId) {
      setMessages(prev => [...prev, { role: 'system', content: '正在为您转接人工客服，请稍候...', time: new Date().toISOString() }])
      setStatus('pending')
      return
    }
    try {
      await api.post('/chat/transfer-human', { conversationId, reason: '用户请求人工客服' })
      setMessages(prev => [...prev, { role: 'system', content: '已为您提交转人工请求，客服人员将在工作时间尽快回复您。紧急情况请拨打：17352186111', time: new Date().toISOString() }])
      setStatus('pending')
    } catch {
      setMessages(prev => [...prev, { role: 'system', content: '转人工失败，请直接拨打：17352186111', time: new Date().toISOString() }])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button 
          onClick={() => setOpen(true)} 
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-td-red text-white rounded-full shadow-lg hover:bg-td-red-dark transition-all flex items-center justify-center animate-bounce group"
          title="问AI客服"
          aria-label="打开AI客服"
        >
          <MessageCircle className="w-6 h-6" />
          {/* Tooltip */}
          <span className="absolute right-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            问AI客服
          </span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-td-red text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h3 className="text-sm font-semibold">通达丝网智能客服</h3>
                <p className="text-xs text-red-100">
                  {status === 'ai' ? 'AI 在线' : status === 'pending' ? '等待人工接入' : '人工客服服务中'}
                  <span className="inline-block w-1.5 h-1.5 bg-green-300 rounded-full ml-1.5 animate-pulse-dot"></span>
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-red-700 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-td-bg">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === 'user' ? 'bg-td-blue' : msg.role === 'agent' ? 'bg-td-red' : msg.role === 'system' ? 'bg-yellow-500' : 'bg-white border border-gray-200'
                  }`}>
                    {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-white" /> :
                     msg.role === 'agent' ? <Headphones className="w-3.5 h-3.5 text-white" /> :
                     msg.role === 'system' ? <Phone className="w-3.5 h-3.5 text-white" /> :
                     <Bot className="w-3.5 h-3.5 text-td-blue" />}
                  </div>
                  <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' ? 'bg-td-blue text-white rounded-tr-md' :
                    msg.role === 'agent' ? 'bg-red-50 text-td-dark border border-red-200 rounded-tl-md' :
                    msg.role === 'system' ? 'bg-yellow-50 text-td-dark border border-yellow-200 rounded-tl-md text-xs' :
                    'bg-white text-td-dark border border-gray-200 rounded-tl-md'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-td-blue" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-td-silver rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-td-silver rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-2 h-2 bg-td-silver rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={msgEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 flex flex-wrap gap-2 bg-white border-t border-gray-100">
              {QUICK_REPLIES.map((qr, i) => (
                <button key={i} onClick={() => sendMessage(qr)} className="px-3 py-1.5 bg-red-50 text-td-red text-xs rounded-full hover:bg-td-red hover:text-white transition-colors">
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您的问题..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-td-bg border border-gray-200 rounded-xl text-sm outline-none focus:border-td-red focus:ring-1 focus:ring-td-red disabled:opacity-50"
              />
              <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} className="p-2.5 bg-td-red text-white rounded-xl hover:bg-td-red-dark transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <button onClick={handleTransfer} className="text-xs text-td-gray hover:text-td-red transition-colors flex items-center gap-1">
                <Headphones className="w-3 h-3" /> 转人工客服
              </button>
              <a href="tel:17352186111" className="text-xs text-td-gray hover:text-td-red transition-colors flex items-center gap-1">
                <Phone className="w-3 h-3" /> 一键拨打
              </a>
            </div>
          </div>

          {/* WeChat QR */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center shrink-0">
            <p className="text-xs text-td-gray mb-1">扫一扫添加负责人微信</p>
            <img src="/images/微信好友添加二维码.jpg" alt="通达丝网微信二维码" className="w-24 h-24 mx-auto rounded-lg shadow-sm" />
          </div>
        </div>
      )}
    </>
  )
}