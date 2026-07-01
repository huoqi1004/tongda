/**
 * RAG (检索增强生成) 服务
 * 负责检索相关文档片段，并基于检索结果生成增强回答
 */

import pool from '../config/db.js';
import { chatCompletion, getEmbedding } from './deepseekService.js';
import { cosineSimilarity, parseEmbedding } from './vectorService.js';

/**
 * 检索与查询最相关的知识片段
 * @param {string} query - 用户查询
 * @param {number} conversationId - 会话ID（可选）
 * @returns {Array} top-K 相关片段
 */
export async function retrieveContext(query, conversationId = null) {
  try {
    const queryEmbedding = await getEmbedding(query);

    // 获取所有已向量化的知识片段
    const [chunks] = await pool.query(
      `SELECT kc.*, kd.title as doc_title, kd.category as doc_category
       FROM knowledge_chunks kc
       JOIN knowledge_docs kd ON kc.doc_id = kd.id
       WHERE kc.embedding IS NOT NULL AND kd.is_active = 1`
    );

    if (chunks.length === 0) {
      return [];
    }

    // 计算相似度并排序
    const results = chunks.map(chunk => {
      const embedding = parseEmbedding(chunk.embedding);
      const similarity = cosineSimilarity(queryEmbedding, embedding);
      return { ...chunk, similarity };
    });

    const topK = parseInt(process.env.RAG_TOP_K) || 5;
    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, topK).map(r => ({
      docId: r.doc_id,
      docTitle: r.doc_title,
      category: r.doc_category,
      content: r.content,
      similarity: r.similarity,
    }));
  } catch (error) {
    console.error('检索上下文失败:', error);
    return [];
  }
}

/**
 * 基于检索结果和对话历史生成答案
 * @param {string} query - 用户查询
 * @param {Array} context - 检索到的上下文片段
 * @param {Array} history - 对话历史
 * @returns {Object} { content, source, confidence }
 */
export async function generateAnswer(query, context = [], history = []) {
  try {
    // 检索相关上下文
    const retrievedContext = await retrieveContext(query);

    // 构建系统提示词
    const systemPrompt = `你是通达丝网（通达金属丝网制品有限公司）的智能客服助手。你的职责是帮助客户解答关于金属丝网产品的问题。

公司背景：
- 通达丝网位于中国丝网之乡——河北省安平县
- 主营产品：不锈钢网、电焊网、轧花网、钢板网、冲孔网、六角网、公路护栏网、球场围栏网、声屏障、防眩网等
- 产品应用于建筑、化工、矿山、交通、水利、农业等领域

回答要求：
1. 使用中文回答，语气专业、热情、有礼貌
2. 回答要准确、详细，包含具体的产品参数和规格
3. 如果用户询问的问题涉及特定产品，尽可能提供规格参数、材质、价格区间等信息
4. 如果知识库中有相关信息，优先使用知识库内容
5. 如果无法确定答案，诚实地告知用户，并建议联系人工客服
6. 适当使用emoji让回答更生动友好`;

    // 构建上下文信息
    let contextText = '';
    if (retrievedContext.length > 0) {
      contextText = '\n\n参考知识库内容（按相关度排序）：\n';
      retrievedContext.forEach((ctx, i) => {
        contextText += `\n[参考资料${i + 1} - ${ctx.docTitle} - 相关度: ${(ctx.similarity * 100).toFixed(1)}%]\n${ctx.content}\n`;
      });
    }

    // 构建消息列表
    const messages = [
      { role: 'system', content: systemPrompt + contextText },
    ];

    // 添加历史记录（最近5轮对话）
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }

    // 添加当前查询
    messages.push({ role: 'user', content: query });

    // 调用DeepSeek Chat API
    const result = await chatCompletion(messages);

    // 计算置信度（基于检索到的最高相似度）
    let confidence = 0.5; // 默认中等置信度
    if (retrievedContext.length > 0) {
      const maxSimilarity = Math.max(...retrievedContext.map(c => c.similarity));
      confidence = Math.min(maxSimilarity, 0.95);
    }

    return {
      content: result.content,
      source: retrievedContext.length > 0 ? 'rag' : 'faq',
      confidence: Math.round(confidence * 100) / 100,
      isReal: !!result.isReal,
      reason: result.reason, // 降级原因（如果有）
      references: retrievedContext.map(c => ({
        title: c.docTitle,
        similarity: Math.round(c.similarity * 100) / 100,
      })),
    };
  } catch (error) {
    console.error('生成答案失败:', error);

    // 降级：直接使用DeepSeek服务的模拟回复
    const messages = [
      { role: 'system', content: '你是通达丝网的智能客服助手。请用中文回答用户关于金属丝网产品的问题。' },
      { role: 'user', content: query },
    ];

    const result = await chatCompletion(messages);

    return {
      content: result.content,
      source: 'faq',
      confidence: 0.3,
      isReal: !!result.isReal,
      reason: result.reason,
    };
  }
}