import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'highway', label: '公路防护网' },
  { key: 'railway', label: '铁路防护网' },
  { key: 'zinc-steel', label: '锌钢护栏' },
  { key: 'lawn', label: '草坪护栏' },
  { key: 'municipal', label: '市政护栏' },
]

const products = [
  {
    id: 16, category: 'highway', name: '公路防护网', desc: '采用低碳钢丝焊接后热镀锌处理，防腐性能优异，使用寿命长达15年以上，是高速公路、国道省道安全防护的首选产品。',
    img: '/images/微信图片_20260621172337_326_186.jpg',
    specs: '丝径：3-5mm | 孔径：50x50 / 75x75mm | 高度：1.2-2.5m',
  },
  {
    id: 17, category: 'highway', name: '高速公路隔离栅', desc: '优质Q235低碳钢丝焊接成型，表面热镀锌+浸塑双重防腐处理，坚固耐用，有效隔离行人与车辆。',
    img: '/images/微信图片_20260621172339_328_186.jpg',
    specs: '丝径：3.5-5mm | 网孔：50x100mm | 立柱：48x2mm钢管',
  },
  {
    id: 18, category: 'highway', name: '防眩网', desc: '用于高速公路中央分隔带，有效阻挡对向车灯眩光，提高夜间行车安全性，采用热镀锌钢板冲压成型。',
    img: '/images/微信图片_20260621172343_331_186.jpg',
    specs: '板厚：1.5-3mm | 高度：0.5-1m | 长度：2-4m/片',
  },
  {
    id: 19, category: 'railway', name: '铁路防护网', desc: '高强度的铁路专用防护网，采用热镀锌+涂塑双重防腐，立柱加粗加固，确保铁路运行安全。',
    img: '/images/微信图片_20260621172346_333_186.jpg',
    specs: '丝径：4-5mm | 网孔：75x150mm | 高度：2.0-3.0m',
  },
  {
    id: 20, category: 'railway', name: '铁路声屏障', desc: '用于铁路沿线降噪，采用微孔金属板+吸音材料复合结构，有效降低列车噪音对周边环境的影响。',
    img: '/images/微信图片_20260621172351_336_186.jpg',
    specs: '板材：铝合金/镀锌板 | 降噪系数：≥0.8 | 高度：2-5m',
  },
  {
    id: 21, category: 'zinc-steel', name: '锌钢围墙护栏', desc: '采用高强度锌钢型材，表面静电喷涂处理，色彩丰富，组装式结构安装便捷，适用于小区、工厂围墙。',
    img: '/images/微信图片_20260621172352_337_186.jpg',
    specs: '型材：40x40 / 60x60mm | 竖杆：19x19mm | 高度：1.2-2.5m',
  },
  {
    id: 22, category: 'zinc-steel', name: '锌钢阳台护栏', desc: '锌钢材质，静电喷涂，美观大方，防腐防锈，安装简便，符合建筑安全规范，为住宅阳台提供安全保障。',
    img: '/images/微信图片_20260621172356_340_186.jpg',
    specs: '面管：40x60mm | 竖杆：19x19mm | 高度：1.1-1.2m',
  },
  {
    id: 23, category: 'zinc-steel', name: '锌钢楼梯扶手', desc: '采用锌钢管材焊接成型，表面静电喷涂，手感舒适，安全牢固，适用于住宅、商业楼梯通道。',
    img: '/images/微信图片_20260621172359_343_186.jpg',
    specs: '主管：50mm圆管 | 立柱：40mm圆管 | 高度：0.9-1.1m',
  },
  {
    id: 24, category: 'lawn', name: '草坪护栏', desc: 'PVC材质或镀锌钢材质，造型美观，颜色多样，安装简便，用于公园、小区绿化带、庭院草坪的围护与装饰。',
    img: '/images/微信图片_20260621172403_346_186.jpg',
    specs: '材质：PVC/镀锌钢 | 高度：0.3-0.8m | 颜色：白色/绿色/黑色',
  },
  {
    id: 25, category: 'lawn', name: '绿化护栏', desc: '热镀锌钢管+PVC涂层，防腐耐用，造型多样，用于城市绿化带、公园景观的隔离与美化。',
    img: '/images/微信图片_20260621172405_348_186.jpg',
    specs: '管径：32-60mm | 高度：0.5-1.2m | 颜色可定制',
  },
  {
    id: 26, category: 'municipal', name: '市政护栏', desc: '城市道路隔离护栏，热镀锌钢板+静电喷涂，坚固耐用，反光标识清晰，提高城市道路通行安全。',
    img: '/images/微信图片_20260621172407_350_186.jpg',
    specs: '材质：镀锌钢板 | 高度：0.6-1.2m | 长度：3m/片',
  },
  {
    id: 27, category: 'municipal', name: '人行道护栏', desc: '用于城市道路人行道与车行道隔离，镀锌钢管焊接成型，顶部弯头处理，美观安全。',
    img: '/images/微信图片_20260621172412_354_186.jpg',
    specs: '管径：76-89mm | 高度：1.0-1.2m | 长度：2-3m/片',
  },
]

export default function Guardrail() {
  const [activeTab, setActiveTab] = useState('all')
  const filtered = activeTab === 'all' ? products : products.filter(p => p.category === activeTab)

  return (
    <div className="bg-td-bg min-h-screen">
      <section className="bg-gradient-to-r from-td-dark to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">护栏防护产品中心</h1>
          <p className="text-gray-300">公路、铁路、市政、厂区等全方位护栏防护解决方案</p>
        </div>
      </section>

      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-3 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key ? 'bg-td-red text-white' : 'text-td-gray hover:bg-gray-100 hover:text-td-dark'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => (
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
          {filtered.length === 0 && (
            <div className="text-center py-16 text-td-gray">暂无该分类产品</div>
          )}
        </div>
      </section>
    </div>
  )
}