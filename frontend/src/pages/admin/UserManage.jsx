import { useState, useEffect } from 'react'
import { Search, Ban, CheckCircle, Trash2, Edit, Eye, UserPlus, X, Save, MessageSquare } from 'lucide-react'
import api from '../../api'

export default function UserManage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
  const pageSize = 10

  // 弹窗状态
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetail, setUserDetail] = useState(null)

  // 表单
  const [createForm, setCreateForm] = useState({ phoneOrEmail: '', password: '', nickname: '', company: '' })
  const [editForm, setEditForm] = useState({ nickname: '', phoneOrEmail: '', company: '', isActive: 1 })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/users', { params: { page, pageSize, keyword } })
      setUsers(res.data.data?.list || [])
      setPagination(res.data.data?.pagination || { total: 0, totalPages: 0 })
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [page])

  const handleSearch = () => { setPage(1); fetchUsers() }

  const handleToggleStatus = async (id, currentActive) => {
    try {
      await api.put(`/admin/users/${id}/status`, { isActive: currentActive === 1 ? 0 : 1 })
      fetchUsers()
    } catch { alert('操作失败') }
  }

  const handleDelete = async (id, nickname) => {
    if (!window.confirm(`确定删除用户「${nickname || id}」吗？\n\n此操作将同时删除该用户的密保答案、所有会话和聊天记录，且不可恢复。`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      fetchUsers()
    } catch (err) { alert(err.response?.data?.message || '删除失败') }
  }

  const handleViewDetail = async (user) => {
    setSelectedUser(user)
    setShowDetail(true)
    try {
      const res = await api.get(`/admin/users/${user.id}`)
      if (res.data.code === 0) {
        setUserDetail(res.data.data)
      }
    } catch { /* ignore */ }
  }

  const handleOpenEdit = (user) => {
    setSelectedUser(user)
    setEditForm({
      nickname: user.nickname || '',
      phoneOrEmail: user.phone_or_email || '',
      company: user.company || '',
      isActive: user.is_active,
    })
    setShowEdit(true)
  }

  const handleSaveEdit = async () => {
    try {
      await api.put(`/admin/users/${selectedUser.id}`, editForm)
      setShowEdit(false)
      fetchUsers()
      if (showDetail) handleViewDetail(selectedUser)
    } catch (err) { alert(err.response?.data?.message || '更新失败') }
  }

  const handleCreate = async () => {
    if (!createForm.phoneOrEmail || !createForm.password) {
      alert('请填写手机号/邮箱和密码')
      return
    }
    try {
      await api.post('/admin/users', createForm)
      setShowCreate(false)
      setCreateForm({ phoneOrEmail: '', password: '', nickname: '', company: '' })
      fetchUsers()
    } catch (err) { alert(err.response?.data?.message || '创建失败') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-td-dark">用户管理</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text" value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="搜索手机号/昵称/公司..."
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red w-56"
            />
            <button onClick={handleSearch} className="p-2 bg-td-red text-white rounded-lg hover:bg-td-red-dark">
              <Search className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => { setCreateForm({ phoneOrEmail: '', password: '', nickname: '', company: '' }); setShowCreate(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-td-blue text-white rounded-lg text-sm hover:bg-blue-600">
            <UserPlus className="w-4 h-4" /> 新增用户
          </button>
        </div>
      </div>

      {/* ============ 用户表格 ============ */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">ID</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">昵称</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">手机号/邮箱</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">公司</th>
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
                <td className="px-4 py-3 text-sm text-td-gray">{u.phone_or_email || '-'}</td>
                <td className="px-4 py-3 text-sm text-td-gray">{u.company || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.is_active === 1 ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                    {u.is_active === 1 ? '正常' : '已封禁'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-td-gray">
                  {u.created_at ? new Date(u.created_at).toLocaleString('zh-CN', { hour12: false }) : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleViewDetail(u)} className="p-2 text-td-blue hover:bg-blue-50 rounded-lg" title="查看详情">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleOpenEdit(u)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="编辑">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleToggleStatus(u.id, u.is_active)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${u.is_active === 1 ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      title={u.is_active === 1 ? '封禁' : '解封'}>
                      {u.is_active === 1 ? '封禁' : '解封'}
                    </button>
                    <button onClick={() => handleDelete(u.id, u.nickname)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="删除">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center mt-6 gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">上一页</button>
          <span className="px-4 py-2 text-sm text-td-gray">
            第 {page}/{pagination.totalPages} 页（共 {pagination.total} 条）
          </span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">下一页</button>
        </div>
      )}

      {/* ============ 用户详情弹窗 ============ */}
      {showDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => { setShowDetail(false); setUserDetail(null) }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-td-dark">用户详情</h3>
              <button onClick={() => { setShowDetail(false); setUserDetail(null) }}
                className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            {userDetail ? (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-td-gray block mb-1">用户ID</span>
                    <span className="text-sm font-medium text-td-dark">{userDetail.id}</span>
                  </div>
                  <div>
                    <span className="text-xs text-td-gray block mb-1">昵称</span>
                    <span className="text-sm font-medium text-td-dark">{userDetail.nickname || '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-td-gray block mb-1">手机号/邮箱</span>
                    <span className="text-sm font-medium text-td-dark">{userDetail.phone_or_email}</span>
                  </div>
                  <div>
                    <span className="text-xs text-td-gray block mb-1">公司</span>
                    <span className="text-sm font-medium text-td-dark">{userDetail.company || '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-td-gray block mb-1">状态</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${userDetail.is_active === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {userDetail.is_active === 1 ? '正常' : '已封禁'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-td-gray block mb-1">注册时间</span>
                    <span className="text-sm text-td-dark">{userDetail.created_at ? new Date(userDetail.created_at).toLocaleString('zh-CN', { hour12: false }) : '-'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-td-gray block mb-1">最后登录</span>
                    <span className="text-sm text-td-dark">{userDetail.last_login_at ? new Date(userDetail.last_login_at).toLocaleString('zh-CN', { hour12: false }) : '从未登录'}</span>
                  </div>
                </div>

                {/* 会话统计 */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-td-dark mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-td-blue" /> 会话统计
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs text-td-gray">总会话数</span>
                      <p className="text-xl font-bold text-td-dark">{userDetail.stats?.conversationCount || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs text-td-gray">总消息数</span>
                      <p className="text-xl font-bold text-td-dark">{userDetail.stats?.messageCount || 0}</p>
                    </div>
                  </div>
                </div>

                {/* 密保问题 */}
                {userDetail.securityAnswers?.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-td-dark mb-3">密保问题</h4>
                    <div className="space-y-2">
                      {userDetail.securityAnswers.map((sa, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs text-td-gray">问题：{sa.question}</span>
                          <p className="text-xs text-td-silver mt-0.5">设置于 {sa.created_at ? new Date(sa.created_at).toLocaleString('zh-CN', { hour12: false }) : '-'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-3 pt-2 border-t">
                  <button onClick={() => { setShowDetail(false); handleOpenEdit(selectedUser) }}
                    className="flex items-center gap-2 px-4 py-2 bg-td-blue text-white rounded-lg text-sm hover:bg-blue-600">
                    <Edit className="w-4 h-4" /> 编辑用户
                  </button>
                  <button onClick={() => handleToggleStatus(selectedUser.id, selectedUser.is_active)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedUser.is_active === 1 ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                    {selectedUser.is_active === 1 ? '封禁用户' : '解封用户'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-td-gray text-sm">加载中...</div>
            )}
          </div>
        </div>
      )}

      {/* ============ 编辑用户弹窗 ============ */}
      {showEdit && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowEdit(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-td-dark">编辑用户</h3>
              <button onClick={() => setShowEdit(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">昵称</label>
                <input type="text" value={editForm.nickname} onChange={e => setEditForm({ ...editForm, nickname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">手机号/邮箱</label>
                <input type="text" value={editForm.phoneOrEmail} onChange={e => setEditForm({ ...editForm, phoneOrEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">公司</label>
                <input type="text" value={editForm.company} onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">状态</label>
                <select value={editForm.isActive} onChange={e => setEditForm({ ...editForm, isActive: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red">
                  <option value={1}>正常</option>
                  <option value={0}>封禁</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t justify-end">
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-td-gray hover:bg-gray-50">取消</button>
              <button onClick={handleSaveEdit} className="flex items-center gap-2 px-4 py-2 bg-td-red text-white rounded-lg text-sm hover:bg-td-red-dark">
                <Save className="w-4 h-4" /> 保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ 新增用户弹窗 ============ */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-td-dark">新增用户</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">手机号/邮箱 <span className="text-red-500">*</span></label>
                <input type="text" value={createForm.phoneOrEmail} onChange={e => setCreateForm({ ...createForm, phoneOrEmail: e.target.value })}
                  placeholder="请输入手机号或邮箱" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">登录密码 <span className="text-red-500">*</span></label>
                <input type="password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="请输入密码" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">昵称</label>
                <input type="text" value={createForm.nickname} onChange={e => setCreateForm({ ...createForm, nickname: e.target.value })}
                  placeholder="可选" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">公司</label>
                <input type="text" value={createForm.company} onChange={e => setCreateForm({ ...createForm, company: e.target.value })}
                  placeholder="可选" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-td-gray hover:bg-gray-50">取消</button>
              <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-td-red text-white rounded-lg text-sm hover:bg-td-red-dark">
                <UserPlus className="w-4 h-4" /> 创建用户
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
