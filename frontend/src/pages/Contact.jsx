import { useState } from 'react'
import { Phone, MapPin, MessageCircle, Mail, User, Send, Clock } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setForm({ name: '', phone: '', message: '' })
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="bg-td-bg min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-td-dark to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">联系我们</h1>
          <p className="text-gray-300">期待与您的合作，欢迎来电咨询</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left: Contact Info */}
            <div>
              <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                <h2 className="text-xl font-bold text-td-dark mb-6">联系方式</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-td-red" />
                    </div>
                    <div>
                      <p className="text-td-gray text-xs mb-1">负责人</p>
                      <p className="text-td-dark font-semibold">夏宇轩</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-td-red" />
                    </div>
                    <div>
                      <p className="text-td-gray text-xs mb-1">联系电话</p>
                      <a href="tel:17352186111" className="text-td-dark font-semibold hover:text-td-red transition-colors block">17352186111</a>
                      <a href="tel:13519672788" className="text-td-dark font-semibold hover:text-td-red transition-colors block mt-1">13519672788</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-td-red" />
                    </div>
                    <div>
                      <p className="text-td-gray text-xs mb-1">公司地址</p>
                      <p className="text-td-dark font-semibold">久和建材市场A区32-35</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-td-red" />
                    </div>
                    <div>
                      <p className="text-td-gray text-xs mb-1">微信</p>
                      <p className="text-td-dark font-semibold">17352186111</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-td-red" />
                    </div>
                    <div>
                      <p className="text-td-gray text-xs mb-1">工作时间</p>
                      <p className="text-td-dark font-semibold">周一至周日 8:00 - 20:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WeChat QR */}
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <h3 className="font-bold text-td-dark mb-4">微信扫码添加好友</h3>
                <img src="/images/微信好友添加二维码.jpg" alt="微信二维码" className="w-48 h-48 mx-auto rounded-lg border border-gray-200" />
                <p className="text-td-gray text-sm mt-3">扫描二维码添加微信<br />在线咨询产品详情</p>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div>
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-xl font-bold text-td-dark mb-2">在线留言</h2>
                <p className="text-td-gray text-sm mb-6">如有任何疑问或需求，请填写以下表单，我们将尽快与您联系。</p>

                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Send className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-green-700 font-semibold">留言提交成功！</p>
                    <p className="text-green-600 text-sm mt-1">我们将尽快与您联系，感谢您的信任。</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-td-dark mb-1.5">您的姓名 <span className="text-td-red">*</span></label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="请输入您的姓名" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-td-dark mb-1.5">联系电话 <span className="text-td-red">*</span></label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-td-silver" />
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="请输入您的联系电话" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-td-dark mb-1.5">留言内容</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-td-silver" />
                        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="请描述您的需求，如产品类型、规格要求、数量等..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-td-red focus:border-td-red outline-none text-sm resize-none" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-td-red text-white rounded-lg font-medium hover:bg-td-red-dark transition-colors flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" /> 提交留言
                    </button>
                  </form>
                )}
              </div>

              {/* Direct Contact */}
              <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-td-dark mb-4">紧急联系</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="tel:17352186111" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-td-red text-white rounded-lg font-medium hover:bg-td-red-dark transition-colors text-sm">
                    <Phone className="w-4 h-4" /> 拨打 17352186111
                  </a>
                  <a href="tel:13519672788" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-td-red text-td-red rounded-lg font-medium hover:bg-td-red hover:text-white transition-colors text-sm">
                    <Phone className="w-4 h-4" /> 拨打 13519672788
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}