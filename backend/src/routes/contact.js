import { Router } from 'express';
import pool from '../config/db.js';
import { adminMiddleware } from '../middleware/auth.js';

const router = Router();

// POST /submit - 提交联系表单（公开）
router.post('/submit', async (req, res) => {
  try {
    const { name, phone, email, company, subject, message, source } = req.body;

    if (!name || !message) {
      return res.status(400).json({ code: 400, message: '姓名和留言内容不能为空', data: null });
    }

    const [result] = await pool.query(
      'INSERT INTO contact_forms (name, phone, email, company, subject, message, source) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, phone || null, email || null, company || null, subject || null, message, source || 'web']
    );

    res.json({ code: 0, message: '提交成功，我们会尽快与您联系！', data: { id: result.insertId } });
  } catch (error) {
    console.error('提交联系表单失败:', error);
    res.status(500).json({ code: 500, message: '提交失败', data: null });
  }
});

// GET / - 获取联系表单列表（管理员）
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM contact_forms');
    const total = countResult[0].total;

    const [forms] = await pool.query(
      'SELECT * FROM contact_forms ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );

    // 标记为已读
    const unreadIds = forms.filter(f => !f.is_read).map(f => f.id);
    if (unreadIds.length > 0) {
      await pool.query('UPDATE contact_forms SET is_read = 1 WHERE id IN (?)', [unreadIds]);
    }

    res.json({
      code: 0,
      message: '获取成功',
      data: {
        list: forms,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.error('获取联系表单失败:', error);
    res.status(500).json({ code: 500, message: '获取联系表单失败', data: null });
  }
});

// DELETE /:id - 删除联系表单（管理员）
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM contact_forms WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '表单不存在', data: null });
    }

    res.json({ code: 0, message: '删除成功', data: null });
  } catch (error) {
    console.error('删除联系表单失败:', error);
    res.status(500).json({ code: 500, message: '删除失败', data: null });
  }
});

export default router;