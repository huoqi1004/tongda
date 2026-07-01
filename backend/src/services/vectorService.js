/**
 * 向量工具服务
 * 提供余弦相似度计算、文本分块、向量解析等功能
 */

/**
 * 计算两个向量的余弦相似度
 * @param {number[]} vecA - 向量A
 * @param {number[]} vecB - 向量B
 * @returns {number} 余弦相似度 (0-1)
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 将文本分割成指定大小的块
 * @param {string} text - 原始文本
 * @param {number} chunkSize - 每块大小（字符数）
 * @param {number} overlap - 块之间的重叠字符数
 * @returns {string[]} 文本块数组
 */
export function chunkText(text, chunkSize = 500, overlap = 50) {
  if (!text || text.length === 0) {
    return [];
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // 如果还没到结尾，尝试在标点符号或换行处断开
    if (end < text.length) {
      // 向后查找最近的句子结束符
      const searchEnd = Math.min(end + 100, text.length);
      const slice = text.substring(end, searchEnd);
      const match = slice.match(/[。！？\n\r]/);
      if (match && match.index !== undefined) {
        end = end + match.index + 1;
      }
    }

    const chunk = text.substring(start, Math.min(end, text.length)).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    start = start + chunkSize - overlap;
  }

  return chunks;
}

/**
 * 解析JSON字符串格式的向量嵌入
 * @param {string} str - JSON字符串
 * @returns {number[]} 向量数组
 */
export function parseEmbedding(str) {
  if (!str) {
    return [];
  }

  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('解析向量嵌入失败:', error.message);
    return [];
  }
}