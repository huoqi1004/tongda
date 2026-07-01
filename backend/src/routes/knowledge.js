import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import { adminMiddleware } from '../middleware/auth.js';
import { chunkText } from '../services/vectorService.js';
import { getEmbedding } from '../services/deepseekService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `knowledge_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.txt', '.pdf', '.doc', '.docx', '.md', '.html', '.csv', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型，仅支持: ' + allowed.join(', ')));
    }
  },
});

const router = Router();

// GET /docs - 获取知识文档列表
router.get('/docs', adminMiddleware, async (req, res) => {
  try {
    const [docs] = await pool.query(
      'SELECT id, title, category, chunk_count, is_active, file_type, created_at, updated_at FROM knowledge_docs ORDER BY created_at DESC'
    );
    res.json({ code: 0, message: '获取成功', data: { list: docs } });
  } catch (error) {
    console.error('获取知识文档失败:', error);
    res.status(500).json({ code: 500, message: '获取知识文档失败', data: null });
  }
});

// POST /docs - 手动创建知识文档
router.post('/docs', adminMiddleware, async (req, res) => {
  try {
    const { title, category, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ code: 400, message: '标题和内容不能为空', data: null });
    }

    const [result] = await pool.query(
      'INSERT INTO knowledge_docs (title, category, content) VALUES (?, ?, ?)',
      [title, category || null, content]
    );

    const docId = result.insertId;

    // 分块并向量化
    const chunkSize = parseInt(process.env.RAG_CHUNK_SIZE) || 500;
    const overlap = parseInt(process.env.RAG_CHUNK_OVERLAP) || 50;
    const chunks = chunkText(content, chunkSize, overlap);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await getEmbedding(chunks[i]);
      await pool.query(
        'INSERT INTO knowledge_chunks (doc_id, chunk_index, content, embedding, token_count) VALUES (?, ?, ?, ?, ?)',
        [docId, i, chunks[i], JSON.stringify(embedding), chunks[i].length]
      );
    }

    await pool.query('UPDATE knowledge_docs SET chunk_count = ? WHERE id = ?', [chunks.length, docId]);

    res.json({ code: 0, message: '文档创建成功', data: { id: docId, chunkCount: chunks.length } });
  } catch (error) {
    console.error('创建知识文档失败:', error);
    res.status(500).json({ code: 500, message: '创建知识文档失败', data: null });
  }
});

// PUT /docs/:id - 更新知识文档
router.put('/docs/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, content, isActive } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (content !== undefined) { updates.push('content = ?'); values.push(content); }
    if (isActive !== undefined) { updates.push('is_active = ?'); values.push(isActive ? 1 : 0); }

    if (updates.length > 0) {
      values.push(id);
      await pool.query(`UPDATE knowledge_docs SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    // 如果内容有更新，重新分块和向量化
    if (content !== undefined) {
      await pool.query('DELETE FROM knowledge_chunks WHERE doc_id = ?', [id]);

      const chunkSize = parseInt(process.env.RAG_CHUNK_SIZE) || 500;
      const overlap = parseInt(process.env.RAG_CHUNK_OVERLAP) || 50;
      const chunks = chunkText(content, chunkSize, overlap);

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await getEmbedding(chunks[i]);
        await pool.query(
          'INSERT INTO knowledge_chunks (doc_id, chunk_index, content, embedding, token_count) VALUES (?, ?, ?, ?, ?)',
          [id, i, chunks[i], JSON.stringify(embedding), chunks[i].length]
        );
      }

      await pool.query('UPDATE knowledge_docs SET chunk_count = ? WHERE id = ?', [chunks.length, id]);
    }

    res.json({ code: 0, message: '文档更新成功', data: null });
  } catch (error) {
    console.error('更新知识文档失败:', error);
    res.status(500).json({ code: 500, message: '更新知识文档失败', data: null });
  }
});

// DELETE /docs/:id - 删除知识文档
router.delete('/docs/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM knowledge_docs WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '文档不存在', data: null });
    }

    res.json({ code: 0, message: '文档删除成功', data: null });
  } catch (error) {
    console.error('删除知识文档失败:', error);
    res.status(500).json({ code: 500, message: '删除知识文档失败', data: null });
  }
});

// POST /upload - 上传文档文件
router.post('/upload', adminMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 400, message: '请选择文件', data: null });
    }

    const { title, category } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileType = path.extname(req.file.originalname);

    // 读取文件内容（仅支持txt/md等文本文件）
    let content = '';
    const fs = await import('fs');
    if (['.txt', '.md', '.html', '.csv', '.json'].includes(fileType.toLowerCase())) {
      content = fs.readFileSync(req.file.path, 'utf-8');
    }

    const [result] = await pool.query(
      'INSERT INTO knowledge_docs (title, category, content, file_url, file_type) VALUES (?, ?, ?, ?, ?)',
      [title || req.file.originalname, category || null, content, fileUrl, fileType]
    );

    const docId = result.insertId;

    // 分块并向量化
    if (content) {
      const chunkSize = parseInt(process.env.RAG_CHUNK_SIZE) || 500;
      const overlap = parseInt(process.env.RAG_CHUNK_OVERLAP) || 50;
      const chunks = chunkText(content, chunkSize, overlap);

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await getEmbedding(chunks[i]);
        await pool.query(
          'INSERT INTO knowledge_chunks (doc_id, chunk_index, content, embedding, token_count) VALUES (?, ?, ?, ?, ?)',
          [docId, i, chunks[i], JSON.stringify(embedding), chunks[i].length]
        );
      }

      await pool.query('UPDATE knowledge_docs SET chunk_count = ? WHERE id = ?', [chunks.length, docId]);
    }

    res.json({
      code: 0,
      message: '文件上传成功',
      data: { id: docId, fileUrl, chunkCount: content ? '已分块' : 0 },
    });
  } catch (error) {
    console.error('上传文档失败:', error);
    res.status(500).json({ code: 500, message: '上传文档失败', data: null });
  }
});

// POST /retrieve - 测试检索
router.post('/retrieve', adminMiddleware, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ code: 400, message: '查询内容不能为空', data: null });
    }

    const queryEmbedding = await getEmbedding(query);

    // 获取所有分块
    const [chunks] = await pool.query(
      'SELECT kc.*, kd.title as doc_title FROM knowledge_chunks kc JOIN knowledge_docs kd ON kc.doc_id = kd.id WHERE kc.embedding IS NOT NULL'
    );

    const { cosineSimilarity } = await import('../services/vectorService.js');

    // 计算相似度并排序
    const results = chunks.map(chunk => {
      const embedding = JSON.parse(chunk.embedding);
      const similarity = cosineSimilarity(queryEmbedding, embedding);
      return { ...chunk, similarity };
    });

    const topK = parseInt(process.env.RAG_TOP_K) || 5;
    results.sort((a, b) => b.similarity - a.similarity);
    const topResults = results.slice(0, topK);

    res.json({
      code: 0,
      message: '检索成功',
      data: {
        query,
        results: topResults.map(r => ({
          docId: r.doc_id,
          docTitle: r.doc_title,
          chunkIndex: r.chunk_index,
          content: r.content,
          similarity: r.similarity,
        })),
      },
    });
  } catch (error) {
    console.error('检索失败:', error);
    res.status(500).json({ code: 500, message: '检索失败', data: null });
  }
});

export default router;