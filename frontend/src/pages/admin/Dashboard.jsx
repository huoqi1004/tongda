import { useState, useEffect } from 'react'
import { Users, TrendingUp, Package, MessageSquare } from 'lucide-react'
import api from '../../api'

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, users: 0, conversations: 0, messages: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pRes, uRes, cRes] = await Promise.all([
          api.get('/products'),
          api.get('/admin/users'),
          api.get('/admin/conversations'),
        ])
        setStats({
          products: (pRes.data.data || pRes.data || []).length,
          users: (uRes.data.data || {}).total || 0,
          conversations: (cRes.data.data || {}).total || 0,
          messages: 0,
        })
      } catch { /* ignore */ }
    }
    fetchStats()
  }, [])

  const cards = [
    { label: '产品总数', value: stats.products, icon: Package, color: 'bg-blue-500' },
    { label: '注册用户', value: stats.users, icon: Users, color: 'bg-green-500' },
    { label: '咨询会话', value: stats.conversations, icon: MessageSquare, color: 'bg-yellow-500' },
    { label: '本月消息', value: stats.messages, icon: TrendingUp, color: 'bg-purple-500' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-td-dark mb-6">控制台概览</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-td-gray text-sm">{card.label}</p>
              <p className="text-2xl font-bold text-td-dark">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-td-dark mb-4">欢迎使用通达丝网后台管理系统</h3>
        <p className="text-td-gray text-sm leading-relaxed">
          您可以通过左侧菜单管理产品信息、用户数据、客户咨询和知识库内容。如需帮助，请参考系统文档或联系技术支持。
        </p>
      </div>
    </div>
  )
}