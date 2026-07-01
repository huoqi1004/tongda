import { useState } from 'react'
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react'

const initialProducts = [
  { id: 1, name: '不锈钢编织网', category: '金属网类', price: '¥50-200/㎡', stock: '充足', status: '上架' },
  { id: 2, name: '不锈钢方孔网', category: '金属网类', price: '¥60-180/㎡', stock: '充足', status: '上架' },
  { id: 3, name: '建筑网片', category: '金属网类', price: '¥15-80/㎡', stock: '充足', status: '上架' },
  { id: 4, name: '公路防护网', category: '护栏防护', price: '¥30-120/㎡', stock: '充足', status: '上架' },
  { id: 5, name: '锌钢护栏', category: '护栏防护', price: '¥80-300/m', stock: '充足', status: '上架' },
  { id: 6, name: '反光锥桶', category: '交通设施', price: '¥15-60/个', stock: '充足', status: '上架' },
  { id: 7, name: '交通标志牌', category: '交通设施', price: '¥80-500/块', stock: '充足', status: '上架' },
  { id: 8, name: '铁路防护网', category: '护栏防护', price: '¥40-150/㎡', stock: '充足', status: '上架' },
]

export default function ProductManage() {
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', category: '', price: '', stock: '', status: '上架' })

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', category: '', price: '', stock: '', status: '上架' })
    setShowModal(true)
  }

  const openEdit = (product) => {
    setEditing(product)
    setForm({ name: product.name, category: product.category, price: product.price, stock: product.stock, status: product.status })
    setShowModal(true)
  }

  const handleSave = () => {
    if (editing) {
      setProducts(products.map(p => p.id === editing.id ? { ...editing, ...form } : p))
    } else {
      setProducts([...products, { id: Date.now(), ...form }])
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('确定删除该产品？')) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const filtered = products.filter(p =>
    p.name.includes(search) || p.category.includes(search)
  )

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索产品名称..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-td-red focus:border-td-red outline-none" />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-td-red text-white rounded-lg text-sm font-medium hover:bg-td-red-dark transition-colors">
          <Plus className="w-4 h-4" /> 添加产品
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-td-gray font-medium">ID</th>
                <th className="px-6 py-3 text-left text-td-gray font-medium">产品名称</th>
                <th className="px-6 py-3 text-left text-td-gray font-medium">分类</th>
                <th className="px-6 py-3 text-left text-td-gray font-medium">参考价格</th>
                <th className="px-6 py-3 text-left text-td-gray font-medium">库存</th>
                <th className="px-6 py-3 text-left text-td-gray font-medium">状态</th>
                <th className="px-6 py-3 text-left text-td-gray font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-td-dark">{product.id}</td>
                  <td className="px-6 py-3 text-td-dark font-medium">{product.name}</td>
                  <td className="px-6 py-3 text-td-gray">{product.category}</td>
                  <td className="px-6 py-3 text-td-dark">{product.price}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">{product.stock}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.status === '上架' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{product.status}</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-td-gray">暂无产品数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-td-dark">{editing ? '编辑产品' : '添加产品'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">产品名称</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-td-red focus:border-td-red outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">分类</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-td-red focus:border-td-red outline-none">
                  <option value="">请选择分类</option>
                  <option value="金属网类">金属网类</option>
                  <option value="护栏防护">护栏防护</option>
                  <option value="交通设施">交通设施</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">参考价格</label>
                <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-td-red focus:border-td-red outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">库存状态</label>
                <select value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-td-red focus:border-td-red outline-none">
                  <option value="">请选择</option>
                  <option value="充足">充足</option>
                  <option value="紧张">紧张</option>
                  <option value="缺货">缺货</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-td-dark mb-1">上架状态</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-td-red focus:border-td-red outline-none">
                  <option value="上架">上架</option>
                  <option value="下架">下架</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-td-gray hover:bg-gray-50 transition-colors">取消</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-td-red text-white rounded-lg text-sm font-medium hover:bg-td-red-dark transition-colors">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}