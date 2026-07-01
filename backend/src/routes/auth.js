import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// POST /register - 用户注册
router.post('/register', async (req, res) => {
  try {
    const { phoneOrEmail, password, nickname } = req.body;

    if (!phoneOrEmail || !password) {
      return res.status(400).json({ code: 400, message: '手机号/邮箱和密码不能为空', data: null });
    }

    // 检查是否已注册
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE phone_or_email = ?',
      [phoneOrEmail]
    );
    if (existing.length > 0) {
      return res.status(400).json({ code: 400, message: '该手机号或邮箱已注册', data: null });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (phone_or_email, password_hash, nickname) VALUES (?, ?, ?)',
      [phoneOrEmail, passwordHash, nickname || null]
    );

    const token = jwt.sign(
      { id: result.insertId, type: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      code: 0,
      message: '注册成功',
      data: {
        token,
        user: {
          id: result.insertId,
          phoneOrEmail,
          nickname: nickname || null,
        },
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ code: 500, message: '注册失败', data: null });
  }
});

// POST /login - 用户登录
router.post('/login', async (req, res) => {
  try {
    const { phoneOrEmail, password } = req.body;

    if (!phoneOrEmail || !password) {
      return res.status(400).json({ code: 400, message: '手机号/邮箱和密码不能为空', data: null });
    }

    const [users] = await pool.query(
      'SELECT id, phone_or_email, password_hash, nickname, avatar, company, is_active FROM users WHERE phone_or_email = ?',
      [phoneOrEmail]
    );

    if (users.length === 0) {
      return res.status(400).json({ code: 400, message: '账号或密码错误', data: null });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({ code: 403, message: '账号已被禁用，请联系管理员', data: null });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ code: 400, message: '账号或密码错误', data: null });
    }

    // 更新最后登录时间
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, type: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          phoneOrEmail: user.phone_or_email,
          nickname: user.nickname,
          avatar: user.avatar,
          company: user.company,
        },
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ code: 500, message: '登录失败', data: null });
  }
});

// GET /profile - 获取用户信息
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, phone_or_email, nickname, avatar, company, is_active, last_login_at, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    res.json({ code: 0, message: '获取成功', data: users[0] });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ code: 500, message: '获取用户信息失败', data: null });
  }
});

// PUT /profile - 更新用户信息
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { nickname, company, avatar } = req.body;
    const updates = [];
    const values = [];

    if (nickname !== undefined) {
      updates.push('nickname = ?');
      values.push(nickname);
    }
    if (company !== undefined) {
      updates.push('company = ?');
      values.push(company);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({ code: 400, message: '没有需要更新的字段', data: null });
    }

    values.push(req.userId);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ code: 0, message: '更新成功', data: null });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ code: 500, message: '更新用户信息失败', data: null });
  }
});

// PUT /password - 修改密码
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ code: 400, message: '旧密码和新密码不能为空', data: null });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ code: 400, message: '新密码长度不能少于6位', data: null });
    }

    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.userId]);
    if (users.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    const isValid = await bcrypt.compare(oldPassword, users[0].password_hash);
    if (!isValid) {
      return res.status(400).json({ code: 400, message: '旧密码错误', data: null });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.userId]);

    res.json({ code: 0, message: '密码修改成功', data: null });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ code: 500, message: '修改密码失败', data: null });
  }
});

export default router;