import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const groups = [
  {
    title: '警示隔离类',
    desc: '用于道路施工、危险区域警示隔离，维护通行安全',
    products: [
      { id: 26, name: '路锥', desc: '底座为黑色加重橡胶/塑料六边形底座不易倾倒，锥身红白相间高反光膜，可搭配橙色连接警示环串联使用。高反光膜夜间远距离警示，柔性锥身车辆碾压不易碎裂回弹恢复，加重底座防滑配重。', img: '/images/lu-zhui.jpg', specs: '高度：30/50/70/90cm | 底座：六边形加重 | 材质：PVC软质 | 反光膜：红白高强级' },
      { id: 28, name: '道路施工反光警示牌', desc: '板面多为铝板，贴高亮反光膜，夜间车灯照射反光保障夜晚可视，配套金属支架可直接落地摆放拆装方便。用于市政修路、工地封路、小区道路改造等临时交通管制场景，支持尺寸文字图案定制。', img: '/images/jingshi-pai.jpg', specs: '板材：铝板 | 反光膜：高亮反光 | 支架：金属折叠 | 尺寸：可定制' },
      { id: 30, name: '盒装伸缩警戒带', desc: '便携盒装卷盘款，黄白相间警示布带印有"安全带、警戒线"字样，收纳在塑料卷盘内可自由拉伸回收。加厚PE/涤纶材质韧性强不易扯断耐磨防水可重复使用。用于道路施工、道路抢修临时隔离。', img: '/images/jingjie-tai.jpg', specs: '带宽：5cm | 材质：PE/涤纶 | 颜色：黄白/红白/黄黑 | 收纳：卷盘盒装' },
    ],
  },
  {
    title: '防撞防护类',
    desc: '用于重点设施和区域的防撞缓冲保护',
    products: [
      { id: 25, name: '防撞桶', desc: '桶身黄色PE塑料一体成型，贴红白高反光方格膜，使用时内部灌满水或沙子增重提升缓冲效果。车辆撞上时桶体变形、内部水沙卸力，大幅降低撞击损伤；夜间红白反光膜高亮醒目，耐晒抗老化。', img: '/images/fangzhuang-tong.jpg', specs: '直径：60/90cm | 高度：80/120cm | 材质：PE塑料 | 反光膜：红白高强级' },
      { id: 27, name: '橡胶减速带', desc: '人字纹款减速带，黑黄相间配色起到警示作用，表面人字防滑纹路，自带安装孔搭配膨胀螺丝固定路面。主体为高强度橡胶，韧性好抗压耐磨减震降噪，利用路面凸起迫使车辆减速，减少交通事故。', img: '/images/jiansu-dai.jpg', specs: '长度：1m/块 | 宽度：30-35cm | 厚度：3/4/5cm | 材质：高强度橡胶' },
      { id: 29, name: '黑黄斜纹反光膜', desc: '卷材式高亮反光贴膜，经典黑黄相间斜纹配色，自带背胶撕开即贴，车灯照射下强反光。用于水泥墩、护栏、桥墩、防撞桶、路沿粘贴提醒车辆避让障碍物；防水防晒户外长期使用不易褪色起皮。', img: '/images/fanguang-mo.jpg', specs: '宽度：5-15cm | 颜色：黑黄斜纹 | 背胶：自带强力背胶 | 适用：金属/水泥/塑料' },
    ],
  },
]

export default function TrafficTools() {
  return (
    <div className="bg-td-bg min-h-screen">
      <section className="bg-gradient-to-r from-td-dark to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">交通设施产品中心</h1>
          <p className="text-gray-300">路锥、防撞桶、减速带、反光警示牌等全系列交通安全产品</p>
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
