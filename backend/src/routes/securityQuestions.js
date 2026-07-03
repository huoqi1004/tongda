import { Router } from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import passwordPolicyService from '../services/passwordPolicyService.js';

const router = Router();

/**
 * 用户端 - 获取密保问题列表
 */
router.get('/security-questions', async (req, res) => {
  try {
    const [questions] = await pool.query(
      'SELECT id, question FROM security_questions WHERE is_active = 1 ORDER BY sort_order ASC'
    );

    res.json({
      code: 0,
      message: '获取成功',
      data: questions
    });
  } catch (error) {
    console.error('获取密保问题失败:', error);
    res.status(500).json({ code: 500, message: '获取密保问题失败', data: null });
  }
});

/**
 * 用户端 - 设置密保问题（注册时使用）
 */
router.post('/security-questions/set', async (req, res) => {
  try {
    const { userId, questionId, answer } = req.body;

    if (!userId || !questionId || !answer) {
      return res.status(400).json({ code: 400, message: '请填写完整信息', data: null });
    }

    // 检查是否已存在密保答案
    const [existing] = await pool.query(
      'SELECT id FROM user_security_answers WHERE user_id = ? AND question_id = ?',
      [userId, questionId]
    );

    if (existing.length > 0) {
      // 更新已有答案
      await pool.query(
        'UPDATE user_security_answers SET answer = ?, is_active = 1, updated_at = NOW() WHERE user_id = ? AND question_id = ?',
        [answer.trim(), userId, questionId]
      );
    } else {
      // 插入新答案
      await pool.query(
        'INSERT INTO user_security_answers (user_id, question_id, answer) VALUES (?, ?, ?)',
        [userId, questionId, answer.trim()]
      );
    }

    res.json({
      code: 0,
      message: '密保问题设置成功',
      data: null
    });
  } catch (error) {
    console.error('设置密保问题失败:', error);
    res.status(500).json({ code: 500, message: '设置失败', data: null });
  }
});

/**
 * 用户端 - 验证密保答案
 */
router.post('/security-questions/verify', async (req, res) => {
  try {
    const { phoneOrEmail, questionId, answer } = req.body;

    if (!phoneOrEmail || !questionId || !answer) {
      return res.status(400).json({ code: 400, message: '请填写完整信息', data: null });
    }

    // 查找用户
    const [users] = await pool.query(
      'SELECT id, phone, email FROM users WHERE phone = ? OR email = ?',
      [phoneOrEmail, phoneOrEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    const user = users[0];

    // 获取用户的密保答案
    const [answers] = await pool.query(
      'SELECT answer FROM user_security_answers WHERE user_id = ? AND question_id = ? AND is_active = 1',
      [user.id, questionId]
    );

    if (answers.length === 0) {
      return res.status(400).json({ code: 400, message: '您尚未设置该密保问题', data: null });
    }

    // 验证答案（不区分大小写）
    if (answers[0].answer.toLowerCase() !== answer.toLowerCase()) {
      return res.status(400).json({ code: 400, message: '密保答案错误', data: null });
    }

    res.json({
      code: 0,
      message: '验证成功',
      data: { verified: true, userId: user.id }
    });
  } catch (error) {
    console.error('验证密保答案失败:', error);
    res.status(500).json({ code: 500, message: '验证失败', data: null });
  }
});

/**
 * 用户端 - 使用密保问题重置密码
 */
router.post('/security-questions/reset', async (req, res) => {
  try {
    const { phoneOrEmail, questionId, answer, newPassword } = req.body;

    if (!phoneOrEmail || !questionId || !answer || !newPassword) {
      return res.status(400).json({ code: 400, message: '请填写完整信息', data: null });
    }

    // 查找用户
    const [users] = await pool.query(
      'SELECT id, phone, email FROM users WHERE phone = ? OR email = ?',
      [phoneOrEmail, phoneOrEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在', data: null });
    }

    const user = users[0];

    // 获取用户的密保答案
    const [answers] = await pool.query(
      'SELECT answer FROM user_security_answers WHERE user_id = ? AND question_id = ? AND is_active = 1',
      [user.id, questionId]
    );

    if (answers.length === 0) {
      return res.status(400).json({ code: 400, message: '您尚未设置该密保问题', data: null });
    }

    // 验证答案
    if (answers[0].answer.toLowerCase() !== answer.toLowerCase()) {
      return res.status(400).json({ code: 400, message: '密保答案错误', data: null });
    }

    // 验证新密码强度
    const policy = await passwordPolicyService.getPolicy('user');
    const validationResult = passwordPolicyService.validatePasswordStrength(newPassword, policy);
    
    if (!validationResult.valid) {
      return res.status(400).json({ 
        code: 400, 
        message: '密码不符合安全策略', 
        data: { errors: validationResult.errors } 
      });
    }

    // 检查密码历史
    const historyCheck = await passwordPolicyService.checkPasswordHistory('user', user.id, newPassword, policy.history_count);
    if (historyCheck.inHistory) {
      return res.status(400).json({ code: 400, message: historyCheck.message, data: null });
    }

    // 更新密码
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = ?, last_password_change = NOW() WHERE id = ?',
      [passwordHash, user.id]
    );

    // 保存密码历史
    await passwordPolicyService.savePasswordHistory('user', user.id, passwordHash);

    console.log(`[用户密码重置] 密码重置成功，用户ID: ${user.id}`);

    res.json({
      code: 0,
      message: '密码重置成功，请使用新密码登录',
      data: null
    });
  } catch (error) {
    console.error('用户密码重置失败:', error);
    res.status(500).json({ code: 500, message: '重置密码失败', data: null });
  }
});

/**
 * 管理员端 - 验证密保答案
 */
router.post('/admin/security-questions/verify', async (req, res) => {
  try {
    const { username, questionId, answer } = req.body;

    if (!username || !questionId || !answer) {
      return res.status(400).json({ code: 400, message: '请填写完整信息', data: null });
    }

    // 查找管理员
    const [admins] = await pool.query(
      'SELECT id FROM admin_users WHERE username = ?',
      [username]
    );

    if (admins.length === 0) {
      return res.status(404).json({ code: 404, message: '管理员不存在', data: null });
    }

    const admin = admins[0];

    // 获取管理员的密保答案
    const [answers] = await pool.query(
      'SELECT answer FROM admin_security_answers WHERE admin_id = ? AND question_id = ? AND is_active = 1',
      [admin.id, questionId]
    );

    if (answers.length === 0) {
      return res.status(400).json({ code: 400, message: '您尚未设置该密保问题', data: null });
    }

    // 验证答案（不区分大小写）
    if (answers[0].answer.toLowerCase() !== answer.toLowerCase()) {
      return res.status(400).json({ code: 400, message: '密保答案错误', data: null });
    }

    res.json({
      code: 0,
      message: '验证成功',
      data: { verified: true, adminId: admin.id }
    });
  } catch (error) {
    console.error('验证管理员密保答案失败:', error);
    res.status(500).json({ code: 500, message: '验证失败', data: null });
  }
});

/**
 * 管理员端 - 使用密保问题重置密码
 */
router.post('/admin/security-questions/reset', async (req, res) => {
  try {
    const { username, questionId, answer, newPassword } = req.body;

    if (!username || !questionId || !answer || !newPassword) {
      return res.status(400).json({ code: 400, message: '请填写完整信息', data: null });
    }

    // 查找管理员
    const [admins] = await pool.query(
      'SELECT id FROM admin_users WHERE username = ?',
      [username]
    );

    if (admins.length === 0) {
      return res.status(404).json({ code: 404, message: '管理员不存在', data: null });
    }

    const admin = admins[0];

    // 获取管理员的密保答案
    const [answers] = await pool.query(
      'SELECT answer FROM admin_security_answers WHERE admin_id = ? AND question_id = ? AND is_active = 1',
      [admin.id, questionId]
    );

    if (answers.length === 0) {
      return res.status(400).json({ code: 400, message: '您尚未设置该密保问题', data: null });
    }

    // 验证答案
    if (answers[0].answer.toLowerCase() !== answer.toLowerCase()) {
      return res.status(400).json({ code: 400, message: '密保答案错误', data: null });
    }

    // 验证新密码强度
    const policy = await passwordPolicyService.getPolicy('admin');
    const validationResult = passwordPolicyService.validatePasswordStrength(newPassword, policy);
    
    if (!validationResult.valid) {
      return res.status(400).json({ 
        code: 400, 
        message: '密码不符合安全策略', 
        data: { errors: validationResult.errors } 
      });
    }

    // 检查密码历史
    const historyCheck = await passwordPolicyService.checkPasswordHistory('admin', admin.id, newPassword, policy.history_count);
    if (historyCheck.inHistory) {
      return res.status(400).json({ code: 400, message: historyCheck.message, data: null });
    }

    // 更新密码
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE admin_users SET password_hash = ?, last_password_change = NOW() WHERE id = ?',
      [passwordHash, admin.id]
    );

    // 保存密码历史
    await passwordPolicyService.savePasswordHistory('admin', admin.id, passwordHash);

    console.log(`[管理员密码重置] 密码重置成功，管理员ID: ${admin.id}`);

    res.json({
      code: 0,
      message: '密码重置成功，请使用新密码登录',
      data: null
    });
  } catch (error) {
    console.error('管理员密码重置失败:', error);
    res.status(500).json({ code: 500, message: '重置密码失败', data: null });
  }
});

export default router;
