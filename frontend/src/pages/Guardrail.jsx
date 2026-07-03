import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'road', label: '道路护栏' },
  { key: 'site', label: '工地防护' },
  { key: 'wall', label: '围墙草坪' },
  { key: 'other', label: '其他防护' },
]

const products = [
  {
    id: 14, category: 'road', name: '双边丝护栏网', desc: '整体低碳钢丝焊接成型，表面浸塑绿色防腐层，网片两侧多出两道加粗竖丝（双边），搭配圆管立柱与卡扣组装。浸塑表层耐日晒雨淋，双边加固结构不易变形，安装简单成本低。',
    img: '/images/shuangbi-hulan.jpg',
    specs: '丝径：3-5mm | 网孔：50x50 / 75x75mm | 高度：1.2-2.5m | 表面：浸塑绿色',
  },
  {
    id: 15, category: 'site', name: '电梯井口防护门', desc: '建筑工地电梯井专用安全围挡，整体钢板网/方管焊接，橙黄醒目烤漆，自带安全警示标语。框架加厚方管，中间菱形钢板网通透轻量化，底部黑黄警示踢脚板，板面印刷警示文字。',
    img: '/images/diantijing-fanghu.jpg',
    specs: '尺寸：1.2x1.8m / 定制 | 框架：方管 | 材质：钢板网+方管 | 表面：烤漆橙黄',
  },
  {
    id: 16, category: 'site', name: '竖管基坑护栏', desc: '工地基坑、楼层临边专用安全防护围栏，采用加厚方管框架+密集竖向竖管焊接，整体喷白漆，顶部配有红白警示挡脚板，印有禁止跨越、严禁抛物安全标语。密集竖管结构缝隙窄，防止人员物料失足坠落。',
    img: '/images/jikeng-hulan.jpg',
    specs: '尺寸：2x1.2m | 框架：加厚方管 | 竖管间距：≤120mm | 表面：喷白漆+红白警示',
  },
  {
    id: 17, category: 'wall', name: 'U型锌钢草坪护栏', desc: '锌钢草坪护栏（U型绿化护栏），材质为镀锌钢管喷涂防锈漆。用于市政道路绿化带、小区花池、公园草坪、庭院花园隔离。防腐防锈、颜色美观，有40cm/60cm/80cm多种高度规格。',
    img: '/images/caoping-hulan.jpg',
    specs: '材质：镀锌钢管 | 高度：40/60/80cm | 颜色：绿白搭配 | 安装：预埋/底盘',
  },
  {
    id: 18, category: 'other', name: '钢格板', desc: '扁钢与扭绞方钢焊接而成的镂空板材，承重强、排水快、防滑防锈。用于平台踏步、排水沟盖板、车间走道、树池盖板、市政沟盖、停车场排水格栅，支持定制各种尺寸厚度规格。',
    img: '/images/gangge-ban.jpg',
    specs: '扁钢厚度：3-8mm | 网孔：30x30 / 40x100mm | 材质：Q235扁钢+扭绞方钢 | 表面：热镀锌',
  },
  {
    id: 19, category: 'road', name: '波形护栏', desc: '波形梁板为加厚镀锌钢板+喷塑绿色防腐层，带预留螺栓孔拼接固定，搭配绿色钢管立柱与方形法兰底座。车辆失控撞击时波浪钢板形变吸收冲击力，缓冲减速，阻挡车辆冲出路面，降低车祸伤亡。',
    img: '/images/boxing-hulan.jpg',
    specs: '板厚：3.0/4.0mm | 板宽：310/506mm | 立柱：Φ114/Φ140 | 表面：热镀锌+喷塑',
  },
  {
    id: 20, category: 'road', name: '市政道路护栏', desc: '锌钢市政护栏，主体为镀锌钢管静电喷塑处理，竖杆底部贴蓝色反光条，搭配重型橡胶底座直接摆放路面。带反光标识夜间可视性强，底座配重稳固拆装移动方便，防锈耐晒颜色可定制。',
    img: '/images/shizheng-hulan.jpg',
    specs: '材质：镀锌钢管 | 高度：0.6-1.2m | 颜色：白蓝/白红 | 底座：重型橡胶',
  },
  {
    id: 21, category: 'other', name: '可移动伸缩隔离护栏', desc: '玻璃钢绝缘材质，杆身红白相间警示配色，两侧黄色支架带防滑底座，交叉铰接结构可自由拉伸收拢折叠。绝缘不导电，电力场景专用安全款，轻便易搬运，无需预埋安装落地即可使用。',
    img: '/images/suoshen-hulan.jpg',
    specs: '材质：玻璃钢 | 伸展长度：2-5m | 高度：1-1.2m | 颜色：红白相间',
  },
  {
    id: 22, category: 'wall', name: '锌钢围墙护栏', desc: '组装式锌钢护栏，主材为镀锌方管、扁管，表面高温喷塑防腐。经典蓝白配色，竖杆顶端带防攀爬尖头。镀锌+喷塑双层防腐，风吹日晒不易生锈掉漆，组装式结构施工简单快捷，尖头设计防盗防翻越。',
    img: '/images/weiqiang-hulan.jpg',
    specs: '型材：40x40 / 60x60mm | 竖杆：19x19mm | 高度：1.2-2.5m | 表面：喷塑蓝白',
  },
  {
    id: 23, category: 'site', name: '小草彩钢施工围挡', desc: '主体是彩钢波纹板，搭配镀锌方管边框与立柱，底部贴黄黑警示反光条。小草围挡板面覆仿真绿色草皮美观遮丑，纯色蓝色彩钢围挡成本更低。轻便模块化拼接安装速度快，可重复拆装周转使用。',
    img: '/images/shigong-weizhe.jpg',
    specs: '高度：2-2.5m | 宽度：2-3m/块 | 板材：彩钢波纹板 | 框架：镀锌方管',
  },
  {
    id: 24, category: 'other', name: '球场框网', desc: '框架式球场围网，整体为镀锌钢丝焊接网片+方管边框，表面浸塑处理呈绿色，搭配专用圆管立柱。网孔细密结构牢固，阻挡球类飞出场地，高度可定制满足不同球类防护需求。浸塑防晒防锈，带方管框架抗篮球足球大力撞击不变形。',
    img: '/images/qiuchang-wang.jpg',
    specs: '网孔：50x50mm | 丝径：2.5-4mm | 高度：3/4/6m | 立柱：Φ60/Φ75 | 表面：浸塑绿色',
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
          <p className="text-gray-300">道路护栏、工地防护、围墙草坪、球场围网等全方位护栏防护解决方案</p>
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
