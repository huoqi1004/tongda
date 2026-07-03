import { Link } from 'react-router-dom'
import { ArrowRight, Phone, Grid, Shield, Cone, Award, Truck, Ruler, Clock, Building2, Landmark, Construction, Fish } from 'lucide-react'

const featuredProducts = [
  { id: 1, name: '荷兰网', desc: 'PVC浸塑防腐，波浪弯折柔韧性好', img: '/images/helan-wang.jpg' },
  { id: 2, name: '电焊网', desc: '焊点牢固，网孔均匀，整卷包装', img: '/images/dianhan-wang.jpg' },
  { id: 3, name: '钢板网', desc: '一体冲压菱形网，无焊点不开裂', img: '/images/gangban-wang.jpg' },
  { id: 5, name: '石笼卷', desc: '双绞六角编织，镀锌防腐防锈', img: '/images/shilong-juan.jpg' },
  { id: 12, name: '钢筋网片', desc: '冷轧带肋钢筋焊接，省时省力', img: '/images/gangjin-wangpian.jpg' },
  { id: 14, name: '双边丝护栏网', desc: '浸塑防腐，双边加固不易变形', img: '/images/shuangbi-hulan.jpg' },
  { id: 19, name: '波形护栏', desc: '形变吸能缓冲，阻挡车辆冲出', img: '/images/boxing-hulan.jpg' },
  { id: 25, name: '防撞桶', desc: '注水增重缓冲，红白反光醒目', img: '/images/fangzhuang-tong.jpg' },
]

const advantages = [
  { icon: Grid, title: '全品类现货', desc: '金属网、护栏、交通设施三大系列，千余种规格常备库存' },
  { icon: Award, title: '工程级品质', desc: '严格遵循国标生产，通过ISO9001质量管理体系认证' },
  { icon: Ruler, title: '规格可定制', desc: '支持按图纸定制孔径、丝径、尺寸，满足特殊工程需求' },
  { icon: Truck, title: '便捷交付', desc: '全国物流配送，支持整车发货和零担配送，准时交付' },
]

const scenes = [
  { icon: Building2, title: '建筑工程', desc: '钢筋网片、镀锌网片、堵灰网、网格布等建筑用网产品' },
  { icon: Landmark, title: '公路交通', desc: '波形护栏、市政护栏、防撞桶、路锥等交通安全设施' },
  { icon: Construction, title: '市政工程', desc: '市政道路护栏、施工围挡、钢格板等市政配套产品' },
  { icon: Fish, title: '养殖防护', desc: '荷兰网、电焊网、六角网等养殖围网防护产品' },
]

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-td-dark via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                通达丝网
                <span className="block text-td-red mt-2">专业金属丝网与工程防护</span>
              </h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                集研发、生产、销售于一体的综合性金属丝网企业。产品涵盖金属网类、护栏防护、交通设施三大系列，服务覆盖建筑工程、公路交通、市政工程、养殖防护等领域。
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products/metal-mesh" className="inline-flex items-center gap-2 px-6 py-3 bg-td-red hover:bg-td-red-dark text-white font-medium rounded-lg transition-colors">
                  浏览产品 <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white hover:bg-white hover:text-td-dark font-medium rounded-lg transition-colors">
                  <Phone className="w-4 h-4" /> 立即咨询
                </Link>
              </div>
            </div>
            <div className="hidden lg:block animate-fade-in">
              <div className="relative">
                <div className="w-full h-80 bg-gradient-to-br from-td-silver to-gray-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl">
                  <div className="text-center p-8">
                    <Grid className="w-20 h-20 text-white/30 mx-auto mb-4" />
                    <span className="text-white/50 text-lg">金属丝网产品展示</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-td-red rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold text-center leading-tight">品质<br/>保证</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-td-bg to-transparent"></div>
      </section>

      {/* Category Cards */}
      <section className="py-16 bg-td-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-td-dark">产品分类</h2>
            <p className="text-td-gray mt-3">三大系列产品，满足不同工程需求</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/products/metal-mesh" className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-td-red transition-colors">
                  <Grid className="w-8 h-8 text-td-red group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-td-dark mb-3">金属网类</h3>
                <p className="text-td-gray text-sm leading-relaxed">
                  荷兰网、电焊网、钢板网、压花网、六角网、石笼网、钢筋网片、镀锌网片、网格布等，广泛应用于建筑、养殖、筛分、护坡等领域。
                </p>
                <span className="inline-flex items-center gap-1 mt-4 text-td-red text-sm font-medium group-hover:gap-2 transition-all">
                  查看详情 <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            <Link to="/products/guardrail" className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-td-blue transition-colors">
                  <Shield className="w-8 h-8 text-td-blue group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-td-dark mb-3">护栏防护</h3>
                <p className="text-td-gray text-sm leading-relaxed">
                  双边丝护栏网、波形护栏、市政道路护栏、锌钢围墙护栏、球场框网、基坑护栏、施工围挡等，为各类工程提供安全防护解决方案。
                </p>
                <span className="inline-flex items-center gap-1 mt-4 text-td-red text-sm font-medium group-hover:gap-2 transition-all">
                  查看详情 <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            <Link to="/products/traffic" className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-yellow-500 transition-colors">
                  <Cone className="w-8 h-8 text-yellow-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-td-dark mb-3">交通设施</h3>
                <p className="text-td-gray text-sm leading-relaxed">
                  防撞桶、路锥、橡胶减速带、反光警示牌、反光膜、伸缩警戒带等，保障道路通行安全。
                </p>
                <span className="inline-flex items-center gap-1 mt-4 text-td-red text-sm font-medium group-hover:gap-2 transition-all">
                  查看详情 <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-td-dark">精选产品</h2>
            <p className="text-td-gray mt-3">品质可靠，规格齐全，现货供应</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-300">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-td-dark text-sm sm:text-base group-hover:text-td-red transition-colors">{product.name}</h4>
                  <p className="text-td-gray text-xs mt-1">{product.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Company Advantages */}
      <section className="py-16 bg-td-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {advantages.map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-td-red" />
                </div>
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Scenes */}
      <section className="py-16 bg-td-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-td-dark">应用场景</h2>
            <p className="text-td-gray mt-3">产品广泛应用于各类工程与防护领域</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {scenes.map((scene, idx) => (
              <div key={idx} className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 bg-td-bg rounded-xl flex items-center justify-center mx-auto mb-4">
                  <scene.icon className="w-7 h-7 text-td-red" />
                </div>
                <h4 className="font-bold text-td-dark mb-2">{scene.title}</h4>
                <p className="text-td-gray text-xs leading-relaxed">{scene.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 bg-td-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">需要定制化解决方案？</h2>
          <p className="text-red-100 mb-6">联系我们获取专业的产品选型建议和报价方案</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:17352186111" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-td-red font-medium rounded-lg hover:bg-gray-100 transition-colors">
              <Phone className="w-4 h-4" /> 17352186111
            </a>
            <a href="tel:13519672788" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-td-red font-medium rounded-lg hover:bg-gray-100 transition-colors">
              <Phone className="w-4 h-4" /> 13519672788
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}