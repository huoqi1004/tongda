import { useState, useEffect } from 'react'
import { Users, TrendingUp, Package, MessageSquare, Mail } from 'lucide-react'
import api from '../../api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats')
        if (res.data.code === 0) {
          setStats(res.data.data)
        }
      } catch { /* ignore */ } finally { setLoading(false) }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="text-center py-12 text-td-gray">加载中...</div>

  const cards = [
    { label: '产品总数', value: stats?.productCount || 0, icon: Package, color: 'bg-blue-500' },
    { label: '注册用户', value: stats?.userCount || 0, icon: Users, color: 'bg-green-500' },
    { label: '咨询会话', value: stats?.conversationCount || 0, icon: MessageSquare, color: 'bg-yellow-500' },
    { label: '消息总数', value: stats?.messageCount || 0, icon: TrendingUp, color: 'bg-purple-500' },
  ]

  const subCards = [
    { label: '今日新增用户', value: stats?.todayUsers || 0, color: 'text-green-600' },
    { label: '今日消息数', value: stats?.todayMessages || 0, color: 'text-blue-600' },
    { label: '未读留言', value: stats?.contactCount || 0, icon: Mail, color: 'text-red-600' },
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

      {/* 子统计 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {subCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
            <span className="text-td-gray text-sm">{card.label}</span>
            <span className={`text-xl font-bold ${card.color}`}>{card.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-td-dark mb-4">欢迎使用通达丝网后台管理系统</h3>
        <div className="space-y-2 text-sm text-td-gray leading-relaxed">
          <p>您可以通过左侧菜单管理以下内容：</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>产品管理</strong> - 增删改查产品信息，管理产品上下架</li>
            <li><strong>分类管理</strong> - 管理产品分类和子分类</li>
            <li><strong>用户管理</strong> - 查看注册用户、编辑用户信息、封禁/解封、删除用户</li>
            <li><strong>客服工作台</strong> - 查看用户咨询会话、接管人工客服、回复用户</li>
            <li><strong>知识库管理</strong> - 上传和管理产品知识文档，为AI客服提供知识</li>
            <li><strong>消息记录</strong> - 查看和导出所有客服对话记录</li>
          </ul>
          <p className="mt-4 text-td-silver">如需帮助，请参考系统文档或联系技术支持。</p>
        </div>
      </div>
    </div>
  )
}
