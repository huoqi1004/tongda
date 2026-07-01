import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, FolderTree, Users, Headphones, BookOpen, MessageSquare, LogOut, Menu, X, ChevronLeft } from 'lucide-react'

const menuItems = [
  { to: '/admin/dashboard', label: '控制台', icon: LayoutDashboard },
  { to: '/admin/products', label: '产品管理', icon: Package },
  { to: '/admin/categories', label: '分类管理', icon: FolderTree },
  { to: '/admin/users', label: '用户管理', icon: Users },
  { to: '/admin/service-desk', label: '客服工作台', icon: Headphones },
  { to: '/admin/knowledge', label: '知识库管理', icon: BookOpen },
  { to: '/admin/messages', label: '消息记录', icon: MessageSquare },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminUser, setAdminUser] = useState(null)
  const location = useLocation()

  // 仅在首次挂载时检查登录态，避免子路由切换时 useEffect 重跑导致跳回登录页
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const user = localStorage.getItem('adminUser')
    if (!token) {
      window.location.replace('/admin/login')
      return
    }
    try {
      setAdminUser(JSON.parse(user || '{}'))
    } catch {
      setAdminUser({ username: '管理员' })
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    window.location.href = '/admin/login'
  }

  const isActive = (path) => {
    if (path === '/admin/dashboard') return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-td-dark text-white transition-all duration-300 flex flex-col shrink-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          {sidebarOpen && <span className="text-lg font-bold text-td-red">通达丝网 · 后台</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white">
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive(item.to) ? 'bg-td-red text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full">
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-semibold text-td-dark">
            {menuItems.find(m => isActive(m.to))?.label || '控制台'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-td-gray">欢迎，{adminUser?.username || '管理员'}</span>
            <div className="w-8 h-8 bg-td-red text-white rounded-full flex items-center justify-center text-sm font-medium">
              {adminUser?.username?.[0] || '管'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}