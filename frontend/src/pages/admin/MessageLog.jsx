import { useState, useEffect } from 'react'
import { Search, Download, MessageSquare, Bot, User, Headphones, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../api'

export default function MessageLog() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ keyword: '', role: '' })
  const [expandedId, setExpandedId] = useState(null)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 20 })
  const pageSize = 20

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const offset = (page - 1) * pageSize
      const res = await api.get('/admin/messages', { params: { page, pageSize } })
      const data = res.data.data || {}
      setRecords(data.list || [])
      setPagination({ total: data.total || 0, page: data.page || page, pageSize: data.pageSize || pageSize })
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchRecords() }, [page])

  const handleDelete = async (msgId) => {
    if (!window.confirm('确定删除该条消息吗？')) return
    try {
      await api.delete(`/admin/messages/${msgId}`)
      fetchRecords()
    } catch { alert('删除失败') }
  }

  const filtered = records.filter(r => {
    const matchKeyword = !filter.keyword || (r.content || '').includes(filter.keyword)
    const matchRole = !filter.role || r.role === filter.role
    return matchKeyword && matchRole
  })

  const getSenderIcon = (role, source) => {
    if (role === 'user') return <User className="w-4 h-4 text-td-blue" />
    if (role === 'assistant') return source === 'manual' ? <Headphones className="w-4 h-4 text-td-red" /> : <Bot className="w-4 h-4 text-green-500" />
    if (role === 'system') return <MessageSquare className="w-4 h-4 text-yellow-500" />
    return <MessageSquare className="w-4 h-4 text-td-gray" />
  }

  const getSenderLabel = (role, source) => {
    if (role === 'user') return '客户'
    if (role === 'assistant') return source === 'manual' ? '人工客服' : 'AI客服'
    if (role === 'system') return '系统'
    return role
  }

  const getSenderColor = (role, source) => {
    const map = {
      user: 'bg-blue-100 text-blue-700',
      assistant: source === 'manual' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700',
      system: 'bg-yellow-100 text-yellow-700',
    }
    return map[role] || 'bg-gray-100 text-gray-500'
  }

  const handleExport = async () => {
    try {
      const res = await api.get('/admin/messages/export', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8' }))
      const a = document.createElement('a')
      a.href = url; a.download = `消息记录_${new Date().toISOString().slice(0, 10)}.csv`
      a.click(); URL.revokeObjectURL(url)
    } catch { alert('导出失败') }
  }

  const totalPages = Math.ceil(pagination.total / pageSize)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-td-dark">消息记录</h2>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-td-red text-td-red rounded-lg text-sm hover:bg-red-50 transition-colors">
          <Download className="w-4 h-4" /> 导出CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
          <input type="text" value={filter.keyword}
            onChange={e => setFilter({ ...filter, keyword: e.target.value })}
            placeholder="搜索消息内容..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red" />
        </div>
        <select value={filter.role}
          onChange={e => setFilter({ ...filter, role: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red">
          <option value="">全部角色</option>
          <option value="user">客户</option>
          <option value="assistant">客服回复</option>
          <option value="system">系统消息</option>
        </select>
        <span className="text-sm text-td-gray">
          共 {pagination.total} 条记录（当前显示 {filtered.length} 条）
        </span>
      </div>

      {/* Records */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-td-gray text-sm">加载中...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map((r, i) => (
              <div key={r.id || i} className="hover:bg-gray-50 transition-colors group">
                <div className="px-4 py-3 flex items-start gap-3 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === i ? null : i)}>
                  <div className="mt-0.5">{getSenderIcon(r.role, r.source)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSenderColor(r.role, r.source)}`}>
                        {getSenderLabel(r.role, r.source)}
                      </span>
                      <span className="text-xs text-td-silver">会话 #{r.conversation_id}</span>
                      {r.visitor_id && (
                        <span className="text-xs text-td-silver">访客: {r.visitor_id.substring(0, 8)}...</span>
                      )}
                      <span className="text-xs text-td-silver">
                        {r.created_at ? new Date(r.created_at).toLocaleString('zh-CN', { hour12: false }) : ''}
                      </span>
                    </div>
                    <p className={`text-sm text-td-dark ${expandedId !== i ? 'truncate' : 'whitespace-pre-wrap break-words'}`}>
                      {r.content}
                    </p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}
                    className="p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0" title="删除">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-td-gray text-sm">暂无消息记录</div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-6 gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" /> 上一页
          </button>
          <span className="px-4 py-2 text-sm text-td-gray">
            第 {page}/{totalPages} 页（共 {pagination.total} 条）
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">
            下一页 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
