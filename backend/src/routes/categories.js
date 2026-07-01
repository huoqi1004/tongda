import { Router } from 'express';
import pool from '../config/db.js';
import { adminMiddleware } from '../middleware/auth.js';

const router = Router();

// GET / - 获取分类树（公开）
router.get('/', async (req, res) => {
  try {
    const [allCategories] = await pool.query(
      'SELECT id, name, slug, parent_id, sort_order, description, image_url, is_active FROM categories WHERE is_active = 1 ORDER BY sort_order ASC'
    );

    // 构建树形结构
    const tree = [];
    const map = {};

    for (const cat of allCategories) {
      map[cat.id] = { ...cat, children: [] };
    }

    for (const cat of allCategories) {
      if (cat.parent_id && map[cat.parent_id]) {
        map[cat.parent_id].children.push(map[cat.id]);
      } else if (!cat.parent_id) {
        tree.push(map[cat.id]);
      }
    }

    res.json({ code: 0, message: '获取成功', data: { list: tree } });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({ code: 500, message: '获取分类失败', data: null });
  }
});

// POST / - 创建分类（管理员）
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { name, slug, parentId, sortOrder, description, imageUrl } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ code: 400, message: '分类名称和slug不能为空', data: null });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, parent_id, sort_order, description, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, slug, parentId || null, sortOrder || 0, description || null, imageUrl || null]
    );

    res.json({ code: 0, message: '分类创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建分类失败:', error);
    res.status(500).json({ code: 500, message: '创建分类失败', data: null });
  }
});

// PUT /:id - 更新分类（管理员）
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, parentId, sortOrder, description, imageUrl, isActive } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (slug !== undefined) { updates.push('slug = ?'); values.push(slug); }
    if (parentId !== undefined) { updates.push('parent_id = ?'); values.push(parentId); }
    if (sortOrder !== undefined) { updates.push('sort_order = ?'); values.push(sortOrder); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (imageUrl !== undefined) { updates.push('image_url = ?'); values.push(imageUrl); }
    if (isActive !== undefined) { updates.push('is_active = ?'); values.push(isActive ? 1 : 0); }

    if (updates.length === 0) {
      return res.status(400).json({ code: 400, message: '没有需要更新的字段', data: null });
    }

    values.push(id);
    await pool.query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ code: 0, message: '分类更新成功', data: null });
  } catch (error) {
    console.error('更新分类失败:', error);
    res.status(500).json({ code: 500, message: '更新分类失败', data: null });
  }
});

// DELETE /:id - 删除分类（管理员）
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '分类不存在', data: null });
    }

    res.json({ code: 0, message: '分类删除成功', data: null });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({ code: 500, message: '删除分类失败', data: null });
  }
});

export default router;