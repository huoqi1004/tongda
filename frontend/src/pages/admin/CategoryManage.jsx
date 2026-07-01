import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, FolderTree } from 'lucide-react'
import api from '../../api'

// 把树形结构展平为带层级显示的数组
function flattenTree(tree, depth = 0, result = []) {
  for (const node of (tree || [])) {
    result.push({ ...node, _depth: depth })
    if (node.children && node.children.length) {
      flattenTree(node.children, depth + 1, result)
    }
  }
  return result
}

export default function CategoryManage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', parentId: null, sortOrder: 0, isActive: true })
  const [error, setError] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/categories')
      // 兼容多种返回结构
      const payload = res.data?.data ?? res.data
      const tree = payload?.list ?? payload?.items ?? (Array.isArray(payload) ? payload : [])
      const flat = flattenTree(Array.isArray(tree) ? tree : [])
      setCategories(flat)
    } catch (e) {
      setError('加载分类失败：' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const handleSave = async () => {
    if (!form.name || !form.slug) { alert('请填写分类名称和 slug'); return }
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        parentId: form.parentId || null,
        sortOrder: form.sortOrder || 0,
        isActive: form.isActive ? 1 : 0,
      }
      if (editing && editing !== 'new') {
        await api.put(`/categories/${editing}`, payload)
      } else {
        await api.post('/categories', payload)
      }
      setEditing(null)
      setForm({ name: '', slug: '', parentId: null, sortOrder: 0, isActive: true })
      fetchCategories()
    } catch (e) {
      alert('保存失败：' + (e.response?.data?.message || e.message))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('确定删除该分类？若有子分类将一起删除。')) return
    try { await api.delete(`/categories/${id}`); fetchCategories() }
    catch (e) { alert('删除失败：' + (e.response?.data?.message || e.message)) }
  }

  const handleEdit = (cat) => {
    setEditing(cat.id)
    setForm({
      name: cat.name || '',
      slug: cat.slug || '',
      parentId: cat.parent_id ?? null,
      sortOrder: cat.sort_order || 0,
      isActive: cat.is_active === 1 || cat.is_active === true,
    })
  }

  const startNew = () => {
    setEditing('new')
    setForm({ name: '', slug: '', parentId: null, sortOrder: 0, isActive: true })
  }

  // 父分类下拉选项（排除自己和自己的后代）
  const parentOptions = categories.filter(c => c.is_active !== false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-td-dark flex items-center gap-2">
          <FolderTree className="w-6 h-6 text-td-red" />
          分类管理
          <span className="text-sm font-normal text-td-gray ml-2">共 {categories.length} 项</span>
        </h2>
        <button onClick={startNew} className="flex items-center gap-2 px-4 py-2 bg-td-red text-white rounded-lg text-sm hover:bg-td-red-dark transition-colors">
          <Plus className="w-4 h-4" /> 新增分类
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

      {/* Edit Form */}
      {editing && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-td-dark mb-4">{editing === 'new' ? '新增分类' : '编辑分类'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-td-dark mb-1">分类名称 <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red" placeholder="如：不锈钢网" />
            </div>
            <div>
              <label className="block text-sm font-medium text-td-dark mb-1">路由标识 (Slug) <span className="text-red-500">*</span></label>
              <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red" placeholder="如：stainless-steel" />
            </div>
            <div>
              <label className="block text-sm font-medium text-td-dark mb-1">父分类</label>
              <select value={form.parentId ?? ''} onChange={e => setForm({ ...form, parentId: e.target.value ? Number(e.target.value) : null })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red">
                <option value="">— 顶级分类 —</option>
                {parentOptions.filter(c => c.id !== editing).map(c => (
                  <option key={c.id} value={c.id}>{'— '.repeat(c._depth || 0)}{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-td-dark mb-1">排序权重</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-td-red" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-td-dark">启用状态</label>
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-td-red" />
              <span className="text-xs text-td-gray">{form.isActive ? '启用' : '禁用'}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-td-red text-white rounded-lg text-sm hover:bg-td-red-dark">
              <Save className="w-4 h-4" /> 保存
            </button>
            <button onClick={() => setEditing(null)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-td-gray hover:bg-gray-50">
              <X className="w-4 h-4" /> 取消
            </button>
          </div>
        </div>
      )}

      {/* Category Tree Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray w-16">ID</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">分类名称</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray">Slug</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray w-24">排序</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-td-gray w-24">状态</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-td-gray w-32">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-td-gray text-sm">加载中...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-td-gray text-sm">暂无分类数据，点击右上角"新增分类"开始添加</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-td-dark">{cat.id}</td>
                <td className="px-4 py-3 text-sm font-medium text-td-dark">
                  <span style={{ paddingLeft: `${(cat._depth || 0) * 20}px` }}>
                    {(cat._depth || 0) > 0 && <span className="text-td-silver mr-1">└─</span>}
                    {cat.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-td-gray font-mono">{cat.slug || '-'}</td>
                <td className="px-4 py-3 text-sm text-td-gray">{cat.sort_order || 0}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${(cat.is_active === 1 || cat.is_active === true) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {(cat.is_active === 1 || cat.is_active === true) ? '启用' : '禁用'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(cat)} className="inline-flex items-center justify-center p-2 text-td-blue hover:bg-blue-50 rounded-lg transition-colors" title="编辑">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="inline-flex items-center justify-center p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="删除">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}