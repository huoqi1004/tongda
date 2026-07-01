import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import AdminLayout from './components/Layout/AdminLayout'
import Home from './pages/Home'
import MetalMesh from './pages/MetalMesh'
import Guardrail from './pages/Guardrail'
import TrafficTools from './pages/TrafficTools'
import ProductDetail from './pages/ProductDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import UserCenter from './pages/UserCenter'
import AdminLogin from './pages/admin/AdminLogin'
import AdminForgotPassword from './pages/admin/AdminForgotPassword'
import Dashboard from './pages/admin/Dashboard'
import ProductManage from './pages/admin/ProductManage'
import CategoryManage from './pages/admin/CategoryManage'
import UserManage from './pages/admin/UserManage'
import ServiceDesk from './pages/admin/ServiceDesk'
import KnowledgeBase from './pages/admin/KnowledgeBase'
import MessageLog from './pages/admin/MessageLog'
import ChatWidget from './components/ChatWidget/ChatWidget'

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products/metal-mesh" element={<MetalMesh />} />
          <Route path="/products/guardrail" element={<Guardrail />} />
          <Route path="/products/traffic" element={<TrafficTools />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/user" element={<UserCenter />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<ProductManage />} />
          <Route path="/admin/categories" element={<CategoryManage />} />
          <Route path="/admin/users" element={<UserManage />} />
          <Route path="/admin/service-desk" element={<ServiceDesk />} />
          <Route path="/admin/knowledge" element={<KnowledgeBase />} />
          <Route path="/admin/messages" element={<MessageLog />} />
        </Route>
        <Route path="*" element={<Home />} />
      </Routes>
      <ChatWidget />
    </>
  )
}