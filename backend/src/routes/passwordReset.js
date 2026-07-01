/**
 * 密码找回路由
 * 流程：发送验证码 → 校验验证码（返回临时 token） → 重置密码
 *
 * 注意：开发环境验证码直接返回给前端（同时打印到后端日志）。
 *      生产环境请将"发送验证码"改为真实短信/邮件服务，不要把验证码回给前端。
 */
import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const router = Router();

// ========== 内存存储（生产请改 Redis） ==========
// codeStore: { `${scope}:${account}`: { code, expiresAt, attempts, lastSentAt, count, maskedAccount } }
// tokenStore: { token: { scope, accountId, expiresAt } }
const codeStore = new Map();
const tokenStore = new Map();

const CODE_TTL_MS = 5 * 60 * 1000;        // 验证码 5 分钟有效
const TOKEN_TTL_MS = 10 * 60 * 1000;       // 临时 token 10 分钟有效
const SEND_COOLDOWN_MS = 60 * 1000;        // 同一账号 60 秒内只能发一次
const MAX_SEND_PER_HOUR = 5;               // 一小时最多发 5 次
const MAX_VERIFY_ATTEMPTS = 5;             // 验证码最多错 5 次

// 定期清理过期项
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of codeStore) if (v.expiresAt < now) codeStore.delete(k);
  for (const [k, v] of tokenStore) if (v.expiresAt < now) tokenStore.delete(k);
}, 60 * 1000).unref?.();

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function genToken() {
  return crypto.randomBytes(24).toString('hex');
}

function rateLimit(scope, account) {
  const key = `${scope}:${account}`;
  const item = codeStore.get(key);
  const now = Date.now();
  if (item) {
    if (now - item.lastSentAt < SEND_COOLDOWN_MS) {
      const wait = Math.ceil((SEND_COOLDOWN_MS - (now - item.lastSentAt)) / 1000);
      return { ok: false, message: `请 ${wait} 秒后再试` };
    }
    if (item.hourStart && now - item.hourStart < 3600_000 && item.count >= MAX_SEND_PER_HOUR) {
      return { ok: false, message: '1 小时内获取次数过多，请稍后再试' };
    }
  }
  return { ok: true };
}

function recordSend(scope, account, code, maskedAccount) {
  const key = `${scope}:${account}`;
  const now = Date.now();
  const old = codeStore.get(key);
  codeStore.set(key, {
    code,
    expiresAt: now + CODE_TTL_MS,
    attempts: 0,
    lastSentAt: now,
    hourStart: old && now - old.hourStart < 3600_000 ? old.hourStart : now,
    count: old && now - old.hourStart < 3600_000 ? old.count + 1 : 1,
    maskedAccount,
  });
}

function issueResetToken(scope, accountId) {
  const token = genToken();
  tokenStore.set(token, { scope, accountId, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

function consumeResetToken(token) {
  const data = tokenStore.get(token);
  if (!data) return null;
  tokenStore.delete(token); // 一次性使用
  if (data.expiresAt < Date.now()) return null;
  return data;
}

// 掩码：138****1234
function maskAccount(acct) {
  if (!acct) return '';
  if (acct.includes('@')) {
    const [name, domain] = acct.split('@');
    return `${name.slice(0, 2)}***@${domain}`;
  }
  if (acct.length <= 7) return acct;
  return `${acct.slice(0, 3)}****${acct.slice(-4)}`;
}

// ========== 通用发送验证码实现 ==========
async function sendCodeHandler(req, res, { table, accountField, scope }) {
  try {
    const account = (req.body?.account || '').trim();
    if (!account) {
      return res.status(400).json({ code: 400, message: '请输入账号', data: null });
    }

    const [rows] = await pool.query(
      `SELECT id, is_active FROM ${table} WHERE ${accountField} = ? LIMIT 1`,
      [account]
    );
    if (rows.length === 0) {
      // 故意不暴露"账号是否存在"，但开发环境便于调试返回明确信息
      return res.status(404).json({ code: 404, message: '账号不存在', data: null });
    }
    if (rows[0].is_active === 0) {
      return res.status(403).json({ code: 403, message: '账号已被禁用', data: null });
    }

    const rl = rateLimit(scope, account);
    if (!rl.ok) return res.status(429).json({ code: 429, message: rl.message, data: null });

    const code = genCode();
    const maskedAccount = maskAccount(account);
    recordSend(scope, account, code, maskedAccount);

    // 开发环境：直接打印到日志，并回传给前端
    console.log(`[密码找回] scope=${scope} account=${maskedAccount} code=${code}`);

    return res.json({
      code: 0,
      message: '验证码已发送',
      data: {
        // 开发环境返回验证码；生产环境删除此字段
        devCode: code,
        maskedAccount,
        expiresIn: CODE_TTL_MS / 1000,
        cooldown: SEND_COOLDOWN_MS / 1000,
      },
    });
  } catch (err) {
    console.error('发送验证码失败:', err);
    return res.status(500).json({ code: 500, message: '发送验证码失败', data: null });
  }
}

async function verifyCodeHandler(req, res, { table, accountField, scope }) {
  try {
    const account = (req.body?.account || '').trim();
    const code = (req.body?.code || '').trim();
    if (!account || !code) {
      return res.status(400).json({ code: 400, message: '请输入账号和验证码', data: null });
    }

    const key = `${scope}:${account}`;
    const item = codeStore.get(key);
    if (!item) return res.status(400).json({ code: 400, message: '请先获取验证码', data: null });
    if (item.expiresAt < Date.now()) {
      codeStore.delete(key);
      return res.status(400).json({ code: 400, message: '验证码已过期，请重新获取', data: null });
    }
    if (item.attempts >= MAX_VERIFY_ATTEMPTS) {
      codeStore.delete(key);
      return res.status(429).json({ code: 429, message: '验证失败次数过多，请重新获取验证码', data: null });
    }
    if (item.code !== code) {
      item.attempts += 1;
      return res.status(400).json({ code: 400, message: `验证码错误，还可尝试 ${MAX_VERIFY_ATTEMPTS - item.attempts} 次`, data: null });
    }

    // 通过：查回真实 id，签发临时 token
    const [rows] = await pool.query(
      `SELECT id FROM ${table} WHERE ${accountField} = ? LIMIT 1`,
      [account]
    );
    if (rows.length === 0) return res.status(404).json({ code: 404, message: '账号不存在', data: null });

    codeStore.delete(key);
    const token = issueResetToken(scope, rows[0].id);
    return res.json({ code: 0, message: '验证成功', data: { resetToken: token, expiresIn: TOKEN_TTL_MS / 1000 } });
  } catch (err) {
    console.error('校验验证码失败:', err);
    return res.status(500).json({ code: 500, message: '校验失败', data: null });
  }
}

async function resetPasswordHandler(req, res, { table, scope, pwdField = 'password_hash' }) {
  try {
    const { resetToken, newPassword } = req.body || {};
    if (!resetToken || !newPassword) {
      return res.status(400).json({ code: 400, message: '参数不完整', data: null });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ code: 400, message: '新密码长度不能少于 6 位', data: null });
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(newPassword)) {
      return res.status(400).json({ code: 400, message: '新密码必须包含字母和数字', data: null });
    }

    const data = consumeResetToken(resetToken);
    if (!data || data.scope !== scope) {
      return res.status(400).json({ code: 400, message: '重置链接无效或已过期，请重新验证', data: null });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query(
      `UPDATE ${table} SET ${pwdField} = ? WHERE id = ?`,
      [newHash, data.accountId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '账号不存在', data: null });
    }

    console.log(`[密码重置成功] scope=${scope} accountId=${data.accountId}`);
    return res.json({ code: 0, message: '密码重置成功，请使用新密码登录', data: null });
  } catch (err) {
    console.error('重置密码失败:', err);
    return res.status(500).json({ code: 500, message: '重置失败', data: null });
  }
}

// ========== 用户端 ==========
router.post('/auth/forgot/send-code', (req, res) =>
  sendCodeHandler(req, res, { table: 'users', accountField: 'phone_or_email', scope: 'user' })
);
router.post('/auth/forgot/verify-code', (req, res) =>
  verifyCodeHandler(req, res, { table: 'users', accountField: 'phone_or_email', scope: 'user' })
);
router.post('/auth/forgot/reset', (req, res) =>
  resetPasswordHandler(req, res, { table: 'users', scope: 'user' })
);

// ========== 管理员端 ==========
router.post('/admin/forgot/send-code', (req, res) =>
  sendCodeHandler(req, res, { table: 'admin_users', accountField: 'username', scope: 'admin' })
);
router.post('/admin/forgot/verify-code', (req, res) =>
  verifyCodeHandler(req, res, { table: 'admin_users', accountField: 'username', scope: 'admin' })
);
router.post('/admin/forgot/reset', (req, res) =>
  resetPasswordHandler(req, res, { table: 'admin_users', scope: 'admin' })
);

export default router;
