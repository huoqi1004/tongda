-- 通达丝网官网 数据库初始化脚本
-- Database: tongda_silk

CREATE DATABASE IF NOT EXISTS tongda_silk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tongda_silk;

-- ============================================================
-- 1. 产品分类表 categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '分类名称',
  slug VARCHAR(100) NOT NULL COMMENT 'URL友好名称',
  parent_id INT DEFAULT NULL COMMENT '父分类ID，NULL表示顶级分类',
  sort_order INT DEFAULT 0 COMMENT '排序序号',
  description TEXT COMMENT '分类描述',
  image_url VARCHAR(500) COMMENT '分类图片',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  UNIQUE KEY uk_slug (slug),
  INDEX idx_parent (parent_id),
  INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品分类表';

-- ============================================================
-- 2. 产品表 products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL COMMENT '所属分类ID',
  name VARCHAR(200) NOT NULL COMMENT '产品名称',
  slug VARCHAR(200) NOT NULL COMMENT 'URL友好名称',
  model VARCHAR(100) COMMENT '产品型号',
  description TEXT COMMENT '产品描述',
  specification TEXT COMMENT '产品规格参数',
  material VARCHAR(200) COMMENT '材质',
  surface_treatment VARCHAR(200) COMMENT '表面处理',
  mesh_size VARCHAR(100) COMMENT '网孔尺寸',
  wire_diameter VARCHAR(100) COMMENT '丝径',
  width VARCHAR(100) COMMENT '宽度',
  length VARCHAR(100) COMMENT '长度',
  price DECIMAL(10,2) COMMENT '参考价格',
  unit VARCHAR(20) DEFAULT '平方米' COMMENT '计价单位',
  cover_image VARCHAR(500) COMMENT '封面图片',
  images TEXT COMMENT '产品图片JSON数组',
  is_featured TINYINT(1) DEFAULT 0 COMMENT '是否推荐',
  is_hot TINYINT(1) DEFAULT 0 COMMENT '是否热销',
  is_new TINYINT(1) DEFAULT 0 COMMENT '是否新品',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否上架',
  view_count INT DEFAULT 0 COMMENT '浏览次数',
  sort_order INT DEFAULT 0 COMMENT '排序序号',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE KEY uk_slug (slug),
  INDEX idx_category (category_id),
  INDEX idx_featured (is_featured),
  INDEX idx_active (is_active),
  INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品表';

-- ============================================================
-- 3. 普通用户表 users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_or_email VARCHAR(100) NOT NULL COMMENT '手机号或邮箱',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  nickname VARCHAR(50) COMMENT '昵称',
  avatar VARCHAR(500) COMMENT '头像URL',
  company VARCHAR(200) COMMENT '公司名称',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_phone_email (phone_or_email),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='普通用户表';

-- ============================================================
-- 4. 管理员用户表 admin_users
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL COMMENT '用户名',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  nickname VARCHAR(50) COMMENT '昵称',
  role ENUM('super_admin','admin','editor') DEFAULT 'admin' COMMENT '角色',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员用户表';

-- ============================================================
-- 5. 会话表 conversations
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT COMMENT '关联用户ID，NULL表示匿名用户',
  visitor_id VARCHAR(100) COMMENT '匿名访客标识',
  title VARCHAR(200) DEFAULT '新对话' COMMENT '会话标题',
  status ENUM('active','pending','closed') DEFAULT 'active' COMMENT '会话状态：active-进行中, pending-等待人工, closed-已关闭',
  unread_count INT DEFAULT 0 COMMENT '未读消息数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_visitor (visitor_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话表';

-- ============================================================
-- 6. 消息表 messages
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL COMMENT '所属会话ID',
  role ENUM('user','assistant','system') NOT NULL COMMENT '消息角色',
  content TEXT NOT NULL COMMENT '消息内容',
  source ENUM('manual','rag','faq') DEFAULT 'manual' COMMENT '消息来源',
  confidence DECIMAL(3,2) COMMENT 'AI回复置信度(0-1)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  INDEX idx_conversation (conversation_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表';

-- ============================================================
-- 7. 知识文档表 knowledge_docs
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_docs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL COMMENT '文档标题',
  category VARCHAR(100) COMMENT '文档分类',
  content MEDIUMTEXT COMMENT '文档内容',
  file_url VARCHAR(500) COMMENT '上传文件URL',
  file_type VARCHAR(50) COMMENT '文件类型',
  chunk_count INT DEFAULT 0 COMMENT '分块数量',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识文档表';

-- ============================================================
-- 8. 知识分块表 knowledge_chunks
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  doc_id INT NOT NULL COMMENT '所属文档ID',
  chunk_index INT NOT NULL COMMENT '分块序号',
  content TEXT NOT NULL COMMENT '分块内容',
  embedding LONGTEXT COMMENT '向量嵌入JSON字符串',
  token_count INT DEFAULT 0 COMMENT 'Token数量',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (doc_id) REFERENCES knowledge_docs(id) ON DELETE CASCADE,
  INDEX idx_doc (doc_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识分块表';

-- ============================================================
-- 9. 联系表单表 contact_forms
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '联系人姓名',
  phone VARCHAR(30) COMMENT '联系电话',
  email VARCHAR(100) COMMENT '联系邮箱',
  company VARCHAR(200) COMMENT '公司名称',
  subject VARCHAR(200) COMMENT '主题',
  message TEXT NOT NULL COMMENT '留言内容',
  source VARCHAR(50) DEFAULT 'web' COMMENT '来源',
  is_read TINYINT(1) DEFAULT 0 COMMENT '是否已读',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='联系表单表';

-- ============================================================
-- 初始数据：管理员用户 (admin / admin123456)
-- bcrypt hash of 'admin123456': $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ============================================================
INSERT IGNORE INTO admin_users (username, password_hash, nickname, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '超级管理员', 'super_admin');

-- ============================================================
-- 初始数据：产品分类
-- ============================================================

-- 顶级分类
INSERT IGNORE INTO categories (id, name, slug, parent_id, sort_order, description) VALUES
(1, '金属网类', 'metal-mesh', NULL, 1, '各类金属丝网产品，包括不锈钢网、电焊网、轧花网等'),
(2, '防护网/护栏', 'protective-mesh', NULL, 2, '各类防护网和护栏产品，包括公路护栏、球场围栏、车间隔离网等'),
(3, '交通设施', 'traffic-facilities', NULL, 3, '各类交通安全设施产品，包括声屏障、标志牌、防眩网等');

-- 金属网类子分类
INSERT IGNORE INTO categories (id, name, slug, parent_id, sort_order, description) VALUES
(4, '不锈钢网', 'stainless-steel-mesh', 1, 1, '304/316不锈钢网，耐腐蚀、耐高温，广泛应用于化工、食品、医药等行业'),
(5, '电焊网', 'welded-wire-mesh', 1, 2, '热镀锌/冷镀锌电焊网，广泛用于建筑、养殖、围栏等领域'),
(6, '轧花网', 'crimped-wire-mesh', 1, 3, '重型轧花网，适用于矿山、冶金、建筑等行业的筛分与过滤'),
(7, '钢板网', 'expanded-metal-mesh', 1, 4, '钢板拉伸网，强度高、通风好，适用于平台踏板、建筑装饰等'),
(8, '冲孔网', 'perforated-metal-mesh', 1, 5, '金属冲孔板网，孔型多样，适用于过滤、隔音、装饰等'),
(9, '六角网', 'hexagonal-wire-mesh', 1, 6, '六角编织网（石笼网），广泛用于水利工程、边坡防护等');

-- 防护网/护栏子分类
INSERT IGNORE INTO categories (id, name, slug, parent_id, sort_order, description) VALUES
(10, '公路护栏网', 'highway-guardrail', 2, 1, '高速公路/普通公路波形护栏和框架护栏网'),
(11, '球场围栏网', 'sports-field-fence', 2, 2, '篮球场、足球场、网球场等体育场地围栏'),
(12, '车间隔离网', 'workshop-partition', 2, 3, '工厂车间分区隔离、仓库围栏等'),
(13, '边坡防护网', 'slope-protection', 2, 4, '山体边坡主动/被动防护网系统');

-- 交通设施子分类
INSERT IGNORE INTO categories (id, name, slug, parent_id, sort_order, description) VALUES
(14, '声屏障', 'sound-barrier', 3, 1, '高速公路/铁路隔音屏障板，降低交通噪声'),
(15, '标志牌', 'traffic-signs', 3, 2, '交通标志牌、指路牌、警示牌'),
(16, '防眩网', 'anti-glare-mesh', 3, 3, '高速公路中央隔离带防眩网');

-- ============================================================
-- 初始数据：产品（30个）
-- ============================================================

INSERT IGNORE INTO products (id, category_id, name, slug, model, description, specification, material, surface_treatment, mesh_size, wire_diameter, width, length, price, unit, is_featured, is_hot, is_new, is_active, sort_order) VALUES
-- 金属网类
(1, 5, '荷兰网', 'helan-wang', 'TD-HL-001', '以低碳钢丝焊接成方形网片，表面高温浸裹绿色PVC塑料层，网身带波浪弯折造型，柔韧性好、不易变形。防腐耐候、安装简单、性价比高，整卷出厂裁剪铺设方便。', '丝径: 1.2-3mm\n网孔: 50x50mm\n宽度: 0.9-1.8m\n表面: PVC浸塑', '低碳钢丝', 'PVC浸塑', '50x50mm', '1.2-3mm', '0.9-1.8m', '30/50m/卷', 18.00, '米', 1, 1, 0, 1, 1),
(2, 5, '电焊网', 'dianhan-wang', 'TD-DH-001', '由细铁丝横竖点焊成型，网孔均匀、焊点牢固，整卷包装方便裁剪运输。分热镀锌、冷镀锌、不锈钢三种材质，规格齐全可定制。', '网孔: 1×1-10×10cm\n丝径: 0.3-3mm\n宽度: 0.5-2m\n材质: 热镀锌/冷镀锌/不锈钢', '低碳钢丝', '热镀锌/冷镀锌', '1-100mm', '0.3-3mm', '0.5-2m', '30m/卷', 12.00, '平方米', 1, 0, 0, 1, 2),
(3, 7, '钢板网', 'gangban-wang', 'TD-GB-001', '3×6、5×10常规钢板网现货，红漆防锈。一体冲压菱形网，无焊点不开裂，规格齐全可按需裁剪。加厚重型款承重更强，脚手架踏板、基坑防护通用。', '网孔: 3×6 / 5×10等\n板厚: 2-5mm\n材质: Q235钢板\n表面: 红漆防锈', 'Q235钢板', '红漆防锈', '3×6-5×10mm', '2-5mm', '1-2m', '2-4m', 35.00, '平方米', 1, 0, 0, 1, 3),
(4, 5, '双向塑料土工格栅', 'tugong-geshan', 'TD-TG-001', '双向一体拉伸成型，纵横双向拉力均衡，抗拉伸、耐腐蚀、耐老化、不易断裂。适用公路乡村道路路基加固、边坡护坡、养殖场地面、堤坝挡土墙加筋。', '网孔: 25-40mm\n幅宽: 2-4m\n材质: PP/HDPE\n拉伸方式: 双向拉伸', 'PP/HDPE', '原色', '25-40mm', '-', '2-4m', '50m/卷', 8.00, '平方米', 0, 0, 0, 1, 4),
(5, 9, '石笼卷', 'shilong-juan', 'TD-SL-001', '采用热镀锌/镀铝锌低碳钢丝机器双绞编织成六角菱形网，双绞合编织结构韧性强，镀锌防腐防锈，透水透气，整卷可自由裁剪，配套成品石笼框现货。', '网孔: 60x80-100x120mm\n丝径: 2.0-4.0mm\n材质: 热镀锌钢丝\n编织: 双绞六角', '热镀锌钢丝', '热镀锌', '60x80-100x120mm', '2.0-4.0mm', '1-2m', '25-50m/卷', 28.00, '平方米', 1, 0, 0, 1, 5),
(6, 6, '压花网', 'yahua-wang', 'TD-YH-001', '又称轧花网，先把金属丝预先轧出波浪纹路再经纬交叉编织，丝材带波浪咬合整体结实，承重抗冲击优于普通电焊网。材质常见热镀锌铁丝、不锈钢丝，防锈牢固。', '网孔: 5-100mm\n丝径: 1.0-12mm\n材质: 热镀锌/不锈钢\n编织: 预弯双向', '热镀锌钢丝/不锈钢', '镀锌/原色', '5-100mm', '1.0-12mm', '1-2.5m', '定尺', 32.00, '平方米', 0, 0, 0, 1, 6),
(7, 9, '六角网', 'liujiao-wang', 'TD-LJ-001', '由低碳镀锌铁丝双绞合编织成六角网孔，整体柔性好，拉扯不易开扣，防锈耐腐蚀。细丝款用于抹墙防裂、养殖围网；粗丝款用于河道护坡、边坡固土。', '网孔: 25-100mm\n丝径: 0.5-4mm\n材质: 镀锌钢丝\n编织: 双绞拧花', '镀锌钢丝', '热镀锌', '25-100mm', '0.5-4mm', '1-2m', '30m/卷', 15.00, '平方米', 0, 0, 0, 1, 7),
(8, 7, '美格网', 'meige-wang', 'TD-MG-001', '由镀锌/浸塑钢管冲压焊接而成，网孔为大菱形，一体折弯成型，板材厚实抗撞击。粗方管焊接强度高，防盗防破坏效果好，菱形大网孔透光通风不遮挡采光。', '网孔: 菱形大孔\n管材: 镀锌方管\n材质: 镀锌/浸塑\n用途: 门窗防盗', '镀锌钢管', '热镀锌/浸塑', '菱形', '-', '1-2m', '定尺', 45.00, '平方米', 0, 0, 0, 1, 8),
(9, 5, '外墙耐碱网格布', 'wangge-bu', 'TD-WG-001', '材质为玻璃纤维编织，经耐碱乳液涂层处理，外墙保温抹灰工程专用。耐碱抗裂，抵御水泥砂浆碱性腐蚀，防止墙面开裂空鼓掉皮；韧性强拉力高，轻薄易施工。', '克重: 60-300g/㎡\n网孔: 4x4 / 5x5mm\n幅宽: 1-2m\n材质: 玻璃纤维+耐碱涂层', '玻璃纤维', '耐碱涂层', '4x4 / 5x5mm', '-', '1-2m', '50-100m/卷', 6.00, '平方米', 0, 0, 0, 1, 9),
(10, 5, '堵灰网', 'duhui-wang', 'TD-DH-002', '属于细丝密孔电焊网，丝细网密，和砂浆附着力强，轻薄易裁剪。主要用于烟道堵灰、建筑抹灰防裂、工程填缝等装修土建工程，是装修工地常用辅材。', '网孔: 6-25mm\n丝径: 0.3-0.8mm\n宽度: 0.3-1m\n材质: 黑丝/镀锌', '低碳钢丝', '黑丝/镀锌', '6-25mm', '0.3-0.8mm', '0.3-1m', '30m/卷', 5.00, '平方米', 0, 0, 0, 1, 10),
(11, 8, '圆孔网', 'yuankong-wang', 'TD-YK-001', '以镀锌钢板、不锈钢板、铁板为原料，机器冲压出均匀圆形孔洞，板材平整，孔洞规整。通风透光过滤效果好，板材坚固耐磨，可裁剪折弯加工成各种设备护罩。', '孔径: 2-50mm\n板厚: 0.5-5mm\n材质: 不锈钢/镀锌板/铁板\n排列: 60°/45°/直排', '不锈钢/镀锌板/铁板', '原色/喷塑', '2-50mm(孔径)', '0.5-5mm', '1-1.5m', '2-3m', 55.00, '平方米', 0, 0, 0, 1, 11),
(12, 5, '钢筋网片', 'gangjin-wangpian', 'TD-GJ-001', '采用冷拔带肋钢筋横竖精密点焊成型，整片式钢筋网格，丝粗刚性强。焊点牢固拉力强度高，大幅提升混凝土结构整体性，代替人工绑扎钢筋省时省力。', '钢筋直径: 4-12mm\n网孔: 100-300mm\n材质: CRB550冷轧带肋\n焊接: 自动电阻焊', 'CRB550冷轧带肋钢筋', '黑丝/热镀锌', '100-300mm', '4-12mm', '2-3m', '6m/片', 42.00, '平方米', 0, 1, 0, 1, 12),
(13, 5, '镀锌网片', 'duxin-wangpian', 'TD-DX-001', '低碳钢丝焊接成型后整体热镀锌处理，整片式方形网格，焊点牢固，表面镀锌层防锈耐腐蚀。片状结构裁剪拼接安装方便，网孔规整，硬度高于卷装电焊网。', '丝径: 0.5-6mm\n网孔: 12.7-200mm\n材质: 低碳钢丝\n表面: 热镀锌', '低碳钢丝', '热镀锌', '12.7-200mm', '0.5-6mm', '0.5-2m', '2m/片', 22.00, '平方米', 0, 0, 0, 1, 13),

-- 护栏防护
(14, 10, '双边丝护栏网', 'shuangbi-hulan', 'TD-SB-001', '整体低碳钢丝焊接成型，表面浸塑绿色防腐层，网片两侧多出两道加粗竖丝（双边），搭配圆管立柱与卡扣组装。浸塑表层耐日晒雨淋，双边加固结构不易变形，安装简单成本低。', '丝径: 3-5mm\n网孔: 50x50 / 75x75mm\n高度: 1.2-2.5m\n表面: 浸塑绿色', '低碳钢丝', '浸塑绿色', '50x50 / 75x75mm', '3-5mm', '2.5-3m', '1.2-2.5m', 38.00, '平方米', 1, 1, 0, 1, 14),
(15, 10, '电梯井口防护门', 'diantijing-fanghu', 'TD-DT-001', '建筑工地电梯井专用安全围挡，整体钢板网/方管焊接，橙黄醒目烤漆，自带安全警示标语。框架加厚方管，中间菱形钢板网通透轻量化，底部黑黄警示踢脚板，板面印刷警示文字。', '尺寸: 1.2x1.8m / 定制\n框架: 加厚方管\n材质: 钢板网+方管\n表面: 烤漆橙黄', '钢板网+方管', '烤漆橙黄', '菱形', '-', '1.2m', '1.8m', 180.00, '套', 0, 0, 0, 1, 15),
(16, 10, '竖管基坑护栏', 'jikeng-hulan', 'TD-JK-001', '工地基坑、楼层临边专用安全防护围栏，采用加厚方管框架+密集竖向竖管焊接，整体喷白漆，顶部配有红白警示挡脚板，印有禁止跨越、严禁抛物安全标语。', '尺寸: 2x1.2m\n框架: 加厚方管\n竖管间距: ≤120mm\n表面: 喷白漆+红白警示', '方管', '喷白漆+红白警示', '-', '-', '2m', '1.2m', 150.00, '套', 0, 0, 0, 1, 16),
(17, 10, 'U型锌钢草坪护栏', 'caoping-hulan', 'TD-CP-001', '锌钢草坪护栏（U型绿化护栏），材质为镀锌钢管喷涂防锈漆。用于市政道路绿化带、小区花池、公园草坪、庭院花园隔离。防腐防锈、颜色美观，有40cm/60cm/80cm多种高度规格。', '材质: 镀锌钢管\n高度: 40/60/80cm\n颜色: 绿白搭配\n安装: 预埋/底盘', '镀锌钢管', '喷涂防锈漆', '-', '-', '2-3m', '0.4-0.8m', 65.00, '米', 0, 0, 0, 1, 17),
(18, 10, '钢格板', 'gangge-ban', 'TD-GG-001', '扁钢与扭绞方钢焊接而成的镂空板材，承重强、排水快、防滑防锈。用于平台踏步、排水沟盖板、车间走道、树池盖板、市政沟盖、停车场排水格栅。', '扁钢厚度: 3-8mm\n网孔: 30x30 / 40x100mm\n材质: Q235扁钢+扭绞方钢\n表面: 热镀锌', 'Q235扁钢+扭绞方钢', '热镀锌', '30x30-40x100mm', '3-8mm', '1m', '定尺', 85.00, '平方米', 0, 0, 0, 1, 18),
(19, 10, '波形护栏', 'boxing-hulan', 'TD-BX-001', '波形梁板为加厚镀锌钢板+喷塑绿色防腐层，带预留螺栓孔拼接固定，搭配绿色钢管立柱与方形法兰底座。车辆失控撞击时波浪钢板形变吸收冲击力，缓冲减速，阻挡车辆冲出路面。', '板厚: 3.0/4.0mm\n板宽: 310/506mm\n立柱: Φ114/Φ140\n表面: 热镀锌+喷塑', 'Q235钢板', '热镀锌+喷塑', '-', '3.0-4.0mm', '310/506mm', '4320mm', 180.00, '套', 1, 0, 0, 1, 19),
(20, 10, '市政道路护栏', 'shizheng-hulan', 'TD-SZ-001', '锌钢市政护栏，主体为镀锌钢管静电喷塑处理，竖杆底部贴蓝色反光条，搭配重型橡胶底座直接摆放路面。带反光标识夜间可视性强，底座配重稳固拆装移动方便，防锈耐晒颜色可定制。', '材质: 镀锌钢管\n高度: 0.6-1.2m\n颜色: 白蓝/白红\n底座: 重型橡胶', '镀锌钢管', '静电喷塑', '-', '-', '2.5-3m', '0.6-1.2m', 120.00, '米', 1, 0, 0, 1, 20),
(21, 10, '可移动伸缩隔离护栏', 'suoshen-hulan', 'TD-SS-001', '玻璃钢绝缘材质，杆身红白相间警示配色，两侧黄色支架带防滑底座，交叉铰接结构可自由拉伸收拢折叠。绝缘不导电，电力场景专用安全款，轻便易搬运，无需预埋安装落地即可使用。', '材质: 玻璃钢\n伸展长度: 2-5m\n高度: 1-1.2m\n颜色: 红白相间', '玻璃钢', '原色', '-', '-', '2-5m', '1-1.2m', 280.00, '套', 0, 0, 1, 1, 21),
(22, 10, '锌钢围墙护栏', 'weiqiang-hulan', 'TD-WQ-001', '组装式锌钢护栏，主材为镀锌方管、扁管，表面高温喷塑防腐。经典蓝白配色，竖杆顶端带防攀爬尖头。镀锌+喷塑双层防腐，风吹日晒不易生锈掉漆，组装式结构施工简单快捷。', '型材: 40x40 / 60x60mm\n竖杆: 19x19mm\n高度: 1.2-2.5m\n表面: 喷塑蓝白', '镀锌方管', '喷塑蓝白', '-', '-', '2.5-3m', '1.2-2.5m', 95.00, '米', 1, 0, 0, 1, 22),
(23, 10, '小草彩钢施工围挡', 'shigong-weizhe', 'TD-SG-001', '主体是彩钢波纹板，搭配镀锌方管边框与立柱，底部贴黄黑警示反光条。小草围挡板面覆仿真绿色草皮美观遮丑，纯色蓝色彩钢围挡成本更低。轻便模块化拼接安装速度快，可重复拆装周转使用。', '高度: 2-2.5m\n宽度: 2-3m/块\n板材: 彩钢波纹板\n框架: 镀锌方管', '彩钢板+镀锌方管', '彩钢/草皮', '-', '-', '2-3m', '2-2.5m', 85.00, '块', 0, 0, 0, 1, 23),
(24, 11, '球场框网', 'qiuchang-wang', 'TD-QC-001', '框架式球场围网，整体为镀锌钢丝焊接网片+方管边框，表面浸塑处理呈绿色，搭配专用圆管立柱。网孔细密结构牢固，阻挡球类飞出场地，高度可定制。浸塑防晒防锈，带方管框架抗篮球足球大力撞击不变形。', '网孔: 50x50mm\n丝径: 2.5-4mm\n高度: 3/4/6m\n立柱: Φ60/Φ75', '低碳钢丝', '浸塑绿色', '50x50mm', '2.5-4mm', '2.5m/片', '3-6m', 55.00, '平方米', 0, 1, 0, 1, 24),

-- 交通设施
(25, 3, '防撞桶', 'fangzhuang-tong', 'TD-FZ-001', '桶身黄色PE塑料一体成型，贴红白高反光方格膜，使用时内部灌满水或沙子增重提升缓冲效果。车辆撞上时桶体变形、内部水沙卸力，大幅降低撞击损伤；夜间红白反光膜高亮醒目，耐晒抗老化。', '直径: 60/90cm\n高度: 80/120cm\n材质: PE塑料\n反光膜: 红白高强级', 'PE塑料', '红白反光膜', '-', '-', '60/90cm', '80/120cm', 85.00, '个', 1, 0, 0, 1, 25),
(26, 3, '路锥', 'lu-zhui', 'TD-LZ-001', '底座为黑色加重橡胶/塑料六边形底座不易倾倒，锥身红白相间高反光膜，可搭配橙色连接警示环串联使用。高反光膜夜间远距离警示，柔性锥身车辆碾压不易碎裂回弹恢复，加重底座防滑配重。', '高度: 30/50/70/90cm\n底座: 六边形加重\n材质: PVC软质\n反光膜: 红白高强级', 'PVC软质', '红白反光膜', '-', '-', '-', '30-90cm', 25.00, '个', 1, 0, 0, 1, 26),
(27, 3, '橡胶减速带', 'jiansu-dai', 'TD-JS-001', '人字纹款减速带，黑黄相间配色起到警示作用，表面人字防滑纹路，自带安装孔搭配膨胀螺丝固定路面。主体为高强度橡胶，韧性好抗压耐磨减震降噪，利用路面凸起迫使车辆减速，减少交通事故。', '长度: 1m/块\n宽度: 30-35cm\n厚度: 3/4/5cm\n材质: 高强度橡胶', '高强度橡胶', '黑黄相间', '-', '-', '30-35cm', '1m/块', 35.00, '米', 0, 0, 0, 1, 27),
(28, 3, '道路施工反光警示牌', 'jingshi-pai', 'TD-JS-002', '板面多为铝板，贴高亮反光膜，夜间车灯照射反光保障夜晚可视，配套金属支架可直接落地摆放拆装方便。用于市政修路、工地封路、小区道路改造等临时交通管制场景，支持尺寸文字图案定制。', '板材: 铝板\n反光膜: 高亮反光\n支架: 金属折叠\n尺寸: 可定制', '铝板', '高亮反光膜', '-', '-', '可定制', '可定制', 45.00, '块', 0, 0, 0, 1, 28),
(29, 3, '黑黄斜纹反光膜', 'fanguang-mo', 'TD-FG-001', '卷材式高亮反光贴膜，经典黑黄相间斜纹配色，自带背胶撕开即贴，车灯照射下强反光。用于水泥墩、护栏、桥墩、防撞桶、路沿粘贴提醒车辆避让障碍物；防水防晒户外长期使用不易褪色起皮。', '宽度: 5-15cm\n颜色: 黑黄斜纹\n背胶: 自带强力背胶\n适用: 金属/水泥/塑料', '反光膜材料', '黑黄斜纹', '-', '-', '5-15cm', '10-50m/卷', 8.00, '米', 0, 0, 0, 1, 29),
(30, 3, '盒装伸缩警戒带', 'jingjie-tai', 'TD-JJ-001', '便携盒装卷盘款，黄白相间警示布带印有"安全带、警戒线"字样，收纳在塑料卷盘内可自由拉伸回收。加厚PE/涤纶材质韧性强不易扯断耐磨防水可重复使用。用于道路施工、道路抢修临时隔离。', '带宽: 5cm\n材质: PE/涤纶\n颜色: 黄白/红白/黄黑\n收纳: 卷盘盒装', 'PE/涤纶', '黄白相间', '-', '-', '5cm', '可定制', 15.00, '套', 0, 0, 1, 1, 30);

-- ============================================================
-- 8. 密保问题表 security_questions
-- ============================================================
CREATE TABLE IF NOT EXISTS security_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(200) NOT NULL COMMENT '密保问题',
  sort_order INT DEFAULT 0 COMMENT '排序',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='密保问题表';

-- ============================================================
-- 9. 用户密保答案表 user_security_answers
-- ============================================================
CREATE TABLE IF NOT EXISTS user_security_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '用户ID',
  question_id INT NOT NULL COMMENT '问题ID',
  answer VARCHAR(500) NOT NULL COMMENT '答案',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_question (user_id, question_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户密保答案表';

-- ============================================================
-- 10. 管理员密保答案表 admin_security_answers
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_security_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL COMMENT '管理员ID',
  question_id INT NOT NULL COMMENT '问题ID',
  answer VARCHAR(500) NOT NULL COMMENT '答案',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_admin_question (admin_id, question_id),
  INDEX idx_admin (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员密保答案表';

-- ============================================================
-- 11. 密码安全配置表 password_policies
-- ============================================================
CREATE TABLE IF NOT EXISTS password_policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  policy_type VARCHAR(50) NOT NULL COMMENT '策略类型: user-用户端, admin-管理员端',
  min_length INT DEFAULT 8 COMMENT '最小长度',
  require_uppercase TINYINT(1) DEFAULT 1 COMMENT '需要大写字母',
  require_lowercase TINYINT(1) DEFAULT 1 COMMENT '需要小写字母',
  require_digits TINYINT(1) DEFAULT 1 COMMENT '需要数字',
  require_special_chars TINYINT(1) DEFAULT 1 COMMENT '需要特殊字符',
  special_chars VARCHAR(50) DEFAULT '!@#$%^&*()_+-=[]{}|;:,.<>?' COMMENT '允许的特殊字符',
  max_age_days INT DEFAULT 90 COMMENT '密码最长有效期(天)',
  history_count INT DEFAULT 5 COMMENT '历史密码保留个数',
  max_attempts INT DEFAULT 5 COMMENT '最大尝试次数',
  lockout_minutes INT DEFAULT 30 COMMENT '锁定时间(分钟)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_policy_type (policy_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='密码安全策略配置表';

-- ============================================================
-- 12. 用户表添加安全字段
-- ============================================================
ALTER TABLE users 
ADD COLUMN email VARCHAR(100) NULL COMMENT '邮箱' AFTER phone_or_email,
ADD COLUMN last_password_change TIMESTAMP NULL COMMENT '最后密码修改时间' AFTER email,
ADD COLUMN failed_attempts INT DEFAULT 0 COMMENT '连续失败次数' AFTER last_password_change,
ADD COLUMN locked_until TIMESTAMP NULL COMMENT '锁定直到时间' AFTER failed_attempts,
ADD INDEX idx_email (email);

-- ============================================================
-- 13. 管理员表添加安全字段
-- ============================================================
ALTER TABLE admin_users 
ADD COLUMN last_password_change TIMESTAMP NULL COMMENT '最后密码修改时间' AFTER username,
ADD COLUMN failed_attempts INT DEFAULT 0 COMMENT '连续失败次数' AFTER last_password_change,
ADD COLUMN locked_until TIMESTAMP NULL COMMENT '锁定直到时间' AFTER failed_attempts;

-- ============================================================
-- 14. 密码历史记录表 password_history
-- ============================================================
CREATE TABLE IF NOT EXISTS password_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_type VARCHAR(20) NOT NULL COMMENT '用户类型: user, admin',
  user_id INT NOT NULL COMMENT '用户ID',
  password_hash VARCHAR(255) NOT NULL COMMENT '历史密码哈希',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_type, user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='密码历史记录表';

-- ============================================================
-- 初始密保问题配置
-- ============================================================
INSERT IGNORE INTO security_questions (id, question, sort_order, is_active) VALUES
(1, '您的出生城市是？', 1, 1),
(2, '您的小学名字是什么？', 2, 1),
(3, '您的第一位老师叫什么？', 3, 1),
(4, '您的第一份工作的公司名称是什么？', 4, 1),
(5, '您的身份证号码后六位是什么？', 5, 1),
(6, '您的出生日期是哪一天？（YYYY-MM-DD）', 6, 1);

-- ============================================================
-- 初始密码策略配置
-- ============================================================
INSERT IGNORE INTO password_policies (policy_type, min_length, require_uppercase, require_lowercase, require_digits, require_special_chars, special_chars, max_age_days, history_count, max_attempts, lockout_minutes) VALUES
('user', 8, 1, 1, 1, 1, '!@#$%^&*()_+-=[]{}|;:,.<>?', 90, 5, 5, 30),
('admin', 12, 1, 1, 1, 1, '!@#$%^&*()_+-=[]{}|;:,.<>?', 60, 10, 3, 60);