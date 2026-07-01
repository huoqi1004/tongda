import { useState, useEffect } from 'react'
import { Plus, Upload, Trash2, RefreshCw, Edit, X, Save } from 'lucide-react'
import api from '../../api'

export default function KnowledgeBase() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingDoc, setEditingDoc] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', category: 'general' })
  const [uploading, setUploading] = useState(false)

  const fetchDocs = async () => {
    try {
      const res = await api.get('/knowledge/docs')
      setDocs(res.data.data?.items || res.data.data || res.data || [])
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchDocs() }, [])

  const handleSave = async () => {
    try {
      if (editingDoc && editingDoc !== 'new') {
        await api.put(`/knowledge/docs/${editingDoc}`, form)
      } else {
        await api.post('/knowledge/docs', form)
      }
      setEditingDoc(null)
      setForm({ title: '', content: '', category: 'general' })
      fetchDocs()
    } catch { alert('操作失败') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('确定删除该文档？删除后不可恢复。')) return
    try { await api.delete(`/knowledge/docs/${id}`); fetchDocs() } catch { alert('删除失败') }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await api.post('/knowledge/upload', formData)
      fetchDocs()
      alert('上传成功，文档已自动切分并向量化')
    } catch { alert('上传失败') }
    setUploading(false)
    e.target.value = ''
  }

  if (loading) return <div className="text-center py-12 text-td-gray">加载中...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-td-dark">知识库管理</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 border border-td-red text-td-red rounded-lg text-sm cursor-pointer hover:bg-red-50 transition-colors">
            <Upload className="w-4 h-4" /> {uploading ? '上传中...' : '上传文档'}
            <input type="file" accept=".pdf,.doc,.docx,.md,.txt" onChange={handleUpload} className="hidden" />
          </label>
          <button onClick={() => { setEditingDoc('new'); setForm({ title: '', content: '', category: 'general' }) }} className="flex items-center gap-2 px-4 py-2 bg-td-red text-white rounded-lg text-sm hover:bg-td-red-dark">
            <Plus className="w-4 h-4" /> 新增文档
          </button>
        </div>
      </div>

      {/* Edit Form */}
      {editingDoc && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingDoc === 'new' ? '新增文档' : '编辑文档'}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">文档标题</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">分类</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red">
                  <option value="general">通用</option>
                  <option value="product">产品说明</option>
                  <option value="faq">常见问题</option>
                  <option value="delivery">配送政策</option>
                  <option value="custom">定制流程</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-td-dark mb-1">文档内容</label>
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={8} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red resize-vertical" placeholder="输入文档内容，将自动切分并向量化..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-td-red text-white rounded-lg text-sm hover:bg-td-red-dark">
              <Save className="w-4 h-4" /> 保存
            </button>
            <button onClick={() => setEditingDoc(null)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-td-gray hover:bg-gray-50">
              <X className="w-4 h-4" /> 取消
            </button>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">ID</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">文档标题</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">分类</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">片段数</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">向量化</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">更新时间</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-td-gray">操作</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-td-dark">{doc.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-td-dark">{doc.title}</td>
                <td className="px-4 py-3 text-sm text-td-gray">{doc.category || '通用'}</td>
                <td className="px-4 py-3 text-sm text-td-gray">{doc.chunk_count || 0}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${doc.vectorized ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {doc.vectorized ? '已向量化' : '未向量化'}
                    {!doc.vectorized && <RefreshCw className="w-3 h-3 animate-spin" />}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-td-gray">{doc.updated_at ? new Date(doc.updated_at).toLocaleString() : '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditingDoc(doc.id); setForm({ title: doc.title, content: doc.content || '', category: doc.category || 'general' }) }} className="p-2 text-td-blue hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(doc.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {docs.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-td-gray text-sm">暂无知识库文档，请上传或新增文档</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}