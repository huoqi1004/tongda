# 通达丝网公司官网 — 阿里云部署指南

> 适用环境：阿里云 ECS（CentOS 7 / Alibaba Cloud Linux / Ubuntu）
> 版本：v1.0.1

---

## 一、服务器基础环境

### 1.1 SSH 登录服务器

```bash
ssh root@你的服务器公网IP
```

### 1.2 安装 Node.js（推荐 v20 LTS）

```bash
# 使用 NodeSource 源（CentOS/RHEL）
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# Ubuntu/Debian
# curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
# apt-get install -y nodejs

node -v   # 确认输出 v20.x.x
npm -v    # 确认 npm 可用
```

### 1.3 安装 PM2（进程守护）

```bash
npm install -g pm2
```

### 1.4 安装 Nginx

```bash
# CentOS / Alibaba Cloud Linux
yum install -y nginx

# Ubuntu
# apt-get install -y nginx

systemctl enable nginx
systemctl start nginx
```

### 1.5 安装 MySQL 8.0

```bash
# CentOS 7 / Alibaba Cloud Linux
yum install -y mysql-server   # 或 yum install -y mysql-community-server
systemctl enable mysqld
systemctl start mysqld

# 获取临时密码（首次安装时）
grep 'temporary password' /var/log/mysqld.log

# 修改 root 密码（用上面获取的临时密码登录）
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY '你的强密码';
FLUSH PRIVILEGES;
```

### 1.6 安装 Git

```bash
yum install -y git   # CentOS
# apt-get install -y git   # Ubuntu
```

---

## 二、拉取代码

```bash
cd /opt
git clone https://github.com/huoqi1004/tongda.git tongda-website
cd tongda-website
git checkout master
```

---

## 三、数据库初始化

### 3.1 登录 MySQL 创建数据库和用户

```sql
mysql -u root -p
```

```sql
CREATE DATABASE tongda_silk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tongda'@'localhost' IDENTIFIED BY 'Tongda@2024!';
GRANT ALL PRIVILEGES ON tongda_silk.* TO 'tongda'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.2 执行建表脚本

```bash
cd /opt/tongda-website/backend
node src/db/init.js
```

> 初始化后会创建所有表并插入默认管理员账号：`admin` / `admin123456`

---

## 四、配置环境变量

```bash
cd /opt/tongda-website/backend
cp .env.example .env
vi .env   # 或 nano .env
```

**必须修改的配置项：**

```env
PORT=3001
NODE_ENV=production
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=tongda
DB_PASSWORD=Tongda@2024!        # 上面创建的数据库密码
DB_NAME=tongda_silk
JWT_SECRET=换一个32位以上的随机字符串
JWT_EXPIRES_IN=7d
DEEPSEEK_API_KEY=你的DeepSeek_API_Key    # AI客服必需
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_CHAT_MODEL=deepseek-v4-flash
DEEPSEEK_EMBED_MODEL=deepseek-embed
RAG_TOP_K=5
RAG_CHUNK_SIZE=500
RAG_CHUNK_OVERLAP=50
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

> ⚠️ `JWT_SECRET` 务必更换为随机长字符串（可用 `openssl rand -hex 32` 生成）
> ⚠️ `DEEPSEEK_API_KEY` 是 AI 客服的核心，不配置则 AI 回复功能不可用

---

## 五、安装依赖 & 构建前端

### 5.1 后端依赖

```bash
cd /opt/tongda-website/backend
npm install
```

### 5.2 前端依赖 & 构建

```bash
cd /opt/tongda-website/frontend
npm install
npm run build
```

> 构建产物在 `frontend/dist/` 目录

---

## 六、配置 Nginx

### 6.1 编写 Nginx 配置

```bash
vi /etc/nginx/conf.d/tongda.conf
```

```nginx
server {
    listen 80;
    server_name 你的域名或服务器IP;

    # 前端静态文件
    root /opt/tongda-website/frontend/dist;
    index index.html;

    # 上传文件
    location /uploads/ {
        alias /opt/tongda-website/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API 反向代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;  # AI回复可能较慢
    }

    # 前端路由（React SPA）
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 6.2 测试并重载 Nginx

```bash
nginx -t                  # 测试配置
systemctl reload nginx    # 重载
```

---

## 七、启动后端（PM2 进程守护）

### 7.1 创建 PM2 配置文件

```bash
vi /opt/tongda-website/backend/ecosystem.config.cjs
```

```js
module.exports = {
  apps: [{
    name: 'tongda-backend',
    script: 'src/server.js',
    cwd: '/opt/tongda-website/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '500M',
    restart_delay: 3000,
  }],
};
```

### 7.2 启动

```bash
cd /opt/tongda-website/backend
pm2 start ecosystem.config.cjs
pm2 save               # 保存进程列表，重启自动恢复
pm2 startup            # 设置开机自启动（按终端提示执行输出命令）
```

### 7.3 常用管理命令

```bash
pm2 status             # 查看状态
pm2 logs tongda-backend     # 查看实时日志
pm2 restart tongda-backend  # 重启
pm2 stop tongda-backend     # 停止
pm2 reload all          # 平滑重启
```

---

## 八、阿里云安全组配置

进入阿里云控制台 → ECS → 安全组 → 配置规则 → 添加入方向规则：

| 端口 | 协议 | 来源 | 说明 |
|------|------|------|------|
| 80 | TCP | 0.0.0.0/0 | HTTP 网站访问 |
| 443 | TCP | 0.0.0.0/0 | HTTPS（配置SSL后） |
| 22 | TCP | 你的IP/32 | SSH 管理 |

---

## 九、验证部署

```bash
# 1. 检查 Node 进程
pm2 status

# 2. 检查后端 API
curl http://127.0.0.1:3001/api/health

# 3. 检查 Nginx 静态资源
curl -I http://你的服务器IP/

# 4. 用浏览器访问
# http://你的服务器IP
```

应能正常打开网站首页，登录管理员面板、AI 客服等功能均可使用。

---

## 十、更新部署（后续版本升级）

```bash
cd /opt/tongda-website
git pull origin master

# 后端
cd backend
npm install
pm2 restart tongda-backend

# 前端
cd ../frontend
npm install
npm run build

# 无需重启 Nginx（静态文件替换即生效）
```

---

## 重要提示

1. **数据库密码**：请使用强密码，不要用示例中的简单密码
2. **JWT_SECRET**：务必更换，泄露会导致任意用户身份伪造
3. **DeepSeek API Key**：去 [platform.deepseek.com](https://platform.deepseek.com) 注册获取
4. **HTTPS**：生产环境建议申请免费 SSL 证书（Let's Encrypt + Certbot 或阿里云免费证书）
5. **备份**：定期备份 `backend/uploads/` 和 MySQL 数据库
