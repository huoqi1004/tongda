import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'woven', label: '编织网' },
  { key: 'steel-plate', label: '钢板网' },
  { key: 'building', label: '建筑网片' },
  { key: 'gabion', label: '石笼格栅' },
]

const products = [
  {
    id: 1, category: 'woven', name: '荷兰网', desc: '以低碳钢丝焊接成方形网片，表面高温浸裹绿色PVC塑料层，网身带波浪弯折造型，柔韧性好、不易变形。防腐耐候、安装简单、性价比高，整卷出厂裁剪铺设方便。',
    img: '/images/helan-wang.jpg',
    specs: '丝径：1.2-3mm | 网孔：50x50mm | 宽度：0.9-1.8m | 表面：PVC浸塑',
  },
  {
    id: 2, category: 'woven', name: '电焊网', desc: '由细铁丝横竖点焊成型，网孔均匀、焊点牢固，整卷包装方便裁剪运输。分热镀锌、冷镀锌、不锈钢三种材质，规格齐全可定制。',
    img: '/images/dianhan-wang.jpg',
    specs: '网孔：1×1-10×10cm | 丝径：0.3-3mm | 宽度：0.5-2m | 材质：热镀锌/冷镀锌/不锈钢',
  },
  {
    id: 3, category: 'steel-plate', name: '钢板网', desc: '3×6、5×10常规钢板网现货，红漆防锈。一体冲压菱形网，无焊点不开裂，规格齐全可按需裁剪。加厚重型款承重更强，脚手架踏板、基坑防护通用。',
    img: '/images/gangban-wang.jpg',
    specs: '网孔：3×6 / 5×10等 | 板厚：2-5mm | 材质：Q235钢板 | 表面：红漆防锈',
  },
  {
    id: 4, category: 'gabion', name: '双向塑料土工格栅', desc: '双向一体拉伸成型，纵横双向拉力均衡，抗拉伸、耐腐蚀、耐老化、不易断裂。适用公路乡村道路路基加固、边坡护坡、养殖场地面、堤坝挡土墙加筋。',
    img: '/images/tugong-geshan.jpg',
    specs: '网孔：25-40mm | 幅宽：2-4m | 材质：PP/HDPE | 拉伸方式：双向拉伸',
  },
  {
    id: 5, category: 'gabion', name: '石笼卷', desc: '采用热镀锌/镀铝锌低碳钢丝机器双绞编织成六角菱形网，双绞合编织结构韧性强，镀锌防腐防锈，透水透气，整卷可自由裁剪，配套成品石笼框现货。',
    img: '/images/shilong-juan.jpg',
    specs: '网孔：60x80-100x120mm | 丝径：2.0-4.0mm | 材质：热镀锌钢丝 | 编织：双绞六角',
  },
  {
    id: 6, category: 'woven', name: '压花网', desc: '又称轧花网，先把金属丝预先轧出波浪纹路再经纬交叉编织，丝材带波浪咬合整体结实，承重抗冲击优于普通电焊网。材质常见热镀锌铁丝、不锈钢丝，防锈牢固。',
    img: '/images/yahua-wang.jpg',
    specs: '网孔：5-100mm | 丝径：1.0-12mm | 材质：热镀锌/不锈钢 | 编织：预弯双向',
  },
  {
    id: 7, category: 'woven', name: '六角网', desc: '由低碳镀锌铁丝双绞合编织成六角网孔，整体柔性好，拉扯不易开扣，防锈耐腐蚀。细丝款用于抹墙防裂、养殖围网；粗丝款用于河道护坡、边坡固土。',
    img: '/images/liujiao-wang.jpg',
    specs: '网孔：25-100mm | 丝径：0.5-4mm | 材质：镀锌钢丝 | 编织：双绞拧花',
  },
  {
    id: 8, category: 'steel-plate', name: '美格网', desc: '由镀锌/浸塑钢管冲压焊接而成，网孔为大菱形，一体折弯成型，板材厚实抗撞击。粗方管焊接强度高，防盗防破坏效果好，菱形大网孔透光通风不遮挡采光。',
    img: '/images/meige-wang.jpg',
    specs: '网孔：菱形 | 管材：方管 | 材质：镀锌/浸塑 | 用途：门窗防盗',
  },
  {
    id: 9, category: 'building', name: '外墙耐碱网格布', desc: '材质为玻璃纤维编织，经耐碱乳液涂层处理，外墙保温抹灰工程专用。耐碱抗裂，抵御水泥砂浆碱性腐蚀，防止墙面开裂空鼓掉皮；韧性强拉力高，轻薄易施工。',
    img: '/images/wangge-bu.jpg',
    specs: '克重：60-300g/㎡ | 网孔：4x4 / 5x5mm | 幅宽：1-2m | 材质：玻璃纤维+耐碱涂层',
  },
  {
    id: 10, category: 'building', name: '堵灰网', desc: '属于细丝密孔电焊网，丝细网密，和砂浆附着力强，轻薄易裁剪。主要用于烟道堵灰、建筑抹灰防裂、工程填缝等装修土建工程，是装修工地常用辅材。',
    img: '/images/duhui-wang.jpg',
    specs: '网孔：6-25mm | 丝径：0.3-0.8mm | 宽度：0.3-1m | 材质：黑丝/镀锌',
  },
  {
    id: 11, category: 'steel-plate', name: '圆孔网', desc: '以镀锌钢板、不锈钢板、铁板为原料，机器冲压出均匀圆形孔洞，板材平整，孔洞规整。通风透光过滤效果好，板材坚固耐磨，可裁剪折弯加工成各种设备护罩。',
    img: '/images/yuankong-wang.jpg',
    specs: '孔径：2-50mm | 板厚：0.5-5mm | 材质：不锈钢/镀锌板/铁板 | 排列：60°/45°/直排',
  },
  {
    id: 12, category: 'building', name: '钢筋网片', desc: '采用冷拔带肋钢筋横竖精密点焊成型，整片式钢筋网格，丝粗刚性强。焊点牢固拉力强度高，大幅提升混凝土结构整体性，代替人工绑扎钢筋省时省力。',
    img: '/images/gangjin-wangpian.jpg',
    specs: '钢筋直径：4-12mm | 网孔：100-300mm | 材质：CRB550冷轧带肋 | 焊接：自动电阻焊',
  },
  {
    id: 13, category: 'building', name: '镀锌网片', desc: '低碳钢丝焊接成型后整体热镀锌处理，整片式方形网格，焊点牢固，表面镀锌层防锈耐腐蚀。片状结构裁剪拼接安装方便，网孔规整，硬度高于卷装电焊网。',
    img: '/images/duxin-wangpian.jpg',
    specs: '丝径：0.5-6mm | 网孔：12.7-200mm | 材质：低碳钢丝 | 表面：热镀锌',
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
          <p className="text-gray-300">荷兰网、电焊网、钢板网、压花网、石笼网等全品类金属网产品</p>
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
