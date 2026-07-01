import dotenv from 'dotenv';
// override:true 强制让 .env 覆盖已存在的同名环境变量，避免系统环境变量干扰
dotenv.config({ override: true });

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import chatRoutes from './routes/chat.js';
import knowledgeRoutes from './routes/knowledge.js';
import contactRoutes from './routes/contact.js';
import uploadRoutes from './routes/upload.js';
import passwordResetRoutes from './routes/passwordReset.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', passwordResetRoutes); // 密码找回路由（用户端 + 管理员端，路径已自带 /auth 或 /admin 前缀）
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'OK', data: { status: 'running', timestamp: new Date().toISOString() } });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: err.message || '服务器内部错误',
    data: null,
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在', data: null });
});

app.listen(PORT, () => {
  console.log(`通达丝网官网后端服务已启动: http://localhost:${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV}`);
});