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

// GET /users - 获取用户列表（支持关键词搜索）
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;
    const keyword = req.query.keyword;

    let where = '1=1';
    const params = [];

    if (keyword) {
      where = '(phone_or_email LIKE ? OR nickname LIKE ? OR company LIKE ?)';
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    const [rows] = await pool.query(`SELECT COUNT(*) as total FROM users WHERE ${where}`, params);
    const total = rows[0].total;

    const [users] = await pool.query(
      `SELECT id, phone_or_email, nickname, avatar, company, is_active, last_login_at, created_at FROM users WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
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

// ============================================================
// 仪表盘统计
// ============================================================

// GET /stats - 仪表盘统计数据
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const [rows1] = await pool.query('SELECT COUNT(*) as cnt FROM users');
    const [rows2] = await pool.query('SELECT COUNT(*) as cnt FROM products WHERE is_active = 1');
    const [rows3] = await pool.query('SELECT COUNT(*) as cnt FROM conversations');
    const [rows4] = await pool.query('SELECT COUNT(*) as cnt FROM messages');
    const [rows5] = await pool.query('SELECT COUNT(*) as cnt FROM contact_forms WHERE is_read = 0');
    const [rows6] = await pool.query('SELECT COUNT(*) as cnt FROM messages WHERE DATE(created_at) = CURDATE()');
    const [rows7] = await pool.query('SELECT COUNT(*) as cnt FROM users WHERE DATE(created_at) = CURDATE()');

    const data = {
      userCount: rows1[0].cnt,
      productCount: rows2[0].cnt,
      conversationCount: rows3[0].cnt,
      messageCount: rows4[0].cnt,
      contactCount: rows5[0].cnt,
      todayMessages: rows6[0].cnt,
      todayUsers: rows7[0].cnt,
    };

    res.json({ code: 0, message: '获取成功', data });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({ code: 500, message: '获取统计数据失败', data: null });
  }
});

// ============================================================
// 用户管理 - 增强 CRUD
// ============================================================

// GET /users/search - 搜索用户（支持关键词）
router.get('/users/search', adminMiddleware, async (req, res) => {
  try {
    const { keyword, page = 1, pageSize = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    let where = '1=1';
    const params = [];

    if (keyword) {
      where = '(phone_or_email LIKE ? OR nickname LIKE ? OR company LIKE ?)';
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM users WHERE ${where}`, params);

    const [users] = await pool.query(
      `SELECT id, phone_or_email, nickname, avatar, company, is_active, last_login_at, created_at, updated_at FROM users WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), offset]
    );

    res.json({ code: 0, message: '获取成功', data: { list: users, pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total, totalPages: Math.ceil(total / parseInt(pageSize)) } } });
  } catch (error) {
    console.error('搜索用户失败:', error);
    res.status(500).json({ code: 500, message: '搜索用户失败', data: null });
  }
});

// GET /users/:id - 获取单个用户详情（含密保问题、会话统计等）
router.get('/users/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [[user]] = await pool.query(
      'SELECT id, phone_or_email, nickname, avatar, company, is_active, last_login_at, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    // 获取用户的密保问题
    const [securityAnswers] = await pool.query(
      `SELECT usa.id, sq.question, usa.created_at FROM user_security_answers usa JOIN security_questions sq ON usa.question_id = sq.id WHERE usa.user_id = ? AND usa.is_active = 1`,
      [id]
    );

    // 获取用户的会话统计
    const [[{ conversationCount }]] = await pool.query('SELECT COUNT(*) as conversationCount FROM conversations WHERE user_id = ?', [id]);
    const [[{ messageCount }]] = await pool.query(
      `SELECT COUNT(*) as messageCount FROM messages m JOIN conversations c ON m.conversation_id = c.id WHERE c.user_id = ?`, [id]
    );

    res.json({
      code: 0, message: '获取成功',
      data: {
        ...user,
        securityAnswers,
        stats: { conversationCount, messageCount },
      },
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({ code: 500, message: '获取用户详情失败', data: null });
  }
});

// GET /users/:id/conversations - 获取某用户的所有会话
router.get('/users/:id/conversations', adminMiddleware, async (req, res) => {
  try {
    const [conversations] = await pool.query(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
      [req.params.id]
    );
    res.json({ code: 0, message: '获取成功', data: { list: conversations } });
  } catch (error) {
    console.error('获取用户会话失败:', error);
    res.status(500).json({ code: 500, message: '获取用户会话失败', data: null });
  }
});

// PUT /users/:id - 编辑用户信息
router.put('/users/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, phoneOrEmail, company, isActive } = req.body;

    const updates = [];
    const values = [];

    if (nickname !== undefined) { updates.push('nickname = ?'); values.push(nickname); }
    if (phoneOrEmail !== undefined) { updates.push('phone_or_email = ?'); values.push(phoneOrEmail); }
    if (company !== undefined) { updates.push('company = ?'); values.push(company); }
    if (isActive !== undefined) { updates.push('is_active = ?'); values.push(isActive ? 1 : 0); }

    if (updates.length === 0) {
      return res.status(400).json({ code: 400, message: '没有需要更新的字段', data: null });
    }

    values.push(id);
    const [result] = await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    res.json({ code: 0, message: '用户信息更新成功', data: null });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ code: 500, message: '更新用户信息失败', data: null });
  }
});

// POST /users - 管理员手动创建用户
router.post('/users', adminMiddleware, async (req, res) => {
  try {
    const { phoneOrEmail, password, nickname, company } = req.body;

    if (!phoneOrEmail || !password) {
      return res.status(400).json({ code: 400, message: '手机号/邮箱和密码不能为空', data: null });
    }

    // 检查是否已存在
    const [[existing]] = await pool.query('SELECT id FROM users WHERE phone_or_email = ?', [phoneOrEmail]);
    if (existing) {
      return res.status(400).json({ code: 400, message: '该手机号/邮箱已被注册', data: null });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (phone_or_email, password_hash, nickname, company) VALUES (?, ?, ?, ?)',
      [phoneOrEmail, passwordHash, nickname || null, company || null]
    );

    res.json({ code: 0, message: '用户创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({ code: 500, message: '创建用户失败', data: null });
  }
});

// DELETE /users/:id - 删除用户（级联删除密保答案、会话和消息）
router.delete('/users/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // 检查用户是否存在
    const [[user]] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    // 删除密保答案
    await pool.query('DELETE FROM user_security_answers WHERE user_id = ?', [id]);

    // 删除该用户的会话（级联删除消息）
    const [convs] = await pool.query('SELECT id FROM conversations WHERE user_id = ?', [id]);
    for (const conv of convs) {
      await pool.query('DELETE FROM messages WHERE conversation_id = ?', [conv.id]);
    }
    await pool.query('DELETE FROM conversations WHERE user_id = ?', [id]);

    // 删除用户
    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    res.json({ code: 0, message: '用户删除成功', data: null });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ code: 500, message: '删除用户失败', data: null });
  }
});

// ============================================================
// 会话管理 - 增强操作
// ============================================================

// DELETE /conversations/:id - 删除会话及其所有消息
router.delete('/conversations/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [[conv]] = await pool.query('SELECT id FROM conversations WHERE id = ?', [id]);
    if (!conv) {
      return res.status(404).json({ code: 404, message: '会话不存在', data: null });
    }

    await pool.query('DELETE FROM messages WHERE conversation_id = ?', [id]);
    await pool.query('DELETE FROM conversations WHERE id = ?', [id]);

    res.json({ code: 0, message: '会话删除成功', data: null });
  } catch (error) {
    console.error('删除会话失败:', error);
    res.status(500).json({ code: 500, message: '删除会话失败', data: null });
  }
});

// ============================================================
// 消息管理 - 增强操作
// ============================================================

// DELETE /messages/:id - 删除单条消息
router.delete('/messages/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [[msg]] = await pool.query('SELECT id FROM messages WHERE id = ?', [id]);
    if (!msg) {
      return res.status(404).json({ code: 404, message: '消息不存在', data: null });
    }

    await pool.query('DELETE FROM messages WHERE id = ?', [id]);

    res.json({ code: 0, message: '消息删除成功', data: null });
  } catch (error) {
    console.error('删除消息失败:', error);
    res.status(500).json({ code: 500, message: '删除消息失败', data: null });
  }
});

// ============================================================
// 联系表单管理
// ============================================================

// GET /contact-forms - 获取联系表单列表
router.get('/contact-forms', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;
    const isRead = req.query.isRead;

    let where = '1=1';
    const params = [];
    if (isRead !== undefined) { where += ' AND is_read = ?'; params.push(parseInt(isRead)); }

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM contact_forms WHERE ${where}`, params);
    const [forms] = await pool.query(
      `SELECT * FROM contact_forms WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    res.json({ code: 0, message: '获取成功', data: { list: forms, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } } });
  } catch (error) {
    console.error('获取联系表单失败:', error);
    res.status(500).json({ code: 500, message: '获取联系表单失败', data: null });
  }
});

// PUT /contact-forms/:id/read - 标记/取消已读
router.put('/contact-forms/:id/read', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    const [result] = await pool.query('UPDATE contact_forms SET is_read = ? WHERE id = ?', [isRead ? 1 : 0, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '留言不存在', data: null });
    }

    res.json({ code: 0, message: isRead ? '已标记为已读' : '已标记为未读', data: null });
  } catch (error) {
    console.error('更新留言状态失败:', error);
    res.status(500).json({ code: 500, message: '更新留言状态失败', data: null });
  }
});

// DELETE /contact-forms/:id - 删除留言
router.delete('/contact-forms/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM contact_forms WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '留言不存在', data: null });
    }
    res.json({ code: 0, message: '留言删除成功', data: null });
  } catch (error) {
    console.error('删除留言失败:', error);
    res.status(500).json({ code: 500, message: '删除留言失败', data: null });
  }
});

// GET /conversations/:id/user - 获取某会话关联的用户信息
router.get('/conversations/:id/user', adminMiddleware, async (req, res) => {
  try {
    const [[conv]] = await pool.query('SELECT user_id, visitor_id FROM conversations WHERE id = ?', [req.params.id]);
    if (!conv) {
      return res.status(404).json({ code: 404, message: '会话不存在', data: null });
    }

    let user = null;
    if (conv.user_id) {
      const [[u]] = await pool.query('SELECT id, phone_or_email, nickname, company, created_at FROM users WHERE id = ?', [conv.user_id]);
      user = u || null;
    }

    res.json({ code: 0, message: '获取成功', data: { user, visitorId: conv.visitor_id } });
  } catch (error) {
    console.error('获取会话用户失败:', error);
    res.status(500).json({ code: 500, message: '获取会话用户失败', data: null });
  }
});

export default router;