import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Phone, MessageCircle, Bot, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const allProducts = [
  { id: 1, name: '不锈钢编织网', category: '金属网类', desc: '采用304/316L不锈钢丝编织而成，耐酸碱、耐腐蚀、耐高温，广泛应用于化工过滤、食品加工、石油开采等领域。', images: ['/images/微信图片_20260621172337_326_186.jpg', '/images/微信图片_20260621172339_328_186.jpg', '/images/微信图片_20260621172343_331_186.jpg'], features: ['304/316L优质不锈钢材质', '耐高温800℃以上', '耐酸碱腐蚀', '编织密度均匀', '可根据要求定制目数和丝径'], scenes: ['化工过滤', '食品加工', '石油开采', '医药制造', '水处理'], specs: [{ label: '目数', value: '1-500目' }, { label: '丝径', value: '0.02-3mm' }, { label: '宽度', value: '0.5-6m' }, { label: '材质', value: '304/316L不锈钢' }, { label: '编织方式', value: '平纹/斜纹/席型' }] },
  { id: 2, name: '不锈钢方孔网', category: '金属网类', desc: '不锈钢丝经轧制后编织而成，网孔方正均匀，表面平整光滑，适用于精密过滤、筛分分离等场景。', images: ['/images/微信图片_20260621172339_328_186.jpg', '/images/微信图片_20260621172346_333_186.jpg', '/images/微信图片_20260621172337_326_186.jpg'], features: ['网孔方正均匀', '表面平整光滑', '精密过滤效果好', '抗拉强度高', '多种规格可选'], scenes: ['精密过滤', '筛分分离', '颗粒筛选', '实验室器材', '工业过滤'], specs: [{ label: '孔径', value: '0.5-50mm' }, { label: '丝径', value: '0.1-2mm' }, { label: '宽度', value: '1-3m' }, { label: '材质', value: '304不锈钢' }, { label: '网孔形状', value: '方形' }] },
  { id: 3, name: '不锈钢席型网', category: '金属网类', desc: '采用不同直径经丝和纬丝编织，过滤精度高，耐磨性强，广泛用于石油、化工、医药行业的液体过滤。', images: ['/images/微信图片_20260621172343_331_186.jpg', '/images/微信图片_20260621172351_336_186.jpg'], features: ['过滤精度高', '经丝纬丝不同直径', '耐磨性强', '液体过滤专用', '可定制特殊规格'], scenes: ['石油过滤', '化工过滤', '医药过滤', '水处理', '食品饮料'], specs: [{ label: '目数', value: '20-400目' }, { label: '宽度', value: '1-2m' }, { label: '材质', value: '304/316L' }, { label: '编织方式', value: '席型密纹' }, { label: '过滤精度', value: '10-500μm' }] },
  { id: 4, name: '建筑网片', category: '金属网类', desc: '采用Q235优质低碳钢焊接而成，表面平整，网格均匀，焊接牢固，是建筑墙体防裂、保温层加固的理想材料。', images: ['/images/微信图片_20260621172346_333_186.jpg', '/images/微信图片_20260621172352_337_186.jpg'], features: ['Q235优质低碳钢', '焊接牢固不脱落', '网格均匀美观', '表面平整无毛刺', '可镀锌防腐处理'], scenes: ['建筑墙体防裂', '保温层加固', '地面硬化', '隧道衬砌', '桥梁加固'], specs: [{ label: '丝径', value: '0.4-6mm' }, { label: '孔径', value: '12.7-200mm' }, { label: '尺寸', value: '1x2m / 1.2x2.4m' }, { label: '材质', value: 'Q235低碳钢' }, { label: '表面处理', value: '电镀锌/热镀锌/PVC' }] },
  { id: 5, name: '钢筋网片', category: '金属网类', desc: '采用CRB550级冷轧带肋钢筋焊接成型，强度高、刚度大，用于混凝土路面、桥梁、隧道等工程加固。', images: ['/images/微信图片_20260621172351_336_186.jpg', '/images/微信图片_20260621172356_340_186.jpg'], features: ['CRB550级冷轧带肋钢筋', '强度高、刚度大', '混凝土加固效果好', '可定制尺寸', '符合建筑标准'], scenes: ['混凝土路面', '桥梁工程', '隧道工程', '机场跑道', '大型厂房地面'], specs: [{ label: '钢筋直径', value: '4-12mm' }, { label: '网孔', value: '100-300mm' }, { label: '材质', value: 'CRB550' }, { label: '尺寸', value: '可定制' }, { label: '焊接方式', value: '自动电阻焊' }] },
  { id: 6, name: '抹墙网', category: '金属网类', desc: '热镀锌钢丝焊接网，用于墙面抹灰层加固，防止墙面开裂脱落，施工方便，使用寿命长。', images: ['/images/微信图片_20260621172352_337_186.jpg', '/images/微信图片_20260621172359_343_186.jpg'], features: ['热镀锌防腐', '网格均匀', '施工便捷', '防止墙面开裂', '使用寿命长'], scenes: ['内外墙抹灰', '保温层加固', '旧墙翻新', '石膏板接缝', '烟道加固'], specs: [{ label: '丝径', value: '0.5-1.5mm' }, { label: '孔径', value: '12.7-25.4mm' }, { label: '宽度', value: '0.6-1.2m' }, { label: '材质', value: '热镀锌钢丝' }, { label: '包装', value: '卷装/片装' }] },
  { id: 7, name: '镀锌钢丝网', category: '金属网类', desc: '优质低碳钢丝经热镀锌处理后编织而成，防腐性能优越，用于围栏、养殖、防护等户外场景。', images: ['/images/微信图片_20260621172356_340_186.jpg', '/images/微信图片_20260621172403_346_186.jpg'], features: ['热镀锌防腐', '抗拉强度高', '编织紧密', '户外耐用', '经济实惠'], scenes: ['围栏防护', '养殖围网', '边坡防护', '建筑防护', '临时围挡'], specs: [{ label: '丝径', value: '0.5-4mm' }, { label: '孔径', value: '6-100mm' }, { label: '宽度', value: '1-3m' }, { label: '材质', value: '热镀锌钢丝' }, { label: '编织方式', value: '正捻/反捻' }] },
  { id: 8, name: 'PVC包塑钢丝网', category: '金属网类', desc: '在镀锌钢丝外层包覆PVC塑料，兼具防腐与美观，颜色可选绿、白、灰等，广泛用于围栏和装饰。', images: ['/images/微信图片_20260621172359_343_186.jpg', '/images/微信图片_20260621172405_348_186.jpg'], features: ['PVC包塑防腐', '颜色可选', '美观大方', '触感柔软', '耐候性强'], scenes: ['庭院围栏', '公园围栏', '运动场围网', '装饰网', '养殖围网'], specs: [{ label: '丝径', value: '1-4mm' }, { label: '孔径', value: '25-100mm' }, { label: '颜色', value: '绿/白/灰' }, { label: '包塑厚度', value: '0.4-0.6mm' }, { label: '内芯', value: '镀锌钢丝' }] },
  { id: 9, name: '黑铁丝网', category: '金属网类', desc: '低碳钢丝编织而成，价格经济实惠，广泛用于建筑、养殖、围栏等一般用途。', images: ['/images/微信图片_20260621172403_346_186.jpg', '/images/微信图片_20260621172407_350_186.jpg'], features: ['价格经济实惠', '编织紧密', '柔韧性好', '易于加工', '适用范围广'], scenes: ['建筑绑扎', '养殖围网', '临时围栏', '工艺品制作', '捆扎固定'], specs: [{ label: '丝径', value: '0.5-4mm' }, { label: '孔径', value: '6-100mm' }, { label: '宽度', value: '1-2m' }, { label: '材质', value: '低碳钢丝' }, { label: '表面', value: '黑铁丝（无镀层）' }] },
  { id: 10, name: '镀锌铁丝网', category: '金属网类', desc: '铁丝经电镀锌或热镀锌处理后编织，防腐性能优于黑铁丝网，适用于户外围栏和防护。', images: ['/images/微信图片_20260621172405_348_186.jpg', '/images/微信图片_20260621172412_354_186.jpg'], features: ['电镀/热镀锌防腐', '经济实惠', '编织均匀', '户外适用', '多种规格可选'], scenes: ['户外围栏', '防护隔离', '养殖围网', '边坡防护', '建筑防护'], specs: [{ label: '丝径', value: '0.5-4mm' }, { label: '孔径', value: '6-100mm' }, { label: '宽度', value: '1-3m' }, { label: '材质', value: '镀锌铁丝' }, { label: '镀锌方式', value: '电镀锌/热镀锌' }] },
  { id: 11, name: '钢板网', category: '金属网类', desc: '以优质钢板一次冲压拉伸成型，网孔均匀，坚固耐用，广泛用于建筑吊顶、平台踏板、防护罩等。', images: ['/images/微信图片_20260621172407_350_186.jpg', '/images/微信图片_20260621172414_355_186.jpg'], features: ['一次冲压成型', '坚固耐用', '网孔均匀', '承载力强', '可定制规格'], scenes: ['建筑吊顶', '平台踏板', '设备防护罩', '通风口', '围墙隔断'], specs: [{ label: '板厚', value: '0.5-8mm' }, { label: '网孔', value: '多种规格' }, { label: '宽度', value: '1-2m' }, { label: '材质', value: 'Q235钢板' }, { label: '表面', value: '镀锌/喷漆' }] },
  { id: 12, name: '铝板网', category: '金属网类', desc: '以铝板冲压拉伸成型，重量轻、耐腐蚀，用于装饰、过滤、通风等场合。', images: ['/images/微信图片_20260621172412_354_186.jpg', '/images/微信图片_20260621172415_356_186.jpg'], features: ['重量轻便', '耐腐蚀不生锈', '美观大方', '通风性好', '可冲压各种图案'], scenes: ['室内装饰', '通风过滤', '音响网罩', '灯具防护', '设备散热'], specs: [{ label: '板厚', value: '0.3-3mm' }, { label: '网孔', value: '多种规格' }, { label: '宽度', value: '1-1.5m' }, { label: '材质', value: '铝合金' }, { label: '表面', value: '喷塑/氧化' }] },
  { id: 13, name: '电焊网片', category: '金属网类', desc: '优质低碳钢丝经自动焊接成型，网格均匀，焊点牢固，表面可镀锌或PVC处理，用途广泛。', images: ['/images/微信图片_20260621172414_355_186.jpg', '/images/微信图片_20260621172421_361_186.jpg'], features: ['自动焊接成型', '焊点牢固', '网格均匀', '表面处理多样', '尺寸可定制'], scenes: ['围栏防护', '养殖笼具', '仓储货架', '建筑加固', '工业过滤'], specs: [{ label: '丝径', value: '0.5-6mm' }, { label: '孔径', value: '12.7-200mm' }, { label: '宽度', value: '0.5-2m' }, { label: '材质', value: '低碳钢丝' }, { label: '表面', value: '电镀锌/热镀锌/PVC' }] },
  { id: 14, name: '耐碱网格布', category: '金属网类', desc: '以中碱或无碱玻璃纤维纱编织，经耐碱涂层处理，用于建筑内外墙保温、防水、防裂。', images: ['/images/微信图片_20260621172415_356_186.jpg', '/images/微信图片_20260621172423_363_186.jpg'], features: ['耐碱涂层处理', '抗拉强度高', '与水泥相容性好', '施工便捷', '防水防裂'], scenes: ['外墙保温', '内墙防裂', '防水工程', 'GRC构件', '石材背衬'], specs: [{ label: '克重', value: '60-300g/㎡' }, { label: '网孔', value: '4x4 / 5x5mm' }, { label: '宽度', value: '1-2m' }, { label: '材质', value: '玻璃纤维' }, { label: '涂层', value: '耐碱乳液' }] },
  { id: 15, name: '玻璃纤维网格布', category: '金属网类', desc: '玻璃纤维编织后涂覆高分子乳液，强度高、耐碱性强，适用于GRC构件、石材背衬等。', images: ['/images/微信图片_20260621172421_361_186.jpg', '/images/微信图片_20260621172425_365_186.jpg'], features: ['高分子乳液涂层', '耐碱性好', '强度高', '柔韧性好', '与树脂相容性好'], scenes: ['GRC构件', '石材背衬', '防水卷材增强', '石膏制品', '复合材料增强'], specs: [{ label: '克重', value: '80-200g/㎡' }, { label: '网孔', value: '3x3 / 5x5mm' }, { label: '宽度', value: '1m' }, { label: '材质', value: '玻璃纤维' }, { label: '卷长', value: '50-100m' }] },
  { id: 16, name: '公路防护网', category: '护栏防护', desc: '采用低碳钢丝焊接后热镀锌处理，防腐性能优异，使用寿命长达15年以上。', images: ['/images/微信图片_20260621172337_326_186.jpg', '/images/微信图片_20260621172352_337_186.jpg'], features: ['热镀锌防腐', '使用寿命15年以上', '焊接牢固', '抗冲击力强', '安装便捷'], scenes: ['高速公路', '国道省道', '工业园区', '边界防护', '机场围界'], specs: [{ label: '丝径', value: '3-5mm' }, { label: '孔径', value: '50x50 / 75x75mm' }, { label: '高度', value: '1.2-2.5m' }, { label: '立柱', value: '48x2mm钢管' }, { label: '表面', value: '热镀锌+浸塑' }] },
  { id: 17, name: '高速公路隔离栅', category: '护栏防护', desc: '优质Q235低碳钢丝焊接成型，表面热镀锌+浸塑双重防腐处理，坚固耐用。', images: ['/images/微信图片_20260621172339_328_186.jpg', '/images/微信图片_20260621172356_340_186.jpg'], features: ['双重防腐处理', '坚固耐用', '网格均匀', '抗老化', '符合交通部标准'], scenes: ['高速公路', '铁路沿线', '机场', '港口', '重要设施防护'], specs: [{ label: '丝径', value: '3.5-5mm' }, { label: '网孔', value: '50x100mm' }, { label: '立柱', value: '48x2mm钢管' }, { label: '表面', value: '热镀锌+浸塑' }, { label: '颜色', value: '绿色/灰色' }] },
  { id: 18, name: '防眩网', category: '护栏防护', desc: '用于高速公路中央分隔带，有效阻挡对向车灯眩光，提高夜间行车安全性。', images: ['/images/微信图片_20260621172343_331_186.jpg', '/images/微信图片_20260621172359_343_186.jpg'], features: ['有效阻挡眩光', '热镀锌钢板', '通风不积雪', '美观大方', '符合交通部标准'], scenes: ['高速公路中央分隔带', '桥梁路段', '隧道出入口', '弯道区域', '机场跑道'], specs: [{ label: '板厚', value: '1.5-3mm' }, { label: '高度', value: '0.5-1m' }, { label: '长度', value: '2-4m/片' }, { label: '材质', value: '热镀锌钢板' }, { label: '防眩角度', value: '≥15°' }] },
  { id: 19, name: '铁路防护网', category: '护栏防护', desc: '高强度的铁路专用防护网，采用热镀锌+涂塑双重防腐，立柱加粗加固。', images: ['/images/微信图片_20260621172346_333_186.jpg', '/images/微信图片_20260621172403_346_186.jpg'], features: ['铁路专用标准', '双重防腐处理', '立柱加粗加固', '高强度设计', '防盗防破坏'], scenes: ['铁路沿线', '高铁线路', '车站周边', '铁路桥', '隧道口'], specs: [{ label: '丝径', value: '4-5mm' }, { label: '网孔', value: '75x150mm' }, { label: '高度', value: '2.0-3.0m' }, { label: '立柱', value: '60x2.5mm钢管' }, { label: '表面', value: '热镀锌+涂塑' }] },
  { id: 20, name: '铁路声屏障', category: '护栏防护', desc: '用于铁路沿线降噪，采用微孔金属板+吸音材料复合结构。', images: ['/images/微信图片_20260621172351_336_186.jpg', '/images/微信图片_20260621172405_348_186.jpg'], features: ['降噪系数≥0.8', '微孔吸音结构', '铝合金/镀锌板', '模块化安装', '耐候性强'], scenes: ['铁路沿线', '高铁线路', '地铁沿线', '高速公路', '工厂降噪'], specs: [{ label: '板材', value: '铝合金/镀锌板' }, { label: '降噪系数', value: '≥0.8' }, { label: '高度', value: '2-5m' }, { label: '模块宽度', value: '2m' }, { label: '吸音材料', value: '岩棉/玻璃棉' }] },
  { id: 21, name: '锌钢围墙护栏', category: '护栏防护', desc: '采用高强度锌钢型材，表面静电喷涂处理，色彩丰富，组装式结构安装便捷。', images: ['/images/微信图片_20260621172352_337_186.jpg', '/images/微信图片_20260621172407_350_186.jpg'], features: ['锌钢型材高强度', '静电喷涂美观', '组装式安装', '色彩丰富', '防腐防锈'], scenes: ['小区围墙', '工厂围墙', '学校围墙', '别墅庭院', '公园围栏'], specs: [{ label: '型材', value: '40x40 / 60x60mm' }, { label: '竖杆', value: '19x19mm' }, { label: '高度', value: '1.2-2.5m' }, { label: '喷涂', value: '静电粉末喷涂' }, { label: '颜色', value: '黑/白/灰/古铜' }] },
  { id: 22, name: '锌钢阳台护栏', category: '护栏防护', desc: '锌钢材质，静电喷涂，美观大方，防腐防锈，安装简便。', images: ['/images/微信图片_20260621172356_340_186.jpg', '/images/微信图片_20260621172412_354_186.jpg'], features: ['锌钢材质', '静电喷涂', '防腐防锈', '安装简便', '符合建筑规范'], scenes: ['住宅阳台', '公寓阳台', '办公楼栏杆', '连廊防护', '露台围栏'], specs: [{ label: '面管', value: '40x60mm' }, { label: '竖杆', value: '19x19mm' }, { label: '高度', value: '1.1-1.2m' }, { label: '间距', value: '≤110mm' }, { label: '颜色', value: '可定制' }] },
  { id: 23, name: '锌钢楼梯扶手', category: '护栏防护', desc: '采用锌钢管材焊接成型，表面静电喷涂，手感舒适，安全牢固。', images: ['/images/微信图片_20260621172359_343_186.jpg', '/images/微信图片_20260621172414_355_186.jpg'], features: ['锌钢管材', '焊接牢固', '手感舒适', '静电喷涂', '安全可靠'], scenes: ['住宅楼梯', '商业楼梯', '学校走廊', '医院通道', '场馆扶手'], specs: [{ label: '主管', value: '50mm圆管' }, { label: '立柱', value: '40mm圆管' }, { label: '高度', value: '0.9-1.1m' }, { label: '壁厚', value: '1.0-1.5mm' }, { label: '颜色', value: '可定制' }] },
  { id: 24, name: '草坪护栏', category: '护栏防护', desc: 'PVC材质或镀锌钢材质，造型美观，颜色多样，安装简便。', images: ['/images/微信图片_20260621172403_346_186.jpg', '/images/微信图片_20260621172415_356_186.jpg'], features: ['PVC/镀锌钢材质', '造型美观', '颜色多样', '安装简便', '价格实惠'], scenes: ['公园绿化', '小区绿化带', '庭院草坪', '道路绿化', '景区围护'], specs: [{ label: '材质', value: 'PVC/镀锌钢' }, { label: '高度', value: '0.3-0.8m' }, { label: '颜色', value: '白色/绿色/黑色' }, { label: '安装方式', value: '插地式/膨胀螺栓' }, { label: '长度', value: '3m/片' }] },
  { id: 25, name: '绿化护栏', category: '护栏防护', desc: '热镀锌钢管+PVC涂层，防腐耐用，造型多样，用于城市绿化带、公园景观的隔离与美化。', images: ['/images/微信图片_20260621172405_348_186.jpg', '/images/微信图片_20260621172421_361_186.jpg'], features: ['热镀锌+PVC涂层', '防腐耐用', '造型多样', '美观大方', '城市绿化专用'], scenes: ['城市绿化带', '公园景观', '道路隔离', '广场围护', '景区美化'], specs: [{ label: '管径', value: '32-60mm' }, { label: '高度', value: '0.5-1.2m' }, { label: '表面', value: '热镀锌+PVC' }, { label: '颜色', value: '可定制' }, { label: '样式', value: '多种可选' }] },
  { id: 26, name: '市政护栏', category: '护栏防护', desc: '城市道路隔离护栏，热镀锌钢板+静电喷涂，坚固耐用。', images: ['/images/微信图片_20260621172407_350_186.jpg', '/images/微信图片_20260621172423_363_186.jpg'], features: ['热镀锌钢板', '静电喷涂', '反光标识清晰', '坚固耐用', '符合市政标准'], scenes: ['城市道路', '十字路口', '公交站台', '学校周边', '商业街区'], specs: [{ label: '材质', value: '镀锌钢板' }, { label: '高度', value: '0.6-1.2m' }, { label: '长度', value: '3m/片' }, { label: '表面', value: '静电喷涂' }, { label: '反光标识', value: '高强级反光膜' }] },
  { id: 27, name: '人行道护栏', category: '护栏防护', desc: '用于城市道路人行道与车行道隔离，镀锌钢管焊接成型，顶部弯头处理，美观安全。', images: ['/images/微信图片_20260621172412_354_186.jpg', '/images/微信图片_20260621172425_365_186.jpg'], features: ['镀锌钢管', '顶部弯头处理', '焊接牢固', '美观安全', '符合城市道路规范'], scenes: ['人行道隔离', '车行道隔离', '公交站台', '学校门口', '商业街区'], specs: [{ label: '管径', value: '76-89mm' }, { label: '高度', value: '1.0-1.2m' }, { label: '长度', value: '2-3m/片' }, { label: '壁厚', value: '2-3mm' }, { label: '表面', value: '热镀锌+喷塑' }] },
  { id: 28, name: '反光锥桶', category: '交通设施', desc: 'PVC材质，高反光膜覆面，夜间警示效果优异，耐压抗冲击。', images: ['/images/微信图片_20260621172414_355_186.jpg', '/images/微信图片_20260621172428_368_186.jpg'], features: ['PVC材质', '高反光膜覆面', '夜间警示效果优异', '耐压抗冲击', '可叠放收纳'], scenes: ['道路施工', '停车场', '活动现场', '临时管制', '车辆警示'], specs: [{ label: '高度', value: '45/70/90cm' }, { label: '重量', value: '1.5-4.5kg' }, { label: '反光等级', value: '高强级' }, { label: '材质', value: 'PVC' }, { label: '颜色', value: '红白/黄黑' }] },
  { id: 29, name: '警示柱', category: '交通设施', desc: 'PU材质，弹性好，抗撞击，红白相间高反光，用于路口、出入口、弯道等警示。', images: ['/images/微信图片_20260621172415_356_186.jpg', '/images/微信图片_20260621172431_370_186.jpg'], features: ['PU弹性材质', '抗撞击恢复好', '高反光警示', '红白相间醒目', '安装简便'], scenes: ['路口警示', '出入口警示', '弯道警示', '停车场引导', '加油站引导'], specs: [{ label: '高度', value: '45/75cm' }, { label: '直径', value: '8cm' }, { label: '材质', value: 'PU/PE' }, { label: '反光', value: '高强级反光膜' }, { label: '安装', value: '膨胀螺栓固定' }] },
  { id: 30, name: '减速带', category: '交通设施', desc: '优质橡胶/铸钢材质，黄黑相间醒目警示，有效降低车速。', images: ['/images/微信图片_20260621172421_361_186.jpg', '/images/微信图片_20260621172433_372_186.jpg'], features: ['优质橡胶/铸钢', '黄黑相间醒目', '有效降低车速', '耐压耐候', '安装简便'], scenes: ['小区出入口', '学校门口', '停车场', '收费站', '工厂道路'], specs: [{ label: '长度', value: '25-100cm' }, { label: '宽度', value: '30-35cm' }, { label: '高度', value: '5cm' }, { label: '材质', value: '橡胶/铸钢' }, { label: '颜色', value: '黄黑相间' }] },
  { id: 31, name: '隔离墩', category: '交通设施', desc: 'PE滚塑一体成型，可注水增重，红白警示色，用于道路施工、停车场等临时隔离。', images: ['/images/微信图片_20260621172337_326_186.jpg', '/images/微信图片_20260621172435_374_186.jpg'], features: ['PE滚塑一体成型', '可注水增重', '红白警示色', '耐冲击', '可连接使用'], scenes: ['道路施工', '停车场隔离', '临时交通管制', '活动现场', '车道分流'], specs: [{ label: '尺寸', value: '900x500mm' }, { label: '注水重量', value: '60kg' }, { label: '材质', value: 'PE' }, { label: '颜色', value: '红白警示色' }, { label: '连接方式', value: '插销连接' }] },
  { id: 32, name: '施工围挡', category: '交通设施', desc: '镀锌钢管框架+彩钢板面板，坚固耐用，可重复使用。', images: ['/images/微信图片_20260621172339_328_186.jpg', '/images/微信图片_20260621172437_375_186.jpg'], features: ['镀锌钢管框架', '彩钢板面板', '坚固耐用', '可重复使用', '安装快捷'], scenes: ['建筑工地', '市政工程', '道路施工', '临时围挡', '拆迁现场'], specs: [{ label: '高度', value: '2-2.5m' }, { label: '宽度', value: '2-3m/块' }, { label: '板材', value: '彩钢板' }, { label: '框架', value: '镀锌钢管' }, { label: '颜色', value: '蓝色/灰色' }] },
  { id: 33, name: '伸缩护栏', category: '交通设施', desc: '铝合金框架+尼龙网带，可伸缩折叠，携带方便，用于临时隔离、排队引导等场景。', images: ['/images/微信图片_20260621172343_331_186.jpg', '/images/微信图片_20260621172403_346_186.jpg'], features: ['铝合金框架', '可伸缩折叠', '携带方便', '尼龙网带', '多种颜色可选'], scenes: ['排队引导', '临时隔离', '展会现场', '商场活动', '机场通道'], specs: [{ label: '伸展长度', value: '3-5m' }, { label: '高度', value: '1m' }, { label: '材质', value: '铝合金' }, { label: '网带', value: '尼龙' }, { label: '颜色', value: '红/黑/蓝' }] },
  { id: 34, name: '防撞桶', category: '交通设施', desc: 'PE滚塑成型，可注水/沙，黄黑警示色，用于匝道口、收费站前等防撞缓冲。', images: ['/images/微信图片_20260621172346_333_186.jpg', '/images/微信图片_20260621172405_348_186.jpg'], features: ['PE滚塑成型', '可注水/沙增重', '黄黑警示色', '缓冲吸能', '耐候性强'], scenes: ['匝道口', '收费站前', '隧道口', '桥梁端头', '停车场出入口'], specs: [{ label: '直径', value: '60/90cm' }, { label: '高度', value: '80/120cm' }, { label: '材质', value: 'PE' }, { label: '注水重量', value: '200-400kg' }, { label: '反光', value: '高强级反光膜' }] },
  { id: 35, name: '防撞柱', category: '交通设施', desc: '镀锌钢管+反光膜，地基预埋式安装，抗冲击力强。', images: ['/images/微信图片_20260621172351_336_186.jpg', '/images/微信图片_20260621172407_350_186.jpg'], features: ['镀锌钢管', '反光膜警示', '地基预埋式安装', '抗冲击力强', '防腐耐用'], scenes: ['建筑出入口', '设备防护', '加油站防护', '停车场防护', '仓库防护'], specs: [{ label: '管径', value: '76-114mm' }, { label: '高度', value: '0.6-1m' }, { label: '壁厚', value: '3-4mm' }, { label: '材质', value: '镀锌钢管' }, { label: '反光', value: '高强级反光膜' }] },
  { id: 36, name: '水马围栏', category: '交通设施', desc: 'PE吹塑一次成型，可注水连接，红黄警示色，用于道路分流、施工区隔离。', images: ['/images/微信图片_20260621172352_337_186.jpg', '/images/微信图片_20260621172412_354_186.jpg'], features: ['PE吹塑一次成型', '可注水连接', '红黄警示色', '可拼接延长', '耐候耐压'], scenes: ['道路分流', '施工区隔离', '临时交通管制', '停车场分区', '活动围挡'], specs: [{ label: '长度', value: '1.5m' }, { label: '高度', value: '0.8m' }, { label: '注水重量', value: '120kg' }, { label: '材质', value: 'PE' }, { label: '颜色', value: '红黄警示色' }] },
  { id: 37, name: '安全警示牌', category: '交通设施', desc: '铝板/塑料板+反光膜，图文清晰，耐候性好，用于工地、厂区安全警示。', images: ['/images/微信图片_20260621172356_340_186.jpg', '/images/微信图片_20260621172414_355_186.jpg'], features: ['铝板/塑料基材', '反光膜覆面', '图文清晰', '耐候性好', '可定制内容'], scenes: ['建筑工地', '工厂车间', '危险区域', '配电室', '施工现场'], specs: [{ label: '尺寸', value: '40x60cm' }, { label: '材质', value: '铝板/塑料' }, { label: '反光等级', value: '工程级/高强级' }, { label: '厚度', value: '0.8-2mm' }, { label: '内容', value: '可定制' }] },
  { id: 38, name: '施工标志牌', category: '交通设施', desc: '铝合金框架+反光膜面板，内容可定制，折叠式支架，便于携带和摆放。', images: ['/images/微信图片_20260621172359_343_186.jpg', '/images/微信图片_20260621172415_356_186.jpg'], features: ['铝合金框架', '反光膜面板', '折叠式支架', '便于携带', '内容可定制'], scenes: ['道路施工', '市政工程', '临时交通管制', '施工现场', '紧急抢修'], specs: [{ label: '尺寸', value: '可定制' }, { label: '支架', value: '折叠式' }, { label: '框架', value: '铝合金' }, { label: '反光', value: '高强级反光膜' }, { label: '重量', value: '约3-5kg' }] },
  { id: 39, name: '交通标志牌', category: '交通设施', desc: '铝板+高强级反光膜，符合国标GB5768。', images: ['/images/微信图片_20260621172403_346_186.jpg', '/images/微信图片_20260621172421_361_186.jpg'], features: ['铝板基材', '高强级反光膜', '符合国标GB5768', '耐候性强', '规格可定制'], scenes: ['道路指示', '禁令标志', '警告标志', '指路标志', '旅游标志'], specs: [{ label: '板厚', value: '1.5-3mm' }, { label: '反光等级', value: '高强级/超强级' }, { label: '规格', value: '可定制' }, { label: '材质', value: '铝合金板' }, { label: '标准', value: 'GB5768' }] },
  { id: 40, name: '道路指示牌', category: '交通设施', desc: '大型铝板拼接+反光膜，用于高速公路、国道省道等道路导向指示。', images: ['/images/微信图片_20260621172405_348_186.jpg', '/images/微信图片_20260621172423_363_186.jpg'], features: ['大型铝板拼接', '3M工程级反光膜', '结构稳固', '抗风能力强', '符合交通部标准'], scenes: ['高速公路', '国道省道', '城市主干道', '景区道路', '园区道路'], specs: [{ label: '板厚', value: '2-3mm' }, { label: '反光膜', value: '3M工程级' }, { label: '尺寸', value: '可定制' }, { label: '立柱', value: '镀锌钢管' }, { label: '抗风等级', value: '≥12级' }] },
  { id: 41, name: '太阳能爆闪灯', category: '交通设施', desc: '太阳能供电，LED高亮闪烁，用于路口、弯道、施工区域等危险路段警示。', images: ['/images/微信图片_20260621172407_350_186.jpg', '/images/微信图片_20260621172425_365_186.jpg'], features: ['太阳能供电', 'LED高亮闪烁', '免布线安装', '光控自动开关', '防水防尘IP65'], scenes: ['路口警示', '弯道警示', '施工区域', '学校门口', '事故多发路段'], specs: [{ label: 'LED数量', value: '8-16个' }, { label: '太阳能板', value: '5-10W' }, { label: '蓄电池', value: '12V/7AH' }, { label: '闪烁频率', value: '40-60次/分钟' }, { label: '防水等级', value: 'IP65' }] },
]

export default function ProductDetail() {
  const { id } = useParams()
  const product = allProducts.find(p => p.id === parseInt(id))
  const [currentImg, setCurrentImg] = useState(0)

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-td-bg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-td-dark mb-2">产品未找到</h2>
          <p className="text-td-gray">该产品不存在或已被移除</p>
        </div>
      </div>
    )
  }

  const imgs = product.images || []

  return (
    <div className="bg-td-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-td-gray mb-6">
          <a href="/" className="hover:text-td-red">首页</a>
          <span className="mx-2">/</span>
          <span>{product.category}</span>
          <span className="mx-2">/</span>
          <span className="text-td-dark">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left: Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
              <img src={imgs[currentImg] || imgs[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-3 items-center">
                <button onClick={() => setCurrentImg(Math.max(0, currentImg - 1))} className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <div className="flex gap-2 flex-1">
                  {imgs.map((img, idx) => (
                    <button key={idx} onClick={() => setCurrentImg(idx)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${idx === currentImg ? 'border-td-red' : 'border-gray-200 hover:border-gray-400'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setCurrentImg(Math.min(imgs.length - 1, currentImg + 1))} className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div>
            <span className="inline-block px-3 py-1 bg-td-red/10 text-td-red text-xs font-medium rounded-full mb-3">{product.category}</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-td-dark mb-4">{product.name}</h1>
            <p className="text-td-gray leading-relaxed mb-6">{product.desc}</p>

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-semibold text-td-dark mb-3">产品特点</h3>
              <ul className="space-y-2">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-td-gray">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Application Scenes */}
            <div className="mb-6">
              <h3 className="font-semibold text-td-dark mb-3">应用场景</h3>
              <div className="flex flex-wrap gap-2">
                {product.scenes.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-td-bg text-td-gray text-xs rounded-full">{s}</span>
                ))}
              </div>
            </div>

            {/* Specs Table */}
            <div className="mb-8">
              <h3 className="font-semibold text-td-dark mb-3">技术规格</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {product.specs.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2.5 text-td-gray font-medium w-1/3">{spec.label}</td>
                        <td className="px-4 py-2.5 text-td-dark">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="flex flex-wrap gap-3">
              <a href="tel:17352186111" className="inline-flex items-center gap-2 px-5 py-3 bg-td-red text-white rounded-lg font-medium hover:bg-td-red-dark transition-colors">
                <Phone className="w-4 h-4" /> 电话咨询
              </a>
              <a href="tel:13519672788" className="inline-flex items-center gap-2 px-5 py-3 border-2 border-td-red text-td-red rounded-lg font-medium hover:bg-td-red hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> 备用电话
              </a>
              <button className="inline-flex items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                <MessageCircle className="w-4 h-4" /> 微信咨询
              </button>
              <button className="inline-flex items-center gap-2 px-5 py-3 bg-td-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                <Bot className="w-4 h-4" /> 问AI客服
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}