import { useState, useEffect } from 'react'
import { Plus, Upload, Trash2, RefreshCw, Edit, X, Save, FileText, Image as ImageIcon } from 'lucide-react'
import api from '../../api'

export default function KnowledgeBase() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingDoc, setEditingDoc] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', category: 'general' })
  const [uploading, setUploading] = useState(false)
  const [supportedTypes, setSupportedTypes] = useState(null)
  const [uploadMessage, setUploadMessage] = useState('')

  const fetchDocs = async () => {
    try {
      const res = await api.get('/knowledge/docs')
      // 后端返回: { code:0, data: { list: [...] } }
      // res (Axios) → res.data = { code:0, data: { list: [...] } }
      // res.data.data = { list: [...] }
      setDocs(res.data.data?.list || [])
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  const fetchSupportedTypes = async () => {
    try {
      const res = await api.get('/knowledge/supported-types')
      if (res.data.code === 0) {
        setSupportedTypes(res.data.data)
      }
    } catch (err) {
      console.error('获取支持的文件类型失败:', err)
    }
  }

  useEffect(() => { 
    fetchDocs()
    fetchSupportedTypes()
  }, [])

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
    
    // 检查文件大小（10MB限制）
    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过10MB')
      e.target.value = ''
      return
    }

    setUploading(true)
    setUploadMessage('')
    const formData = new FormData()
    formData.append('file', file)
    
    // 获取文件扩展名
    const fileName = file.name.toLowerCase()
    const ext = fileName.substring(fileName.lastIndexOf('.'))
    
    try {
      const res = await api.post('/knowledge/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      
      if (res.data.code === 0) {
        setUploadMessage(`✅ ${res.data.message}`)
        if (res.data.data.isImage) {
          setUploadMessage(`${res.data.message}\n\n💡 提示：图片需要配置OCR服务才能识别内容`)
        }
        fetchDocs()
      } else {
        setUploadMessage(`❌ ${res.data.message}`)
      }
    } catch (err) {
      setUploadMessage(`❌ 上传失败: ${err.response?.data?.message || err.message}`)
    } finally {
      setUploading(false)
      e.target.value = ''
      setTimeout(() => setUploadMessage(''), 5000)
    }
  }

  if (loading) return <div className="text-center py-12 text-td-gray">加载中...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-td-dark">知识库管理</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 border border-td-red text-td-red rounded-lg text-sm cursor-pointer hover:bg-red-50 transition-colors">
            <Upload className="w-4 h-4" /> {uploading ? '上传中...' : '上传文档'}
            <input 
              type="file" 
              accept=".pdf,.doc,.docx,.md,.txt,.html,.csv,.json,.jpg,.jpeg,.png,.gif,.bmp" 
              onChange={handleUpload} 
              className="hidden" 
            />
          </label>
          <button onClick={() => { setEditingDoc('new'); setForm({ title: '', content: '', category: 'general' }) }} className="flex items-center gap-2 px-4 py-2 bg-td-red text-white rounded-lg text-sm hover:bg-td-red-dark">
            <Plus className="w-4 h-4" /> 新增文档
          </button>
        </div>
      </div>

      {/* 上传提示信息 */}
      {supportedTypes && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">📁 支持的文件格式</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-medium text-blue-700 mb-1">📄 文档类型：</p>
              <div className="flex flex-wrap gap-1">
                {supportedTypes.documents.map((type) => (
                  <span key={type.ext} className="px-2 py-1 bg-white rounded border border-blue-200 text-blue-600">
                    {type.ext.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-medium text-blue-700 mb-1">🖼️ 图片类型：</p>
              <div className="flex flex-wrap gap-1">
                {supportedTypes.images.map((type) => (
                  <span key={type.ext} className="px-2 py-1 bg-white rounded border border-blue-200 text-blue-600">
                    {type.ext.toUpperCase()}
                    {type.ocr && ' (需OCR)'}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-blue-600 mt-2">💡 提示：文档会自动提取文字内容并建立索引，图片需要配置OCR服务才能识别文字</p>
        </div>
      )}

      {/* 上传消息提示 */}
      {uploadMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          uploadMessage.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
          uploadMessage.startsWith('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          <pre className="whitespace-pre-wrap">{uploadMessage}</pre>
        </div>
      )}

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