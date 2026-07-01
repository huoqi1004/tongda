import { useState, useEffect } from 'react'
import { Search, Download, MessageSquare, Bot, User, Headphones } from 'lucide-react'
import api from '../../api'

export default function MessageLog() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ keyword: '', senderType: '' })
  const [expandedId, setExpandedId] = useState(null)

  const fetchRecords = async () => {
    try {
      const res = await api.get('/admin/conversations', { params: { page: 1 } })
      const convs = res.data.data?.items || res.data.data || res.data || []
      const allMessages = []
      for (const conv of convs) {
        try {
          const msgRes = await api.get(`/chat/conversations/${conv.id}/messages`)
          const msgs = msgRes.data.data || msgRes.data || []
          msgs.forEach(msg => {
            allMessages.push({ ...msg, conversationId: conv.id, visitor_name: conv.visitor_name })
          })
        } catch { /* ignore */ }
      }
      setRecords(allMessages)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchRecords() }, [])

  const filtered = records.filter(r => {
    const matchKeyword = !filter.keyword || r.content?.includes(filter.keyword)
    const matchSender = !filter.senderType || r.sender_type === filter.senderType
    return matchKeyword && matchSender
  })

  const getSenderIcon = (type) => {
    switch (type) {
      case 'user': return <User className="w-4 h-4 text-td-blue" />
      case 'ai': return <Bot className="w-4 h-4 text-green-500" />
      case 'agent': return <Headphones className="w-4 h-4 text-td-red" />
      default: return <MessageSquare className="w-4 h-4 text-td-gray" />
    }
  }

  const getSenderLabel = (type) => {
    const map = { user: '客户', ai: 'AI客服', agent: '人工客服', system: '系统' }
    return map[type] || type
  }

  const getSenderColor = (type) => {
    const map = { user: 'bg-blue-100 text-blue-700', ai: 'bg-green-100 text-green-700', agent: 'bg-red-100 text-red-700', system: 'bg-gray-100 text-gray-500' }
    return map[type] || 'bg-gray-100 text-gray-500'
  }

  const handleExport = () => {
    const csv = ['会话ID,发送者,内容,时间\n']
    filtered.forEach(r => {
      csv.push(`${r.conversationId},${getSenderLabel(r.sender_type)},"${r.content?.replace(/"/g, '""')}",${r.created_at}\n`)
    })
    const blob = new Blob(csv, { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `消息记录_${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  if (loading) return <div className="text-center py-12 text-td-gray">加载中...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-td-dark">消息记录</h2>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-td-red text-td-red rounded-lg text-sm hover:bg-red-50 transition-colors">
          <Download className="w-4 h-4" /> 导出CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
          <input type="text" value={filter.keyword} onChange={e => setFilter({ ...filter, keyword: e.target.value })} placeholder="搜索消息内容..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red" />
        </div>
        <select value={filter.senderType} onChange={e => setFilter({ ...filter, senderType: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red">
          <option value="">全部类型</option>
          <option value="user">客户</option>
          <option value="ai">AI客服</option>
          <option value="agent">人工客服</option>
        </select>
        <span className="text-sm text-td-gray">共 {filtered.length} 条记录</span>
      </div>

      {/* Records */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filtered.slice(0, 100).map((r, i) => (
            <div key={i} className="hover:bg-gray-50 transition-colors">
              <div className="px-4 py-3 flex items-start gap-3 cursor-pointer" onClick={() => setExpandedId(expandedId === i ? null : i)}>
                <div className="mt-0.5">{getSenderIcon(r.sender_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSenderColor(r.sender_type)}`}>{getSenderLabel(r.sender_type)}</span>
                    <span className="text-xs text-td-silver">{r.visitor_name || '访客'}</span>
                    <span className="text-xs text-td-silver">{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</span>
                  </div>
                  <p className={`text-sm text-td-dark ${expandedId !== i ? 'truncate' : ''}`}>{r.content}</p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-td-gray text-sm">暂无消息记录</div>
          )}
        </div>
      </div>
    </div>
  )
}