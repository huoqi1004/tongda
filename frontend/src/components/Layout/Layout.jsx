import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, Phone, MapPin, Grid, Shield, Cone, User, LogOut, MessageCircle } from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const userMenuRef = useRef(null)
  const [authState, setAuthState] = useState(useAuthStore.getState())

  useEffect(() => {
    const unsub = useAuthStore.subscribe((s) => setAuthState(s))
    return unsub
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => { setMobileOpen(false); setDropdownOpen(false) }, [location])

  const isActive = (path) => location.pathname === path ? 'text-td-red border-b-2 border-td-red' : 'text-td-dark hover:text-td-red'

  const navLinks = [
    { to: '/', label: '首页' },
    { to: '/about', label: '关于我们' },
    { to: '/contact', label: '联系我们' },
  ]

  const productLinks = [
    { to: '/products/metal-mesh', label: '金属网类', icon: Grid },
    { to: '/products/guardrail', label: '护栏防护', icon: Shield },
    { to: '/products/traffic', label: '交通设施', icon: Cone },
  ]

  const handleLogout = () => {
    useAuthStore.logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-td-bg">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-td-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">通</span>
              </div>
              <span className="text-xl font-bold text-td-red tracking-wide">通达丝网</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className={`px-4 py-5 text-sm font-medium transition-colors border-b-2 border-transparent ${isActive(link.to)}`}>
                  {link.label}
                </Link>
              ))}

              {/* Products Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`px-4 py-5 text-sm font-medium transition-colors border-b-2 border-transparent flex items-center gap-1 ${location.pathname.startsWith('/products') ? 'text-td-red border-b-2 border-td-red' : 'text-td-dark hover:text-td-red'}`}
                >
                  产品中心
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-0 w-48 bg-white rounded-b-lg shadow-lg border border-gray-100 py-2 animate-fade-in">
                    {productLinks.map((item) => (
                      <Link key={item.to} to={item.to} className="flex items-center gap-3 px-4 py-3 text-sm text-td-dark hover:bg-td-bg hover:text-td-red transition-colors">
                        <item.icon className="w-4 h-4 text-td-red" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {authState.user ? (
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-td-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {authState.user.nickname?.[0] || authState.user.phone?.[0] || 'U'}
                    </div>
                    <span className="text-sm text-td-dark">{authState.user.nickname || authState.user.phone}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in">
                      <Link to="/user" className="flex items-center gap-2 px-4 py-2 text-sm text-td-dark hover:bg-td-bg transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <User className="w-4 h-4" />个人中心
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-td-bg transition-colors w-full">
                        <LogOut className="w-4 h-4" />退出登录
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-td-red text-white rounded-lg text-sm font-medium hover:bg-td-red-dark transition-colors">
                  <User className="w-4 h-4" />登录/注册
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button className="md:hidden p-2 text-td-dark hover:text-td-red" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive(link.to)}`}>
                  {link.label}
                </Link>
              ))}
              <div className="px-3 py-2 text-sm font-medium text-td-gray">产品中心</div>
              {productLinks.map((item) => (
                <Link key={item.to} to={item.to} className="flex items-center gap-3 px-6 py-2.5 rounded-lg text-sm text-td-dark hover:text-td-red hover:bg-td-bg">
                  <item.icon className="w-4 h-4 text-td-red" />{item.label}
                </Link>
              ))}
              {authState.user ? (
                <>
                  <Link to="/user" className="block px-3 py-2.5 rounded-lg text-sm font-medium text-td-dark hover:text-td-red">个人中心</Link>
                  <button onClick={handleLogout} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full text-left">退出登录</button>
                </>
              ) : (
                <Link to="/login" className="block px-3 py-2.5 rounded-lg text-sm font-medium text-td-red hover:bg-red-50">登录/注册</Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-td-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-td-red rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">通</span>
                </div>
                <span className="text-lg font-bold text-white">通达丝网</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                通达丝网是一家专业从事金属丝网产品研发、生产、销售于一体的综合性企业。产品涵盖金属网类、护栏防护、交通设施三大系列，广泛应用于建筑工程、公路交通、市政工程、养殖防护等领域。
              </p>
            </div>

            {/* Column 2: Products */}
            <div>
              <h3 className="text-white font-semibold mb-4">产品分类</h3>
              <ul className="space-y-2">
                {productLinks.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-gray-300 text-sm hover:text-td-red transition-colors flex items-center gap-2">
                      <item.icon className="w-3.5 h-3.5" />{item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">联系方式</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-td-red mt-0.5 shrink-0" />
                  <div>
                    <a href="tel:17352186111" className="hover:text-td-red transition-colors">17352186111</a>
                    <span className="mx-2">/</span>
                    <a href="tel:13519672788" className="hover:text-td-red transition-colors">13519672788</a>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-td-red mt-0.5 shrink-0" />
                  <span>久和建材市场A区32-35</span>
                </div>
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-td-red mt-0.5 shrink-0" />
                  <span>微信：17352186111</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-xs">
            <p>&copy; {new Date().getFullYear()} 通达丝网 版权所有 | 专业金属丝网与工程防护解决方案提供商</p>
          </div>
        </div>
      </footer>
    </div>
  )
}