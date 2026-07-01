import { Router } from 'express';
import pool from '../config/db.js';
import { adminMiddleware } from '../middleware/auth.js';

const router = Router();

// GET / - 获取产品列表（公开）
router.get('/', async (req, res) => {
  try {
    const { category, featured, page, pageSize } = req.query;
    let sql = 'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
    const params = [];

    if (category) {
      sql += ' AND (c.id = ? OR c.slug = ?)';
      params.push(category, category);
    }
    if (featured === '1') {
      sql += ' AND p.is_featured = 1';
    }

    sql += ' ORDER BY p.sort_order ASC, p.created_at DESC';

    const [products] = await pool.query(sql, params);

    res.json({ code: 0, message: '获取成功', data: { list: products } });
  } catch (error) {
    console.error('获取产品列表失败:', error);
    res.status(500).json({ code: 500, message: '获取产品列表失败', data: null });
  }
});

// GET /:id - 获取产品详情（公开）
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ code: 404, message: '产品不存在', data: null });
    }

    // 增加浏览次数
    await pool.query('UPDATE products SET view_count = view_count + 1 WHERE id = ?', [id]);

    res.json({ code: 0, message: '获取成功', data: products[0] });
  } catch (error) {
    console.error('获取产品详情失败:', error);
    res.status(500).json({ code: 500, message: '获取产品详情失败', data: null });
  }
});

// POST / - 创建产品（管理员）
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const {
      categoryId, name, slug, model, description, specification,
      material, surfaceTreatment, meshSize, wireDiameter,
      width, length, price, unit, coverImage, images,
      isFeatured, isHot, isNew, sortOrder,
    } = req.body;

    if (!categoryId || !name || !slug) {
      return res.status(400).json({ code: 400, message: '分类ID、产品名称和slug不能为空', data: null });
    }

    const [result] = await pool.query(
      `INSERT INTO products (category_id, name, slug, model, description, specification,
       material, surface_treatment, mesh_size, wire_diameter, width, length, price, unit,
       cover_image, images, is_featured, is_hot, is_new, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categoryId, name, slug, model || null, description || null, specification || null,
        material || null, surfaceTreatment || null, meshSize || null, wireDiameter || null,
        width || null, length || null, price || null, unit || '平方米',
        coverImage || null, images ? JSON.stringify(images) : null,
        isFeatured ? 1 : 0, isHot ? 1 : 0, isNew ? 1 : 0, sortOrder || 0,
      ]
    );

    res.json({ code: 0, message: '产品创建成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('创建产品失败:', error);
    res.status(500).json({ code: 500, message: '创建产品失败', data: null });
  }
});

// PUT /:id - 更新产品（管理员）
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [
      'categoryId', 'name', 'slug', 'model', 'description', 'specification',
      'material', 'surfaceTreatment', 'meshSize', 'wireDiameter',
      'width', 'length', 'price', 'unit', 'coverImage', 'images',
      'isFeatured', 'isHot', 'isNew', 'isActive', 'sortOrder',
    ];
    const dbFields = {
      categoryId: 'category_id', surfaceTreatment: 'surface_treatment',
      meshSize: 'mesh_size', wireDiameter: 'wire_diameter',
      coverImage: 'cover_image', isFeatured: 'is_featured',
      isHot: 'is_hot', isNew: 'is_new', isActive: 'is_active',
      sortOrder: 'sort_order',
    };

    const updates = [];
    const values = [];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        const dbField = dbFields[field] || field;
        if (field === 'images') {
          updates.push(`${dbField} = ?`);
          values.push(JSON.stringify(req.body[field]));
        } else if (['isFeatured', 'isHot', 'isNew', 'isActive'].includes(field)) {
          updates.push(`${dbField} = ?`);
          values.push(req.body[field] ? 1 : 0);
        } else {
          updates.push(`${dbField} = ?`);
          values.push(req.body[field]);
        }
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ code: 400, message: '没有需要更新的字段', data: null });
    }

    values.push(id);
    await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ code: 0, message: '产品更新成功', data: null });
  } catch (error) {
    console.error('更新产品失败:', error);
    res.status(500).json({ code: 500, message: '更新产品失败', data: null });
  }
});

// DELETE /:id - 删除产品（管理员）
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '产品不存在', data: null });
    }

    res.json({ code: 0, message: '产品删除成功', data: null });
  } catch (error) {
    console.error('删除产品失败:', error);
    res.status(500).json({ code: 500, message: '删除产品失败', data: null });
  }
});

export default router;