import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const groups = [
  {
    title: '路面警示类',
    desc: '用于道路施工、危险区域警示，确保行人和车辆安全',
    products: [
      { id: 28, name: '反光锥桶', desc: 'PVC材质，高反光膜覆面，夜间警示效果优异，耐压抗冲击，适用于道路施工、停车场等场景。', img: '/images/微信图片_20260621172414_355_186.jpg', specs: '高度：45/70/90cm | 重量：1.5-4.5kg | 反光等级：高强级' },
      { id: 29, name: '警示柱', desc: 'PU材质，弹性好，抗撞击，红白相间高反光，用于路口、出入口、弯道等警示。', img: '/images/微信图片_20260621172415_356_186.jpg', specs: '高度：45/75cm | 直径：8cm | 材质：PU/PE' },
      { id: 30, name: '减速带', desc: '优质橡胶/铸钢材质，黄黑相间醒目警示，有效降低车速，保障通行安全。', img: '/images/微信图片_20260621172421_361_186.jpg', specs: '长度：25-100cm | 宽度：30-35cm | 高度：5cm' },
    ],
  },
  {
    title: '隔离警示类',
    desc: '用于临时或永久性区域隔离，维护秩序与安全',
    products: [
      { id: 31, name: '隔离墩', desc: 'PE滚塑一体成型，可注水增重，红白警示色，用于道路施工、停车场等临时隔离。', img: '/images/微信图片_20260621172337_326_186.jpg', specs: '尺寸：900x500mm | 注水重量：60kg | 材质：PE' },
      { id: 32, name: '施工围挡', desc: '镀锌钢管框架+彩钢板面板，坚固耐用，可重复使用，用于建筑工地、市政工程围挡。', img: '/images/微信图片_20260621172339_328_186.jpg', specs: '高度：2-2.5m | 宽度：2-3m/块 | 板材：彩钢板' },
      { id: 33, name: '伸缩护栏', desc: '铝合金框架+尼龙网带，可伸缩折叠，携带方便，用于临时隔离、排队引导等场景。', img: '/images/微信图片_20260621172343_331_186.jpg', specs: '伸展长度：3-5m | 高度：1m | 材质：铝合金' },
    ],
  },
  {
    title: '防撞防护类',
    desc: '用于重点设施和区域的防撞保护',
    products: [
      { id: 34, name: '防撞桶', desc: 'PE滚塑成型，可注水/沙，黄黑警示色，用于匝道口、收费站前等防撞缓冲。', img: '/images/微信图片_20260621172346_333_186.jpg', specs: '直径：60/90cm | 高度：80/120cm | 材质：PE' },
      { id: 35, name: '防撞柱', desc: '镀锌钢管+反光膜，地基预埋式安装，抗冲击力强，用于保护建筑出入口、设备等。', img: '/images/微信图片_20260621172351_336_186.jpg', specs: '管径：76-114mm | 高度：0.6-1m | 壁厚：3-4mm' },
      { id: 36, name: '水马围栏', desc: 'PE吹塑一次成型，可注水连接，红黄警示色，用于道路分流、施工区隔离。', img: '/images/微信图片_20260621172352_337_186.jpg', specs: '长度：1.5m | 高度：0.8m | 注水重量：120kg' },
    ],
  },
  {
    title: '安全标识类',
    desc: '各类安全警示标识，提醒注意安全',
    products: [
      { id: 37, name: '安全警示牌', desc: '铝板/塑料板+反光膜，图文清晰，耐候性好，用于工地、厂区安全警示。', img: '/images/微信图片_20260621172356_340_186.jpg', specs: '尺寸：40x60cm | 材质：铝板/塑料 | 反光等级：工程级/高强级' },
      { id: 38, name: '施工标志牌', desc: '铝合金框架+反光膜面板，内容可定制，折叠式支架，便于携带和摆放。', img: '/images/微信图片_20260621172359_343_186.jpg', specs: '尺寸：可定制 | 支架：折叠式 | 材质：铝合金框架' },
    ],
  },
  {
    title: '交通标识类',
    desc: '道路指示、禁令、警告等交通标志',
    products: [
      { id: 39, name: '交通标志牌', desc: '铝板+高强级反光膜，符合国标GB5768，用于道路指示、禁令、警告等交通标识。', img: '/images/微信图片_20260621172403_346_186.jpg', specs: '板厚：1.5-3mm | 反光等级：高强级/超强级 | 规格可定制' },
      { id: 40, name: '道路指示牌', desc: '大型铝板拼接+反光膜，用于高速公路、国道省道等道路导向指示。', img: '/images/微信图片_20260621172405_348_186.jpg', specs: '板厚：2-3mm | 反光膜：3M工程级 | 尺寸可定制' },
      { id: 41, name: '太阳能爆闪灯', desc: '太阳能供电，LED高亮闪烁，用于路口、弯道、施工区域等危险路段警示。', img: '/images/微信图片_20260621172407_350_186.jpg', specs: 'LED数量：8-16个 | 太阳能板：5-10W | 蓄电池：12V/7AH' },
    ],
  },
]

export default function TrafficTools() {
  return (
    <div className="bg-td-bg min-h-screen">
      <section className="bg-gradient-to-r from-td-dark to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">交通设施产品中心</h1>
          <p className="text-gray-300">路面警示、隔离防护、防撞设施、安全标识等全系列交通安全产品</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {groups.map((group, gIdx) => (
            <div key={gIdx}>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-td-dark mb-2 flex items-center gap-3">
                  <span className="w-1.5 h-7 bg-td-red rounded-full inline-block"></span>
                  {group.title}
                </h2>
                <p className="text-td-gray ml-5">{group.desc}</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.products.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="group bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-300">
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                      <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-td-dark group-hover:text-td-red transition-colors mb-2">{product.name}</h3>
                      <p className="text-td-gray text-sm leading-relaxed mb-3 line-clamp-2">{product.desc}</p>
                      <p className="text-xs text-td-silver mb-3">{product.specs}</p>
                      <span className="inline-flex items-center gap-1 text-td-red text-sm font-medium group-hover:gap-2 transition-all">
                        查看详情 <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}