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
-- 初始数据：产品（至少10个）
-- ============================================================

INSERT IGNORE INTO products (id, category_id, name, slug, model, description, specification, material, surface_treatment, mesh_size, wire_diameter, width, length, price, unit, is_featured, is_hot, is_new, is_active, sort_order) VALUES
-- 不锈钢网产品
(1, 4, '304不锈钢编织网', '304-stainless-woven-mesh', 'TD-SS-001', '采用优质304不锈钢丝编织而成，网面平整、网孔均匀，具有优异的耐腐蚀性能和抗氧化性能。广泛应用于化工过滤、食品加工、医药筛选等领域。', '网孔: 0.5mm-50mm\n丝径: 0.1mm-3.0mm\n编织方式: 平纹/斜纹\n耐温: ≤800°C', '304不锈钢', '电解抛光', '0.5-50mm', '0.1-3.0mm', '1m/1.2m/1.5m', '30m/卷', 85.00, '平方米', 1, 1, 0, 1, 1),
(2, 4, '316L不锈钢过滤网', '316l-stainless-filter-mesh', 'TD-SS-002', '316L不锈钢材质，含钼元素，耐酸碱腐蚀性能更优。适用于海水淡化、制药工业、化工过滤等高要求场合。', '网孔: 0.02mm-10mm\n丝径: 0.02mm-1.0mm\n编织方式: 平纹/斜纹/荷兰编织\n耐温: ≤900°C', '316L不锈钢', '电解抛光', '0.02-10mm', '0.02-1.0mm', '1m/1.2m', '30m/卷', 120.00, '平方米', 1, 0, 0, 1, 2),

-- 电焊网产品
(3, 5, '热镀锌电焊网', 'hot-dip-galvanized-welded-mesh', 'TD-WW-001', '采用优质低碳钢丝焊接后热镀锌处理，锌层均匀、附着力强，防腐性能优异。广泛用于建筑墙体、养殖围栏、园林防护等。', '网孔: 12.7mm-100mm\n丝径: 0.5mm-3.5mm\n镀锌量: ≥260g/㎡\n片宽: 0.5m-2.0m', '低碳钢丝', '热镀锌', '12.7-100mm', '0.5-3.5mm', '0.5-2.0m', '定尺/卷', 25.00, '平方米', 0, 1, 0, 1, 3),
(4, 5, 'PVC涂塑电焊网', 'pvc-coated-welded-mesh', 'TD-WW-002', '在电焊网表面涂覆PVC塑料层，色彩丰富、美观大方，兼具防腐和装饰功能。适用于园林绿化、别墅围栏、阳台防护等。', '网孔: 25mm-75mm\n丝径: 1.0mm-2.5mm\nPVC厚度: 0.5mm-1.0mm\n颜色: 绿/白/黑/蓝', '低碳钢丝', 'PVC涂塑', '25-75mm', '1.0-2.5mm', '0.9-1.8m', '定尺/卷', 35.00, '平方米', 0, 0, 1, 1, 4),

-- 轧花网产品
(5, 6, '重型矿山筛分网', 'heavy-duty-mining-screen', 'TD-CW-001', '采用高碳钢丝经轧花编织而成，网孔坚固不易变形，耐磨性能极佳。专门用于矿山振动筛、石料分级、冶金筛选等重型工况。', '网孔: 5mm-100mm\n丝径: 1.0mm-12mm\n编织方式: 预弯/双向弯曲\n硬度: HRC45-55', '高碳钢丝/65Mn', '发黑/磷化', '5-100mm', '1.0-12mm', '1.0-2.5m', '定尺', 55.00, '平方米', 0, 0, 0, 1, 5),

-- 钢板网产品
(6, 7, '菱形钢板拉伸网', 'diamond-expanded-metal', 'TD-EM-001', '以优质钢板经冲剪拉伸成型，网身轻便、强度高、通风透光性好。适用于建筑平台踏板、吊顶装饰、设备防护罩等。', '板厚: 1.0mm-6.0mm\n网孔: 25x50mm-100x200mm\n梗宽: 2mm-10mm\n材质: Q235/镀锌板', 'Q235/镀锌板', '喷漆/热镀锌', '25x50-100x200mm', '板厚1.0-6.0mm', '1.0-2.0m', '2.0-4.0m', 45.00, '平方米', 0, 0, 0, 1, 6),

-- 冲孔网产品
(7, 8, '圆孔冲孔板网', 'round-hole-perforated-mesh', 'TD-PM-001', '在金属板材上冲制圆孔而成，孔型排列整齐美观。适用于隔音降噪、空气过滤、装饰幕墙、防护罩等。', '板厚: 0.5mm-5.0mm\n孔径: 2mm-50mm\n排列方式: 60°/45°/直排\n材质: 不锈钢/铝板/镀锌板', '不锈钢/铝板/镀锌板', '原色/喷塑', '2-50mm(孔径)', '板厚0.5-5.0mm', '1.0-1.5m', '2.0-3.0m', 65.00, '平方米', 0, 0, 0, 1, 7),

-- 护栏产品
(8, 10, '高速公路波形护栏', 'highway-wave-guardrail', 'TD-HW-001', '符合国家标准GB/T31439的波形梁钢护栏，由波形梁板、立柱、防阻块等组成。具有优良的吸能性能和导向性能，有效保护行车安全。', '板厚: 3.0mm/4.0mm\n板宽: 310mm/506mm\n立柱: Φ114/Φ140\n高度: 600mm-900mm', 'Q235钢', '热镀锌/喷塑', '-', '板厚3.0-4.0mm', '310/506mm', '4320mm', 180.00, '套', 1, 0, 0, 1, 8),

-- 围栏产品
(9, 11, '篮球场围栏网', 'basketball-court-fence', 'TD-SF-001', '专为体育场地设计，采用高强度低碳钢丝焊接成型，外覆PVC涂层。网孔均匀、弹性好、抗冲击能力强，满足体育竞技安全要求。', '网孔: 50x50mm\n丝径: 2.5mm-4.0mm\n高度: 2m-4m\n立柱: Φ60/Φ75', '低碳钢丝', 'PVC涂塑/热镀锌', '50x50mm', '2.5-4.0mm', '2.5m/片', '2-4m(高)', 38.00, '平方米', 0, 1, 0, 1, 9),

-- 声屏障
(10, 14, '高速公路声屏障', 'highway-sound-barrier', 'TD-SB-001', '采用金属微孔吸声板与隔声板组合结构，吸声隔音效果显著。适用于高速公路、铁路、城市高架等交通噪声治理工程。', '面板厚度: 0.8mm-1.2mm\n整体厚度: 80mm-120mm\n降噪系数: NRC≥0.75\n隔声量: ≥30dB', '铝板/镀锌板/PC板', '喷塑/氟碳', '-', '面板0.8-1.2mm', '500mm', '2000-3000mm', 260.00, '平方米', 1, 0, 0, 1, 10),

-- 石笼网
(11, 9, '镀锌石笼网箱', 'galvanized-gabion-box', 'TD-HW-002', '采用高镀锌量低碳钢丝经六角编织而成，网箱结构稳固、透水性好。广泛用于河道治理、边坡防护、生态护岸等水利工程。', '网孔: 60x80mm-100x120mm\n丝径: 2.0mm-4.0mm\n镀锌量: ≥260g/㎡\n箱体尺寸: 可定制', '低碳钢丝', '热镀锌/高尔凡', '60x80-100x120mm', '2.0-4.0mm', '1.0-2.0m', '2.0-4.0m', 32.00, '平方米', 0, 1, 0, 1, 11),

-- 防眩网
(12, 16, '高速公路防眩网', 'highway-anti-glare-mesh', 'TD-AG-001', '安装在高速公路中央分隔带，有效阻挡对向车灯眩光，保障夜间行车安全。网片通风性好，兼具隔离和防眩双重功能。', '网孔: 30x50mm\n丝径: 2.0mm-3.0mm\n高度: 800mm-1200mm\n颜色: 绿色/灰色', '低碳钢丝', 'PVC涂塑/热镀锌', '30x50mm', '2.0-3.0mm', '2.0m/片', '800-1200mm', 55.00, '平方米', 0, 0, 0, 1, 12);