import { useState, useEffect } from 'react'
import { Search, Ban, CheckCircle } from 'lucide-react'
import api from '../../api'

export default function UserManage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users', { params: { page, keyword } })
      setUsers(res.data.data?.list || res.data.data || [])
      setTotal(res.data.data?.pagination?.total || 0)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [page])

  const handleToggleStatus = async (id, currentActive) => {
    const newActive = currentActive === 1 ? 0 : 1
    try {
      await api.put(`/admin/users/${id}/status`, { isActive: newActive })
      fetchUsers()
    } catch { alert('操作失败') }
  }

  const handleSearch = () => { setPage(1); fetchUsers() }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-td-dark">用户管理</h2>
        <div className="flex items-center gap-2">
          <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="搜索手机号/昵称..." className="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red w-48" />
          <button onClick={handleSearch} className="p-2 bg-td-red text-white rounded-lg hover:bg-td-red-dark"><Search className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">ID</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">昵称</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">手机号</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">邮箱</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">状态</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">注册时间</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-td-gray">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-td-gray text-sm">加载中...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-td-gray text-sm">暂无用户数据</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-td-dark">{u.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-td-dark">{u.nickname || '-'}</td>
                <td className="px-4 py-3 text-sm text-td-gray">{u.phone_or_email?.includes('@') ? '-' : u.phone_or_email}</td>
                <td className="px-4 py-3 text-sm text-td-gray">{u.phone_or_email?.includes('@') ? u.phone_or_email : '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.is_active === 1 ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                    {u.is_active === 1 ? '正常' : '已封禁'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-td-gray">{u.created_at ? new Date(u.created_at).toLocaleString('zh-CN', { hour12: false }) : '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleToggleStatus(u.id, u.is_active)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${u.is_active === 1 ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                    {u.is_active === 1 ? '封禁' : '解封'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 10 && (
        <div className="flex justify-center mt-6 gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50">上一页</button>
          <span className="px-4 py-2 text-sm text-td-gray">第 {page} 页</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 10 >= total} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50">下一页</button>
        </div>
      )}
    </div>
  )
}