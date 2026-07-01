import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { adminMiddleware } from '../middleware/auth.js';

const router = Router();

// POST /login - 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空', data: null });
    }

    const [admins] = await pool.query(
      'SELECT id, username, password_hash, nickname, role, is_active FROM admin_users WHERE username = ?',
      [username]
    );

    if (admins.length === 0) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误', data: null });
    }

    const admin = admins[0];

    if (!admin.is_active) {
      return res.status(403).json({ code: 403, message: '账号已被禁用', data: null });
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return res.status(400).json({ code: 400, message: '用户名或密码错误', data: null });
    }

    // 更新最后登录时间
    await pool.query('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?', [admin.id]);

    const token = jwt.sign(
      { id: admin.id, type: 'admin', role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          nickname: admin.nickname,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    console.error('管理员登录失败:', error);
    res.status(500).json({ code: 500, message: '登录失败', data: null });
  }
});

// GET /users - 获取用户列表（管理员）
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    const [users] = await pool.query(
      'SELECT id, phone_or_email, nickname, avatar, company, is_active, last_login_at, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );

    res.json({
      code: 0,
      message: '获取成功',
      data: {
        list: users,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ code: 500, message: '获取用户列表失败', data: null });
  }
});

// PUT /users/:id/status - 封禁/解封用户
router.put('/users/:id/status', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ code: 400, message: 'isActive 参数不能为空', data: null });
    }

    const [result] = await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    res.json({ code: 0, message: isActive ? '用户已解封' : '用户已封禁', data: null });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.status(500).json({ code: 500, message: '更新用户状态失败', data: null });
  }
});

// GET /conversations - 管理员获取所有会话
router.get('/conversations', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const offset = (page - 1) * pageSize;
    const status = req.query.status;

    let where = '1=1';
    const params = [];
    if (status) { where += ' AND status = ?'; params.push(status); }

    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM conversations WHERE ${where}`, params);
    const total = countResult[0].total;

    const [conversations] = await pool.query(
      `SELECT * FROM conversations WHERE ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({
      code: 0,
      message: '获取成功',
      data: { list: conversations, total, page, pageSize },
    });
  } catch (error) {
    console.error('获取会话列表失败:', error);
    res.status(500).json({ code: 500, message: '获取会话列表失败', data: null });
  }
});

// GET /conversations/:id/messages - 管理员查看某会话的所有消息
router.get('/conversations/:id/messages', adminMiddleware, async (req, res) => {
  try {
    const [messages] = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json({ code: 0, message: '获取成功', data: messages });
  } catch (error) {
    console.error('获取消息失败:', error);
    res.status(500).json({ code: 500, message: '获取消息失败', data: null });
  }
});

// POST /conversations/:id/takeover - 接管会话
router.post('/conversations/:id/takeover', adminMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE conversations SET status = 'active', unread_count = 0, updated_at = NOW() WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '会话不存在', data: null });
    res.json({ code: 0, message: '已接管会话', data: null });
  } catch (error) {
    console.error('接管会话失败:', error);
    res.status(500).json({ code: 500, message: '接管会话失败', data: null });
  }
});

// POST /conversations/:id/message - 人工回复
router.post('/conversations/:id/message', adminMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ code: 400, message: '消息内容不能为空', data: null });

    const [result] = await pool.query(
      "INSERT INTO messages (conversation_id, role, content) VALUES (?, 'assistant', ?)",
      [req.params.id, content]
    );
    await pool.query('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [req.params.id]);

    res.json({ code: 0, message: '发送成功', data: { id: result.insertId, content } });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({ code: 500, message: '发送消息失败', data: null });
  }
});

// PUT /conversations/:id/status - 更新会话状态
router.put('/conversations/:id/status', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'pending', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ code: 400, message: '无效的会话状态', data: null });
    }
    const [result] = await pool.query('UPDATE conversations SET status = ?, updated_at = NOW() WHERE id = ?', [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ code: 404, message: '会话不存在', data: null });
    res.json({ code: 0, message: '状态已更新', data: null });
  } catch (error) {
    console.error('更新会话状态失败:', error);
    res.status(500).json({ code: 500, message: '更新失败', data: null });
  }
});

// GET /messages - 获取所有消息（消息记录页用）
router.get('/messages', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 100;
    const offset = (page - 1) * pageSize;

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM messages');
    const total = countResult[0].total;

    const [messages] = await pool.query(
      `SELECT m.*, c.visitor_id FROM messages m LEFT JOIN conversations c ON m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    res.json({ code: 0, message: '获取成功', data: { list: messages, total, page, pageSize } });
  } catch (error) {
    console.error('获取消息记录失败:', error);
    res.status(500).json({ code: 500, message: '获取消息记录失败', data: null });
  }
});

// GET /messages/export - 导出消息记录为 CSV
router.get('/messages/export', adminMiddleware, async (req, res) => {
  try {
    const [messages] = await pool.query(
      `SELECT m.id, m.conversation_id, m.role, m.content, m.created_at, c.visitor_id FROM messages m LEFT JOIN conversations c ON m.conversation_id = c.id ORDER BY m.created_at ASC`
    );
    const csvRows = ['ID,会话ID,访客ID,发送者,内容,时间'];
    for (const m of messages) {
      const content = (m.content || '').replace(/"/g, '""');
      csvRows.push(`${m.id},${m.conversation_id},"${m.visitor_id || ''}","${m.role}","${content}","${m.created_at}"`);
    }
    const csv = '\ufeff' + csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=messages_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('导出失败:', error);
    res.status(500).json({ code: 500, message: '导出失败', data: null });
  }
});

export default router;