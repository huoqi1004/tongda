/**
 * DeepSeek API 服务
 * 负责调用 DeepSeek Chat API 和 Embeddings API
 * 当 API Key 为占位符、余额不足或网络错误时，使用模拟响应（自动降级，保证可用性）
 */

import { getMockResponse } from './mockResponses.js';

const MOCK_API_KEY = 'sk-placeholder';

// 标识当前是否已检测到 API key 有效（用于避免每次请求都检查）
let apiKeyValid = null;

/**
 * 检查 API key 是否有效（轻量探测一次）
 */
export async function checkApiKey() {
  if (apiKeyValid !== null) return apiKeyValid;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey === MOCK_API_KEY) { apiKeyValid = false; return false; }
  try {
    const apiBase = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com/v1';
    const r = await fetch(`${apiBase}/models`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    apiKeyValid = r.ok;
    return apiKeyValid;
  } catch {
    apiKeyValid = false;
    return false;
  }
}

/**
 * 调用 DeepSeek Chat API 进行对话
 * @param {Array<{role:string, content:string}>} messages - OpenAI 格式消息列表
 * @param {Object} options - { model, temperature, maxTokens }
 * @returns {Promise<{content, model, usage, isReal:boolean}>}
 */
export async function chatCompletion(messages, options = {}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiBase = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com/v1';
  let model = options.model || process.env.DEEPSEEK_CHAT_MODEL || 'deepseek-v4-flash';

  // 关键：如果用户配置了 "deepseek-v4-flash/pro" 这种带斜杠的非标准名称，自动去掉 /pro
  if (typeof model === 'string' && model.includes('/')) {
    const sanitized = model.split('/')[0];
    console.warn(`[DeepSeek] 模型名 ${model} 包含非法字符 '/'，已自动修正为 ${sanitized}`);
    model = sanitized;
  }

  if (!apiKey || apiKey === MOCK_API_KEY) {
    return mockChatCompletion(messages, 'API key 未配置，使用本地模拟回复');
  }

  try {
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
        // 对 v4-flash 系列：降低推理深度，避免 reasoning_content 耗光 token
        // 对非推理模型（如 deepseek-chat）该参数会被忽略
        reasoning_effort: 'low',
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const reason = parseError(response.status, errorText);
      console.warn(`[DeepSeek Chat] 失败 (${response.status}): ${reason}`);
      return mockChatCompletion(messages, reason);
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: data.model,
      usage: data.usage,
      isReal: true,
    };
  } catch (error) {
    console.error('[DeepSeek Chat] 网络错误:', error.message);
    return mockChatCompletion(messages, `网络错误: ${error.message}`);
  }
}

/**
 * 获取文本的向量嵌入
 * @returns {Promise<number[]>} - 向量数组（真实为 1024/1536 维，降级为 128 维模拟）
 */
export async function getEmbedding(text) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const apiBase = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com/v1';
  const model = process.env.DEEPSEEK_EMBED_MODEL || 'deepseek-embed';

  if (!apiKey || apiKey === MOCK_API_KEY) {
    return mockEmbedding(text);
  }

  try {
    const response = await fetch(`${apiBase}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, input: text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const reason = parseError(response.status, errorText);
      console.warn(`[DeepSeek Embeddings] 失败 (${response.status}): ${reason}，降级为本地模拟向量`);
      return mockEmbedding(text);
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || mockEmbedding(text);
  } catch (error) {
    console.error('[DeepSeek Embeddings] 网络错误:', error.message);
    return mockEmbedding(text);
  }
}

/**
 * 解析 DeepSeek API 错误，返回中文原因
 */
function parseError(status, errorText) {
  try {
    const obj = JSON.parse(errorText);
    const msg = obj.error?.message || errorText;
    if (status === 401) return 'API key 无效 (401)';
    if (status === 402) return `账户余额不足 (402): ${msg} - 请前往 https://platform.deepseek.com 充值`;
    if (status === 403) return `禁止访问 (403): ${msg}`;
    if (status === 404) return `模型不存在 (404): ${msg}`;
    if (status === 429) return `请求频率超限 (429): ${msg}`;
    if (status >= 500) return `DeepSeek 服务端错误 (${status}): ${msg}`;
    return `${status}: ${msg}`;
  } catch {
    return `${status}: ${errorText.substring(0, 200)}`;
  }
}

/**
 * 模拟聊天响应（降级方案）
 */
function mockChatCompletion(messages, reason = '模拟回复') {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  const userText = lastUserMsg?.content || '';
  const response = getMockResponse(userText);

  return {
    content: response,
    model: 'mock-deepseek',
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    isReal: false,
    reason, // 降级原因（方便调试）
  };
}

/**
 * 模拟向量嵌入（基于文本哈希的 128 维向量）
 * 注意：仅在真实 API 不可用时作为降级
 */
function mockEmbedding(text) {
  const dim = 128;
  const embedding = new Array(dim).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const idx = (charCode * 31 + i * 7) % dim;
    embedding[idx] += ((charCode % 10) - 5) / 10;
  }
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  if (magnitude > 0) for (let i = 0; i < dim; i++) embedding[i] /= magnitude;
  return embedding;
}
