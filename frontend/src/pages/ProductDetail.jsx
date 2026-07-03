import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Phone, MessageCircle, Bot, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const allProducts = [
  { id: 1, name: '荷兰网', category: '金属网类', desc: '以低碳钢丝焊接成方形网片，表面高温浸裹绿色PVC塑料层，网身带波浪弯折造型，柔韧性好、不易变形。防腐耐候、安装简单、性价比高，整卷出厂裁剪铺设方便。', images: ['/images/helan-wang.jpg'], features: ['PVC浸塑防腐耐候', '波浪弯折造型柔韧性好', '整卷出厂裁剪方便', '搭配立柱卡扣快速围圈', '户外风吹雨淋可用10年以上'], scenes: ['养殖圈养', '农林防护', '场地隔离', '河道防护', '道路隔离'], specs: [{ label: '丝径', value: '1.2-3mm' }, { label: '网孔', value: '50x50mm' }, { label: '宽度', value: '0.9-1.8m' }, { label: '材质', value: '低碳钢丝+PVC' }, { label: '表面处理', value: 'PVC浸塑绿色' }] },
  { id: 2, name: '电焊网', category: '金属网类', desc: '由细铁丝横竖点焊成型，网孔均匀、焊点牢固，整卷包装方便裁剪运输。分热镀锌、冷镀锌、不锈钢三种材质，规格齐全可定制。', images: ['/images/dianhan-wang.jpg'], features: ['点焊成型焊点牢固', '网孔均匀规整', '整卷包装方便施工', '热镀锌/冷镀锌/不锈钢可选', '规格齐全可定制'], scenes: ['建筑工程', '养殖防护', '果蔬防护', '工业过滤', '设备防护'], specs: [{ label: '网孔', value: '1×1-10×10cm' }, { label: '丝径', value: '0.3-3mm' }, { label: '宽度', value: '0.5-2m' }, { label: '材质', value: '热镀锌/冷镀锌/不锈钢' }, { label: '包装', value: '整卷/定尺' }] },
  { id: 3, name: '钢板网', category: '金属网类', desc: '3×6、5×10常规钢板网现货，红漆防锈。一体冲压菱形网，无焊点不开裂，规格齐全可按需裁剪。加厚重型款承重更强，脚手架踏板、基坑防护通用。', images: ['/images/gangban-wang.jpg', '/images/gangban-wang-2.jpg', '/images/gangban-wang-3.jpg'], features: ['一体冲压菱形网', '无焊点不开裂', '红漆防锈处理', '加厚重型承重强', '规格齐全可按需裁剪'], scenes: ['脚手架踏板', '基坑防护', '厂房平台', '设备走道', '建筑装饰'], specs: [{ label: '网孔', value: '3×6 / 5×10等' }, { label: '板厚', value: '2-5mm' }, { label: '材质', value: 'Q235钢板' }, { label: '表面处理', value: '红漆防锈' }, { label: '规格', value: '可定制' }] },
  { id: 4, name: '双向塑料土工格栅', category: '金属网类', desc: '双向一体拉伸成型，纵横双向拉力均衡，抗拉伸、耐腐蚀、耐老化、不易断裂。适用公路乡村道路路基加固、边坡护坡、养殖场地面、堤坝挡土墙加筋。', images: ['/images/tugong-geshan.jpg'], features: ['双向拉伸拉力均衡', '抗拉伸耐腐蚀', '耐老化不易断裂', '防止路面沉降开裂', '施工简便量大价优'], scenes: ['公路路基加固', '边坡护坡', '养殖场地面', '堤坝挡土墙', '乡村道路'], specs: [{ label: '网孔', value: '25-40mm' }, { label: '幅宽', value: '2-4m' }, { label: '材质', value: 'PP/HDPE' }, { label: '拉伸方式', value: '双向拉伸' }, { label: '颜色', value: '黑色' }] },
  { id: 5, name: '石笼卷', category: '金属网类', desc: '采用热镀锌/镀铝锌低碳钢丝机器双绞编织成六角菱形网，双绞合编织结构韧性强，镀锌防腐防锈，透水透气，整卷可自由裁剪，配套成品石笼框现货。', images: ['/images/shilong-juan.jpg'], features: ['双绞合编织韧性强', '镀锌防腐防锈', '透水透气不冲垮', '整卷可自由裁剪', '配套石笼框现货'], scenes: ['河道护岸', '边坡防护', '生态挡墙', '防洪堤坝', '沟渠衬砌'], specs: [{ label: '网孔', value: '60x80-100x120mm' }, { label: '丝径', value: '2.0-4.0mm' }, { label: '材质', value: '热镀锌钢丝' }, { label: '编织方式', value: '双绞六角' }, { label: '包装', value: '整卷' }] },
  { id: 6, name: '压花网', category: '金属网类', desc: '又称轧花网，先把金属丝预先轧出波浪纹路再经纬交叉编织，丝材带波浪咬合整体结实，承重抗冲击优于普通电焊网。材质常见热镀锌铁丝、不锈钢丝，防锈牢固。', images: ['/images/yahua-wang.jpg'], features: ['波浪咬合整体结实', '承重抗冲击优于电焊网', '网目均匀不松脱', '镀锌款户外防锈', '不锈钢款耐酸碱'], scenes: ['养殖防护', '筛分过滤', '粮仓挡粮', '门窗防盗', '果蔬防护'], specs: [{ label: '网孔', value: '5-100mm' }, { label: '丝径', value: '1.0-12mm' }, { label: '材质', value: '热镀锌/不锈钢' }, { label: '编织方式', value: '预弯双向' }, { label: '表面处理', value: '镀锌/原色' }] },
  { id: 7, name: '六角网', category: '金属网类', desc: '由低碳镀锌铁丝双绞合编织成六角网孔，整体柔性好，拉扯不易开扣，防锈耐腐蚀。细丝款用于抹墙防裂、养殖围网；粗丝款用于河道护坡、边坡固土。', images: ['/images/liujiao-wang.jpg'], features: ['双绞拧花柔性更强', '拉扯不易开扣', '防锈耐腐蚀', '细丝抹墙粗丝护坡', '整卷发货可裁剪'], scenes: ['建筑抹墙', '养殖围网', '河道护坡', '边坡固土', '园林花艺'], specs: [{ label: '网孔', value: '25-100mm' }, { label: '丝径', value: '0.5-4mm' }, { label: '材质', value: '镀锌钢丝' }, { label: '编织方式', value: '双绞拧花' }, { label: '用途', value: '抹墙/养殖/护坡' }] },
  { id: 8, name: '美格网', category: '金属网类', desc: '由镀锌/浸塑钢管冲压焊接而成，网孔为大菱形，一体折弯成型，板材厚实抗撞击。粗方管焊接强度高，防盗防破坏效果好，菱形大网孔透光通风不遮挡采光。', images: ['/images/meige-wang.jpg'], features: ['粗方管焊接强度高', '防盗防破坏效果好', '菱形大网孔透光通风', '防腐防锈不易生锈', '一体折弯成型'], scenes: ['门窗防盗', '厂区围墙', '车间隔离', '楼梯防护', '球场围网'], specs: [{ label: '网孔', value: '菱形大孔' }, { label: '管材', value: '镀锌方管' }, { label: '材质', value: '镀锌/浸塑' }, { label: '表面处理', value: '热镀锌/浸塑绿色' }, { label: '用途', value: '门窗防盗/围栏' }] },
  { id: 9, name: '外墙耐碱网格布', category: '金属网类', desc: '材质为玻璃纤维编织，经耐碱乳液涂层处理，外墙保温抹灰工程专用。耐碱抗裂，抵御水泥砂浆碱性腐蚀，防止墙面开裂空鼓掉皮；韧性强拉力高，轻薄易施工。', images: ['/images/wangge-bu.jpg'], features: ['耐碱抗裂防脱落', '抵御水泥砂浆腐蚀', '韧性强拉力高', '轻薄易施工', '增强墙面整体强度'], scenes: ['外墙保温', '内墙防裂', '卫生间防水', '烟道加固', '石膏线条'], specs: [{ label: '克重', value: '60-300g/㎡' }, { label: '网孔', value: '4x4 / 5x5mm' }, { label: '幅宽', value: '1-2m' }, { label: '材质', value: '玻璃纤维+耐碱涂层' }, { label: '用途', value: '外墙/内墙防裂' }] },
  { id: 10, name: '堵灰网', category: '金属网类', desc: '属于细丝密孔电焊网，丝细网密，和砂浆附着力强，轻薄易裁剪。主要用于烟道堵灰、建筑抹灰防裂、工程填缝等装修土建工程，是装修工地常用辅材。', images: ['/images/duhui-wang.jpg'], features: ['丝细网密附着力强', '轻薄易裁剪', '防止抹灰掉灰', '成本低廉', '装修土建常用辅材'], scenes: ['烟道堵灰', '建筑抹灰', '管线填缝', '门窗防鼠', '过滤隔渣'], specs: [{ label: '网孔', value: '6-25mm' }, { label: '丝径', value: '0.3-0.8mm' }, { label: '宽度', value: '0.3-1m' }, { label: '材质', value: '黑丝/镀锌' }, { label: '包装', value: '整卷' }] },
  { id: 11, name: '圆孔网', category: '金属网类', desc: '以镀锌钢板、不锈钢板、铁板为原料，机器冲压出均匀圆形孔洞，板材平整，孔洞规整。通风透光过滤效果好，板材坚固耐磨，可裁剪折弯加工成各种设备护罩。', images: ['/images/yuankong-wang.jpg'], features: ['孔洞规整开孔均匀', '通风透光过滤好', '板材坚固耐磨', '可裁剪折弯加工', '防锈款户外耐用'], scenes: ['设备防护罩', '隔音穿孔板', '粮食筛分', '幕墙装饰', '井盖盖板'], specs: [{ label: '孔径', value: '2-50mm' }, { label: '板厚', value: '0.5-5mm' }, { label: '材质', value: '不锈钢/镀锌板/铁板' }, { label: '排列方式', value: '60°/45°/直排' }, { label: '尺寸', value: '可定制' }] },
  { id: 12, name: '钢筋网片', category: '金属网类', desc: '采用冷拔带肋钢筋横竖精密点焊成型，整片式钢筋网格，丝粗刚性强。焊点牢固拉力强度高，大幅提升混凝土结构整体性，代替人工绑扎钢筋省时省力。', images: ['/images/gangjin-wangpian.jpg'], features: ['焊点牢固拉力强', '提升混凝土整体性', '代替人工绑扎省时省力', '网孔标准统一', '防锈可选黑丝/镀锌'], scenes: ['厂房地坪', '车库地面', '桥面铺装', '屋面保护层', '地基垫层'], specs: [{ label: '钢筋直径', value: '4-12mm' }, { label: '网孔', value: '100-300mm' }, { label: '材质', value: 'CRB550冷轧带肋' }, { label: '焊接方式', value: '自动电阻焊' }, { label: '表面处理', value: '黑丝/热镀锌' }] },
  { id: 13, name: '镀锌网片', category: '金属网类', desc: '低碳钢丝焊接成型后整体热镀锌处理，整片式方形网格，焊点牢固，表面镀锌层防锈耐腐蚀。片状结构裁剪拼接安装方便，网孔规整，硬度高于卷装电焊网。', images: ['/images/duxin-wangpian.jpg'], features: ['镀锌层防锈耐腐蚀', '片状结构安装方便', '网孔规整硬度高', '焊点牢固', '承重优于卷装电焊网'], scenes: ['养殖笼具', '建筑抹灰', '设备防护', '货架隔离', '场地围挡'], specs: [{ label: '丝径', value: '0.5-6mm' }, { label: '网孔', value: '12.7-200mm' }, { label: '材质', value: '低碳钢丝' }, { label: '表面处理', value: '热镀锌' }, { label: '尺寸', value: '可定制' }] },
  { id: 14, name: '双边丝护栏网', category: '护栏防护', desc: '整体低碳钢丝焊接成型，表面浸塑绿色防腐层，网片两侧多出两道加粗竖丝（双边），搭配圆管立柱与卡扣组装。浸塑表层耐日晒雨淋，双边加固结构不易变形，安装简单成本低。', images: ['/images/shuangbi-hulan.jpg'], features: ['浸塑表层耐日晒雨淋', '双边加固不易变形', '安装简单成本低', '网片通透不遮挡视线', '搭配立柱卡扣组装'], scenes: ['公路隔离', '果园围栏', '厂区隔离', '河道围挡', '山地边坡'], specs: [{ label: '丝径', value: '3-5mm' }, { label: '网孔', value: '50x50 / 75x75mm' }, { label: '高度', value: '1.2-2.5m' }, { label: '立柱', value: '圆管立柱' }, { label: '表面处理', value: '浸塑绿色' }] },
  { id: 15, name: '电梯井口防护门', category: '护栏防护', desc: '建筑工地电梯井专用安全围挡，整体钢板网/方管焊接，橙黄醒目烤漆，自带安全警示标语。框架加厚方管，中间菱形钢板网通透轻量化，底部黑黄警示踢脚板，板面印刷警示文字。', images: ['/images/diantijing-fanghu.jpg'], features: ['橙黄醒目烤漆', '自带安全警示标语', '加厚方管框架', '菱形钢板网通透轻量', '配套固定连接件可重复使用'], scenes: ['电梯井口', '管道井口', '高层施工', '地下室井道', '安监检查'], specs: [{ label: '尺寸', value: '1.2x1.8m / 定制' }, { label: '框架', value: '加厚方管' }, { label: '材质', value: '钢板网+方管' }, { label: '表面处理', value: '烤漆橙黄' }, { label: '配件', value: '固定连接件' }] },
  { id: 16, name: '竖管基坑护栏', category: '护栏防护', desc: '工地基坑、楼层临边专用安全防护围栏，采用加厚方管框架+密集竖向竖管焊接，整体喷白漆，顶部配有红白警示挡脚板，印有禁止跨越、严禁抛物安全标语。密集竖管结构缝隙窄，防止人员物料失足坠落。', images: ['/images/jikeng-hulan.jpg'], features: ['密集竖管防坠落', '加厚方管框架', '红白警示条醒目', '配套立柱卡扣拆装便捷', '可重复周转使用'], scenes: ['基坑周边', '楼层临边', '阳台洞口', '道路施工', '泥浆池隔离'], specs: [{ label: '尺寸', value: '2x1.2m' }, { label: '框架', value: '加厚方管' }, { label: '竖管间距', value: '≤120mm' }, { label: '表面处理', value: '喷白漆+红白警示' }, { label: '配件', value: '立柱+卡扣' }] },
  { id: 17, name: 'U型锌钢草坪护栏', category: '护栏防护', desc: '锌钢草坪护栏（U型绿化护栏），材质为镀锌钢管喷涂防锈漆。用于市政道路绿化带、小区花池、公园草坪、庭院花园隔离。防腐防锈、颜色美观，有40cm/60cm/80cm多种高度规格。', images: ['/images/caoping-hulan.jpg'], features: ['防腐防锈耐用', '颜色美观绿白搭配', '多种高度规格可选', '预埋/底盘两种安装方式', '分隔绿植与人行道'], scenes: ['市政绿化带', '小区花池', '公园草坪', '庭院花园', '道路绿化'], specs: [{ label: '材质', value: '镀锌钢管' }, { label: '高度', value: '40/60/80cm' }, { label: '颜色', value: '绿白搭配' }, { label: '安装方式', value: '预埋/底盘固定' }, { label: '表面处理', value: '喷涂防锈漆' }] },
  { id: 18, name: '钢格板', category: '护栏防护', desc: '扁钢与扭绞方钢焊接而成的镂空板材，承重强、排水快、防滑防锈。用于平台踏步、排水沟盖板、车间走道、树池盖板、市政沟盖、停车场排水格栅，支持定制各种尺寸厚度规格。', images: ['/images/gangge-ban.jpg'], features: ['承重强排水快', '防滑防锈', '支持定制尺寸厚度', '扁钢与扭绞方钢焊接', '镂空板材透水性好'], scenes: ['平台踏步', '排水沟盖板', '车间走道', '树池盖板', '停车场排水'], specs: [{ label: '扁钢厚度', value: '3-8mm' }, { label: '网孔', value: '30x30 / 40x100mm' }, { label: '材质', value: 'Q235扁钢+扭绞方钢' }, { label: '表面处理', value: '热镀锌' }, { label: '规格', value: '可定制' }] },
  { id: 19, name: '波形护栏', category: '护栏防护', desc: '波形梁板为加厚镀锌钢板+喷塑绿色防腐层，带预留螺栓孔拼接固定，搭配绿色钢管立柱与方形法兰底座。车辆失控撞击时波浪钢板形变吸收冲击力，缓冲减速，阻挡车辆冲出路面，降低车祸伤亡。', images: ['/images/boxing-hulan.jpg'], features: ['形变吸能缓冲减速', '热镀锌+喷塑双层防腐', '阻挡车辆冲出路面', '拆装拼接方便', '绿色外观适配道路'], scenes: ['乡村公路', '国道高速', '山区弯道', '厂区道路', '临水临崖'], specs: [{ label: '板厚', value: '3.0/4.0mm' }, { label: '板宽', value: '310/506mm' }, { label: '立柱', value: 'Φ114/Φ140' }, { label: '表面处理', value: '热镀锌+喷塑' }, { label: '配件', value: '防阻块/螺栓/端头' }] },
  { id: 20, name: '市政道路护栏', category: '护栏防护', desc: '锌钢市政护栏，主体为镀锌钢管静电喷塑处理，竖杆底部贴蓝色反光条，搭配重型橡胶底座直接摆放路面。带反光标识夜间可视性强，底座配重稳固拆装移动方便，防锈耐晒颜色可定制。', images: ['/images/shizheng-hulan.jpg', '/images/shizheng-hulan-2.jpg'], features: ['带反光标识夜间可视', '底座配重稳固', '拆装移动方便', '防锈耐晒', '竖杆间隙窄防翻越'], scenes: ['城市道路分隔', '人行道防护', '景区道路', '厂区道路', '广场分流'], specs: [{ label: '材质', value: '镀锌钢管' }, { label: '高度', value: '0.6-1.2m' }, { label: '颜色', value: '白蓝/白红' }, { label: '底座', value: '重型橡胶' }, { label: '表面处理', value: '静电喷塑' }] },
  { id: 21, name: '可移动伸缩隔离护栏', category: '护栏防护', desc: '玻璃钢绝缘材质，杆身红白相间警示配色，两侧黄色支架带防滑底座，交叉铰接结构可自由拉伸收拢折叠。绝缘不导电，电力场景专用安全款，轻便易搬运，无需预埋安装落地即可使用。', images: ['/images/suoshen-hulan.jpg'], features: ['绝缘不导电电力专用', '伸缩设计拉伸数米', '红白警示色醒目', '轻便易搬运', '无需预埋落地即用'], scenes: ['电力检修', '道路施工', '活动分流', '设备检修', '电梯维修'], specs: [{ label: '材质', value: '玻璃钢' }, { label: '伸展长度', value: '2-5m' }, { label: '高度', value: '1-1.2m' }, { label: '颜色', value: '红白相间' }, { label: '支架', value: '黄色防滑底座' }] },
  { id: 22, name: '锌钢围墙护栏', category: '护栏防护', desc: '组装式锌钢护栏，主材为镀锌方管、扁管，表面高温喷塑防腐。经典蓝白配色，竖杆顶端带防攀爬尖头。镀锌+喷塑双层防腐，风吹日晒不易生锈掉漆，组装式结构施工简单快捷，尖头设计防盗防翻越。', images: ['/images/weiqiang-hulan.jpg'], features: ['镀锌+喷塑双层防腐', '尖头设计防攀爬', '组装式安装快捷', '蓝白配色美观', '颜色高度可定制'], scenes: ['小区院墙', '别墅庭院', '工厂厂区', '学校围墙', '新农村院墙'], specs: [{ label: '型材', value: '40x40 / 60x60mm' }, { label: '竖杆', value: '19x19mm' }, { label: '高度', value: '1.2-2.5m' }, { label: '表面处理', value: '喷塑蓝白' }, { label: '安装方式', value: '预埋/底盘' }] },
  { id: 23, name: '小草彩钢施工围挡', category: '护栏防护', desc: '主体是彩钢波纹板，搭配镀锌方管边框与立柱，底部贴黄黑警示反光条。小草围挡板面覆仿真绿色草皮美观遮丑，纯色蓝色彩钢围挡成本更低。轻便模块化拼接安装速度快，可重复拆装周转使用。', images: ['/images/shigong-weizhe.jpg'], features: ['轻便模块化安装快', '可重复拆装周转', '小草款美观遮丑', '底部警示条醒目', '防水防锈可加喷淋'], scenes: ['道路修路', '市政管网改造', '楼盘工地', '管线抢修', '临时场地划分'], specs: [{ label: '高度', value: '2-2.5m' }, { label: '宽度', value: '2-3m/块' }, { label: '板材', value: '彩钢波纹板' }, { label: '框架', value: '镀锌方管' }, { label: '款式', value: '小草/纯蓝' }] },
  { id: 24, name: '球场框网', category: '护栏防护', desc: '框架式球场围网，整体为镀锌钢丝焊接网片+方管边框，表面浸塑处理呈绿色，搭配专用圆管立柱。网孔细密结构牢固，阻挡球类飞出场地，高度可定制满足不同球类防护需求。浸塑防晒防锈，带方管框架抗篮球足球大力撞击不变形。', images: ['/images/qiuchang-wang.jpg'], features: ['浸塑绿色防晒防锈', '方管框架抗撞击不变形', '网孔细密球不易穿出', '模块化拼装简便', '破损单片可单独更换'], scenes: ['篮球场', '网球场', '足球场', '羽毛球场', '校园运动场'], specs: [{ label: '网孔', value: '50x50mm' }, { label: '丝径', value: '2.5-4mm' }, { label: '高度', value: '3/4/6m' }, { label: '立柱', value: 'Φ60/Φ75' }, { label: '表面处理', value: '浸塑绿色' }] },
  { id: 25, name: '防撞桶', category: '交通设施', desc: '桶身黄色PE塑料一体成型，贴红白高反光方格膜，使用时内部灌满水或沙子增重提升缓冲效果。车辆撞上时桶体变形、内部水沙卸力，大幅降低撞击损伤；夜间红白反光膜高亮醒目，耐晒抗老化。', images: ['/images/fangzhuang-tong.jpg'], features: ['缓冲吸能降低撞击损伤', '红白反光膜夜间醒目', '可注水沙增重', '排空后轻便可移动', '耐晒抗老化'], scenes: ['道路路口', '收费站', '施工路段', '停车场出入口', '隧道口'], specs: [{ label: '直径', value: '60/90cm' }, { label: '高度', value: '80/120cm' }, { label: '材质', value: 'PE塑料' }, { label: '反光膜', value: '红白高强级' }, { label: '填充物', value: '水/沙' }] },
  { id: 26, name: '路锥', category: '交通设施', desc: '底座为黑色加重橡胶/塑料六边形底座不易倾倒，锥身红白相间高反光膜，可搭配橙色连接警示环串联使用。高反光膜夜间远距离警示，柔性锥身车辆碾压不易碎裂回弹恢复，加重底座防滑配重。', images: ['/images/lu-zhui.jpg'], features: ['高反光膜夜间远距离警示', '柔性锥身碾压回弹', '加重底座防滑配重', '可搭配警示链串联', '多种高度可选'], scenes: ['道路施工', '交通管制', '停车场', '学校门口', '活动现场'], specs: [{ label: '高度', value: '30/50/70/90cm' }, { label: '底座', value: '六边形加重' }, { label: '材质', value: 'PVC软质' }, { label: '反光膜', value: '红白高强级' }, { label: '配件', value: '警示链/警示灯' }] },
  { id: 27, name: '橡胶减速带', category: '交通设施', desc: '人字纹款减速带，黑黄相间配色起到警示作用，表面人字防滑纹路，自带安装孔搭配膨胀螺丝固定路面。主体为高强度橡胶，韧性好抗压耐磨减震降噪，利用路面凸起迫使车辆减速，减少交通事故。', images: ['/images/jiansu-dai.jpg'], features: ['人字防滑纹路', '黑黄相间警示', '高强度橡胶抗压耐磨', '自带安装孔膨胀螺丝固定', '减震降噪'], scenes: ['小区出入口', '学校门口', '停车场', '厂区道路', '乡村道路'], specs: [{ label: '长度', value: '1m/块' }, { label: '宽度', value: '30-35cm' }, { label: '厚度', value: '3/4/5cm' }, { label: '材质', value: '高强度橡胶' }, { label: '颜色', value: '黑黄相间' }] },
  { id: 28, name: '道路施工反光警示牌', category: '交通设施', desc: '板面多为铝板，贴高亮反光膜，夜间车灯照射反光保障夜晚可视，配套金属支架可直接落地摆放拆装方便。用于市政修路、工地封路、小区道路改造等临时交通管制场景，支持尺寸文字图案定制。', images: ['/images/jingshi-pai.jpg'], features: ['高亮反光膜夜间可视', '铝板基材耐候性好', '配套金属支架落地摆放', '拆装方便', '内容可定制'], scenes: ['市政修路', '工地封路', '小区改造', '临时管制', '紧急抢修'], specs: [{ label: '板材', value: '铝板' }, { label: '反光膜', value: '高亮反光' }, { label: '支架', value: '金属折叠' }, { label: '尺寸', value: '可定制' }, { label: '内容', value: '可定制' }] },
  { id: 29, name: '黑黄斜纹反光膜', category: '交通设施', desc: '卷材式高亮反光贴膜，经典黑黄相间斜纹配色，自带背胶撕开即贴，车灯照射下强反光。用于水泥墩、护栏、桥墩、防撞桶、路沿粘贴提醒车辆避让障碍物；防水防晒户外长期使用不易褪色起皮。', images: ['/images/fanguang-mo.jpg'], features: ['自带背胶撕开即贴', '夜间车灯强反光', '黑黄斜纹国标警示色', '防水防晒不易褪色', '金属水泥塑料均可粘贴'], scenes: ['水泥墩护栏', '桥墩防撞', '防撞桶路沿', '厂房立柱', '地下车库'], specs: [{ label: '宽度', value: '5-15cm' }, { label: '颜色', value: '黑黄斜纹' }, { label: '背胶', value: '自带强力背胶' }, { label: '适用面', value: '金属/水泥/塑料' }, { label: '衍生', value: '红白款/立柱反光贴' }] },
  { id: 30, name: '盒装伸缩警戒带', category: '交通设施', desc: '便携盒装卷盘款，黄白相间警示布带印有"安全带、警戒线"字样，收纳在塑料卷盘内可自由拉伸回收。加厚PE/涤纶材质韧性强不易扯断耐磨防水可重复使用。用于道路施工、道路抢修临时隔离，提醒路人车辆避让。', images: ['/images/jingjie-tai.jpg'], features: ['卷盘收纳用完自动回收', 'PE/涤纶材质韧性强', '耐磨防水可重复使用', '便携携带不打结', '多种配色可选'], scenes: ['道路施工', '道路抢修', '基坑检修', '电力施工', '事故现场'], specs: [{ label: '带宽', value: '5cm' }, { label: '材质', value: 'PE/涤纶' }, { label: '颜色', value: '黄白/红白/黄黑' }, { label: '收纳', value: '卷盘盒装' }, { label: '用途', value: '临时隔离警戒' }] },
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
