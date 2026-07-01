import { Router } from 'express';
import pool from '../config/db.js';
import { optionalAuth } from '../middleware/auth.js';
import { generateAnswer } from '../services/ragService.js';

const router = Router();

// GET /conversations - 获取用户的会话列表
router.get('/conversations', optionalAuth, async (req, res) => {
  try {
    const { userId } = req;
    const visitorId = req.query.visitorId;

    let conversations;
    if (userId) {
      [conversations] = await pool.query(
        'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
        [userId]
      );
    } else if (visitorId) {
      [conversations] = await pool.query(
        'SELECT * FROM conversations WHERE visitor_id = ? ORDER BY updated_at DESC',
        [visitorId]
      );
    } else {
      return res.json({ code: 0, message: '获取成功', data: { list: [] } });
    }

    res.json({ code: 0, message: '获取成功', data: { list: conversations } });
  } catch (error) {
    console.error('获取会话列表失败:', error);
    res.status(500).json({ code: 500, message: '获取会话列表失败', data: null });
  }
});

// POST /conversations - 创建新会话
router.post('/conversations', optionalAuth, async (req, res) => {
  try {
    const { userId } = req;
    const { title, visitorId } = req.body;

    const [result] = await pool.query(
      'INSERT INTO conversations (user_id, visitor_id, title) VALUES (?, ?, ?)',
      [userId || null, visitorId || null, title || '新对话']
    );

    const [conversations] = await pool.query('SELECT * FROM conversations WHERE id = ?', [result.insertId]);

    res.json({ code: 0, message: '会话创建成功', data: conversations[0] });
  } catch (error) {
    console.error('创建会话失败:', error);
    res.status(500).json({ code: 500, message: '创建会话失败', data: null });
  }
});

// GET /conversations/:id/messages - 获取会话消息
router.get('/conversations/:id/messages', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [messages] = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [id]
    );

    res.json({ code: 0, message: '获取成功', data: { list: messages } });
  } catch (error) {
    console.error('获取消息失败:', error);
    res.status(500).json({ code: 500, message: '获取消息失败', data: null });
  }
});

// POST /message - 发送消息并触发AI回复
router.post('/message', optionalAuth, async (req, res) => {
  try {
    const { userId } = req;
    const { conversationId, content, visitorId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ code: 400, message: '消息内容不能为空', data: null });
    }

    let convId = conversationId;

    // 如果没有会话ID，创建新会话
    if (!convId) {
      const [convResult] = await pool.query(
        'INSERT INTO conversations (user_id, visitor_id, title) VALUES (?, ?, ?)',
        [userId || null, visitorId || null, content.substring(0, 50)]
      );
      convId = convResult.insertId;
    }

    // 保存用户消息
    const [msgResult] = await pool.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [convId, 'user', content]
    );

    const [userMessages] = await pool.query('SELECT * FROM messages WHERE id = ?', [msgResult.insertId]);

    // 更新会话标题（取第一条用户消息前50字）
    await pool.query(
      'UPDATE conversations SET title = ?, updated_at = NOW() WHERE id = ?',
      [content.substring(0, 50), convId]
    );

    // 获取历史消息用于上下文
    const [history] = await pool.query(
      'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 10',
      [convId]
    );

    // 调用RAG服务生成AI回复
    const aiReply = await generateAnswer(content, [], history);

    // 保存AI回复（兼容字段名：source/retrieved/chunks）
    const [aiMsgResult] = await pool.query(
      'INSERT INTO messages (conversation_id, role, content, source, confidence) VALUES (?, ?, ?, ?, ?)',
      [convId, 'assistant', aiReply.content, aiReply.source || 'faq', aiReply.confidence || null]
    );

    const [aiMessages] = await pool.query('SELECT * FROM messages WHERE id = ?', [aiMsgResult.insertId]);

    // 更新会话未读数
    await pool.query(
      'UPDATE conversations SET unread_count = unread_count + 1, updated_at = NOW() WHERE id = ?',
      [convId]
    );

    res.json({
      code: 0,
      message: '发送成功',
      data: {
        conversationId: convId,
        conversation_id: convId, // 兼容 snake_case
        userMessage: userMessages[0],
        user_message: userMessages[0],
        aiMessage: aiMessages[0],
        ai_message: aiMessages[0],
        // 前端期望的扁平字段（ChatWidget 直接读 .reply）
        reply: aiReply.content,
        status: 'ai', // 当前会话状态（ai/pending/human）
        isReal: !!aiReply.isReal, // true=真实 AI 回答；false=降级为本地模板
        source: aiReply.source || 'faq',
      },
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({ code: 500, message: '发送消息失败', data: null });
  }
});

// POST /transfer-human - 转人工客服
router.post('/transfer-human', optionalAuth, async (req, res) => {
  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ code: 400, message: '会话ID不能为空', data: null });
    }

    await pool.query(
      'UPDATE conversations SET status = ?, updated_at = NOW() WHERE id = ?',
      ['pending', conversationId]
    );

    // 添加系统消息
    await pool.query(
      'INSERT INTO messages (conversation_id, role, content, source) VALUES (?, ?, ?, ?)',
      [conversationId, 'system', '已转接人工客服，请稍候，我们的客服人员将尽快为您服务。', 'manual']
    );

    res.json({ code: 0, message: '已转接人工客服', data: null });
  } catch (error) {
    console.error('转人工失败:', error);
    res.status(500).json({ code: 500, message: '转人工失败', data: null });
  }
});

export default router;