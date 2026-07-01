import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'stainless', label: '不锈钢网' },
  { key: 'building', label: '建筑网片' },
  { key: 'steel', label: '钢丝网' },
  { key: 'iron', label: '铁丝网' },
  { key: 'plate', label: '钢板网' },
  { key: 'welded', label: '电焊网' },
  { key: 'mesh', label: '网格布' },
]

const products = [
  {
    id: 1, category: 'stainless', name: '不锈钢编织网', desc: '采用304/316L不锈钢丝编织而成，耐酸碱、耐腐蚀、耐高温，广泛应用于化工过滤、食品加工、石油开采等领域。',
    img: '/images/微信图片_20260621172337_326_186.jpg',
    specs: '目数：1-500目 | 丝径：0.02-3mm | 宽度：0.5-6m',
  },
  {
    id: 2, category: 'stainless', name: '不锈钢方孔网', desc: '不锈钢丝经轧制后编织而成，网孔方正均匀，表面平整光滑，适用于精密过滤、筛分分离等场景。',
    img: '/images/微信图片_20260621172339_328_186.jpg',
    specs: '孔径：0.5-50mm | 丝径：0.1-2mm | 宽度：1-3m',
  },
  {
    id: 3, category: 'stainless', name: '不锈钢席型网', desc: '采用不同直径经丝和纬丝编织，过滤精度高，耐磨性强，广泛用于石油、化工、医药行业的液体过滤。',
    img: '/images/微信图片_20260621172343_331_186.jpg',
    specs: '目数：20-400目 | 宽度：1-2m | 材质：304/316L',
  },
  {
    id: 4, category: 'building', name: '建筑网片', desc: '采用Q235优质低碳钢焊接而成，表面平整，网格均匀，焊接牢固，是建筑墙体防裂、保温层加固的理想材料。',
    img: '/images/微信图片_20260621172346_333_186.jpg',
    specs: '丝径：0.4-6mm | 孔径：12.7-200mm | 尺寸：1x2m / 1.2x2.4m',
  },
  {
    id: 5, category: 'building', name: '钢筋网片', desc: '采用CRB550级冷轧带肋钢筋焊接成型，强度高、刚度大，用于混凝土路面、桥梁、隧道等工程加固。',
    img: '/images/微信图片_20260621172351_336_186.jpg',
    specs: '钢筋直径：4-12mm | 网孔：100-300mm | 尺寸可定制',
  },
  {
    id: 6, category: 'building', name: '抹墙网', desc: '热镀锌钢丝焊接网，用于墙面抹灰层加固，防止墙面开裂脱落，施工方便，使用寿命长。',
    img: '/images/微信图片_20260621172352_337_186.jpg',
    specs: '丝径：0.5-1.5mm | 孔径：12.7-25.4mm | 宽度：0.6-1.2m',
  },
  {
    id: 7, category: 'steel', name: '镀锌钢丝网', desc: '优质低碳钢丝经热镀锌处理后编织而成，防腐性能优越，用于围栏、养殖、防护等户外场景。',
    img: '/images/微信图片_20260621172356_340_186.jpg',
    specs: '丝径：0.5-4mm | 孔径：6-100mm | 宽度：1-3m',
  },
  {
    id: 8, category: 'steel', name: 'PVC包塑钢丝网', desc: '在镀锌钢丝外层包覆PVC塑料，兼具防腐与美观，颜色可选绿、白、灰等，广泛用于围栏和装饰。',
    img: '/images/微信图片_20260621172359_343_186.jpg',
    specs: '丝径：1-4mm | 孔径：25-100mm | 颜色：绿/白/灰',
  },
  {
    id: 9, category: 'iron', name: '黑铁丝网', desc: '低碳钢丝编织而成，价格经济实惠，广泛用于建筑、养殖、围栏等一般用途。',
    img: '/images/微信图片_20260621172403_346_186.jpg',
    specs: '丝径：0.5-4mm | 孔径：6-100mm | 宽度：1-2m',
  },
  {
    id: 10, category: 'iron', name: '镀锌铁丝网', desc: '铁丝经电镀锌或热镀锌处理后编织，防腐性能优于黑铁丝网，适用于户外围栏和防护。',
    img: '/images/微信图片_20260621172405_348_186.jpg',
    specs: '丝径：0.5-4mm | 孔径：6-100mm | 宽度：1-3m',
  },
  {
    id: 11, category: 'plate', name: '钢板网', desc: '以优质钢板一次冲压拉伸成型，网孔均匀，坚固耐用，广泛用于建筑吊顶、平台踏板、防护罩等。',
    img: '/images/微信图片_20260621172407_350_186.jpg',
    specs: '板厚：0.5-8mm | 网孔：多种规格 | 宽度：1-2m',
  },
  {
    id: 12, category: 'plate', name: '铝板网', desc: '以铝板冲压拉伸成型，重量轻、耐腐蚀，用于装饰、过滤、通风等场合。',
    img: '/images/微信图片_20260621172412_354_186.jpg',
    specs: '板厚：0.3-3mm | 网孔：多种规格 | 宽度：1-1.5m',
  },
  {
    id: 13, category: 'welded', name: '电焊网片', desc: '优质低碳钢丝经自动焊接成型，网格均匀，焊点牢固，表面可镀锌或PVC处理，用途广泛。',
    img: '/images/微信图片_20260621172414_355_186.jpg',
    specs: '丝径：0.5-6mm | 孔径：12.7-200mm | 宽度：0.5-2m',
  },
  {
    id: 14, category: 'mesh', name: '耐碱网格布', desc: '以中碱或无碱玻璃纤维纱编织，经耐碱涂层处理，用于建筑内外墙保温、防水、防裂。',
    img: '/images/微信图片_20260621172415_356_186.jpg',
    specs: '克重：60-300g/㎡ | 网孔：4x4 / 5x5mm | 宽度：1-2m',
  },
  {
    id: 15, category: 'mesh', name: '玻璃纤维网格布', desc: '玻璃纤维编织后涂覆高分子乳液，强度高、耐碱性强，适用于GRC构件、石材背衬等。',
    img: '/images/微信图片_20260621172421_361_186.jpg',
    specs: '克重：80-200g/㎡ | 网孔：3x3 / 5x5mm | 宽度：1m',
  },
]

export default function MetalMesh() {
  const [activeTab, setActiveTab] = useState('all')

  const filtered = activeTab === 'all' ? products : products.filter(p => p.category === activeTab)

  return (
    <div className="bg-td-bg min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-td-dark to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">金属网产品中心</h1>
          <p className="text-gray-300">提供不锈钢网、建筑网片、钢丝网、钢板网等全品类金属网产品</p>
        </div>
      </section>

      {/* Tab Filter */}
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

      {/* Product Grid */}
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