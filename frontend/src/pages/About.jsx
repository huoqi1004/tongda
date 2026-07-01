import { Award, Users, Factory, Globe } from 'lucide-react'

const images = [
  '/images/微信图片_20260621172337_326_186.jpg',
  '/images/微信图片_20260621172339_328_186.jpg',
  '/images/微信图片_20260621172343_331_186.jpg',
  '/images/微信图片_20260621172346_333_186.jpg',
  '/images/微信图片_20260621172351_336_186.jpg',
  '/images/微信图片_20260621172352_337_186.jpg',
]

const advantages = [
  { icon: Award, title: '品质保障', desc: '严格遵循国标生产，通过ISO9001质量管理体系认证，每批次产品出厂前均经过严格检测，确保产品品质稳定可靠。' },
  { icon: Users, title: '专业团队', desc: '拥有20年以上行业经验的技术团队，从产品选型、方案设计到售后支持，提供全程专业服务。' },
  { icon: Factory, title: '先进设备', desc: '引进国内外先进生产设备，自动化焊接生产线、数控冲压设备、精密编织机械，确保产品精度与一致性。' },
  { icon: Globe, title: '广泛覆盖', desc: '产品远销全国各省市，服务客户涵盖建筑工程公司、市政单位、交通管理部门、养殖企业等。' },
]

const scenes = [
  { img: images[0], title: '建筑工程', desc: '建筑网片、钢筋网、抹墙网等产品广泛应用于各类建筑项目，为建筑结构提供可靠加固。' },
  { img: images[1], title: '公路交通', desc: '公路防护网、隔离栅、防眩网等产品为高速公路、国道省道提供安全防护保障。' },
  { img: images[2], title: '市政工程', desc: '市政护栏、围挡、井盖防护网等产品服务于城市基础设施建设与维护。' },
  { img: images[3], title: '养殖防护', desc: '养殖围网、鸡鸽兔笼、水产养殖网等产品满足农业养殖多样化需求。' },
]

export default function About() {
  return (
    <div className="bg-td-bg">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-td-dark to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">关于我们</h1>
          <p className="text-gray-300">专业金属丝网与工程防护解决方案提供商</p>
        </div>
      </section>

      {/* Company Intro */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-td-dark mb-6">公司简介</h2>
              <div className="space-y-4 text-td-gray leading-relaxed">
                <p>通达丝网是一家集研发、生产、销售于一体的综合性金属丝网企业。公司自成立以来，始终秉承"品质为本、客户至上"的经营理念，专注于金属丝网产品的研发制造与工程应用。</p>
                <p>公司主要产品涵盖金属网类（不锈钢网、建筑网片、钢丝网、钢板网、电焊网、网格布等）、护栏防护（公路防护网、铁路防护网、锌钢护栏、市政护栏等）、交通设施（路面警示类、隔离警示类、防撞防护类、安全标识类、交通标识类）三大系列，千余种规格。</p>
                <p>产品广泛应用于建筑工程、公路交通、市政工程、养殖防护、工业过滤、装饰装修等领域，远销全国各省市，深受客户好评。公司拥有先进的生产设备和严格的质量管理体系，可根据客户需求提供定制化产品解决方案。</p>
                <p>我们始终坚持以客户需求为导向，以产品质量为根本，以技术创新为驱动，不断提升产品品质和服务水平，致力于为客户提供最优质的金属丝网产品与工程防护解决方案。</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src={images[0]} alt="工厂车间" className="rounded-xl object-cover w-full h-40" />
              <img src={images[1]} alt="产品展示" className="rounded-xl object-cover w-full h-40" />
              <img src={images[2]} alt="生产设备" className="rounded-xl object-cover w-full h-40" />
              <img src={images[3]} alt="仓库一角" className="rounded-xl object-cover w-full h-40" />
            </div>
          </div>
        </div>
      </section>

      {/* Advantage Cards */}
      <section className="py-16 bg-td-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-td-dark">我们的优势</h2>
            <p className="text-td-gray mt-3">四大核心优势，为客户创造价值</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-center">
                <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-td-red" />
                </div>
                <h4 className="font-bold text-lg text-td-dark mb-2">{item.title}</h4>
                <p className="text-td-gray text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warehouse Photos */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-td-dark">仓库与生产</h2>
            <p className="text-td-gray mt-3">实地拍摄，真实展示</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.concat(images.slice(0, 2)).map((img, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={img} alt={`仓库图片${idx + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scene Applications */}
      <section className="py-16 bg-td-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-td-dark">产品应用场景</h2>
            <p className="text-td-gray mt-3">覆盖多行业多领域，满足不同工程需求</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {scenes.map((scene, idx) => (
              <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="aspect-video overflow-hidden bg-gray-100">
                  <img src={scene.img} alt={scene.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-td-dark mb-2">{scene.title}</h4>
                  <p className="text-td-gray text-sm leading-relaxed">{scene.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}