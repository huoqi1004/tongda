import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

/**
 * 密码策略验证服务
 * 支持强密码规则、历史密码检查、账户锁定等
 */
class PasswordPolicyService {
  constructor() {
    this.policyCache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5分钟缓存
  }

  /**
   * 获取密码策略配置
   * @param {string} policyType - 策略类型: user, admin
   * @returns {Promise<object>}
   */
  async getPolicy(policyType) {
    const cacheKey = `policy_${policyType}`;
    const cached = this.policyCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const [rows] = await pool.query(
        'SELECT * FROM password_policies WHERE policy_type = ? LIMIT 1',
        [policyType]
      );

      let policy;
      if (rows.length === 0) {
        // 使用默认策略
        policy = this.getDefaultPolicy(policyType);
      } else {
        policy = rows[0];
      }

      this.policyCache.set(cacheKey, {
        data: policy,
        timestamp: Date.now()
      });

      return policy;
    } catch (error) {
      console.error('获取密码策略失败:', error);
      return this.getDefaultPolicy(policyType);
    }
  }

  /**
   * 获取默认密码策略
   */
  getDefaultPolicy(policyType) {
    const defaults = {
      user: {
        min_length: 8,
        require_uppercase: 1,
        require_lowercase: 1,
        require_digits: 1,
        require_special_chars: 1,
        special_chars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        max_age_days: 90,
        history_count: 5,
        max_attempts: 5,
        lockout_minutes: 30
      },
      admin: {
        min_length: 12,
        require_uppercase: 1,
        require_lowercase: 1,
        require_digits: 1,
        require_special_chars: 1,
        special_chars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        max_age_days: 60,
        history_count: 10,
        max_attempts: 3,
        lockout_minutes: 60
      }
    };

    return defaults[policyType] || defaults.user;
  }

  /**
   * 验证密码强度
   * @param {string} password - 待验证的密码
   * @param {object} policy - 密码策略
   * @returns {{valid: boolean, errors: string[], score: number}}
   */
  validatePasswordStrength(password, policy) {
    const errors = [];
    let score = 0;

    // 1. 长度检查
    if (password.length < policy.min_length) {
      errors.push(`密码长度不能少于 ${policy.min_length} 位`);
    } else {
      score += 20;
    }

    // 2. 大写字母检查
    if (policy.require_uppercase && !/[A-Z]/.test(password)) {
      errors.push('密码必须包含至少一个大写字母');
    } else if (policy.require_uppercase) {
      score += 20;
    }

    // 3. 小写字母检查
    if (policy.require_lowercase && !/[a-z]/.test(password)) {
      errors.push('密码必须包含至少一个小写字母');
    } else if (policy.require_lowercase) {
      score += 20;
    }

    // 4. 数字检查
    if (policy.require_digits && !/\d/.test(password)) {
      errors.push('密码必须包含至少一个数字');
    } else if (policy.require_digits) {
      score += 20;
    }

    // 5. 特殊字符检查
    if (policy.require_special_chars) {
      const specialChars = policy.special_chars || '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const specialRegex = new RegExp(`[${this.escapeRegExp(specialChars)}]`);
      
      if (!specialRegex.test(password)) {
        errors.push(`密码必须包含至少一个特殊字符（允许: ${specialChars}）`);
      } else {
        score += 20;
      }
    }

    // 6. 常见弱密码检查
    const weakPasswords = [
      'password', '123456', 'admin', 'qwerty', 'abc123',
      'password123', 'admin123', 'welcome', 'letmein'
    ];
    
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('密码过于简单，请使用更复杂的密码');
      score = 0;
    }

    // 7. 连续字符检查
    if (this.hasConsecutiveChars(password, 3)) {
      errors.push('密码不能包含连续三个相同字符');
      score -= 10;
    }

    // 8. 顺序字符检查
    if (this.hasSequentialChars(password, 3)) {
      errors.push('密码不能包含连续顺序字符（如abc, 123）');
      score -= 10;
    }

    // 计算最终分数
    score = Math.max(0, Math.min(100, score));

    return {
      valid: errors.length === 0,
      errors,
      score
    };
  }

  /**
   * 转义正则表达式特殊字符
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 检查连续相同字符
   */
  hasConsecutiveChars(str, maxConsecutive) {
    let count = 1;
    for (let i = 1; i < str.length; i++) {
      if (str[i] === str[i - 1]) {
        count++;
        if (count > maxConsecutive) {
          return true;
        }
      } else {
        count = 1;
      }
    }
    return false;
  }

  /**
   * 检查连续顺序字符
   */
  hasSequentialChars(str, maxSequential) {
    for (let i = 0; i <= str.length - maxSequential; i++) {
      const slice = str.slice(i, i + maxSequential);
      if (this.isSequential(slice)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 判断字符串是否为连续字符
   */
  isSequential(str) {
    // 检查数字连续
    if (/^\d+$/.test(str)) {
      for (let i = 1; i < str.length; i++) {
        if (parseInt(str[i]) !== parseInt(str[i - 1]) + 1) {
          return false;
        }
      }
      return true;
    }

    // 检查字母连续
    if (/^[a-zA-Z]+$/.test(str)) {
      const lower = str.toLowerCase();
      for (let i = 1; i < lower.length; i++) {
        if (lower.charCodeAt(i) !== lower.charCodeAt(i - 1) + 1) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  /**
   * 检查密码是否在历史记录中
   * @param {string} userType - 用户类型: user, admin
   * @param {number} userId - 用户ID
   * @param {string} newPassword - 新密码
   * @param {number} historyCount - 检查的历史密码数量
   * @returns {Promise<{inHistory: boolean, message: string}>}
   */
  async checkPasswordHistory(userType, userId, newPassword, historyCount = 5) {
    try {
      const [history] = await pool.query(
        `SELECT password_hash FROM password_history 
         WHERE user_type = ? AND user_id = ? 
         ORDER BY created_at DESC LIMIT ?`,
        [userType, userId, historyCount]
      );

      for (const record of history) {
        const match = await bcrypt.compare(newPassword, record.password_hash);
        if (match) {
          return {
            inHistory: true,
            message: `新密码不能与最近 ${historyCount} 次使用过的密码相同`
          };
        }
      }

      return { inHistory: false, message: '密码可以使用' };
    } catch (error) {
      console.error('检查密码历史失败:', error);
      return { inHistory: false, message: '检查失败，请重试' };
    }
  }

  /**
   * 检查账户是否被锁定
   * @param {string} userType - 用户类型: user, admin
   * @param {number} userId - 用户ID
   * @returns {Promise<{locked: boolean, message: string, unlockTime?: Date}>}
   */
  async checkAccountLock(userType, userId) {
    try {
      const table = userType === 'user' ? 'users' : 'admin_users';
      const [rows] = await pool.query(
        `SELECT failed_attempts, locked_until FROM ${table} WHERE id = ?`,
        [userId]
      );

      if (rows.length === 0) {
        return { locked: false, message: '账户不存在' };
      }

      const user = rows[0];
      
      // 检查锁定时间
      if (user.locked_until) {
        const now = new Date();
        const lockUntil = new Date(user.locked_until);
        
        if (lockUntil > now) {
          const minutes = Math.ceil((lockUntil - now) / (60 * 1000));
          return {
            locked: true,
            message: `账户已被锁定，请 ${minutes} 分钟后再试`,
            unlockTime: lockUntil
          };
        } else {
          // 锁定时间已过，重置锁定状态
          await this.resetLockStatus(userType, userId);
        }
      }

      return { locked: false, message: '账户正常' };
    } catch (error) {
      console.error('检查账户锁定状态失败:', error);
      return { locked: false, message: '检查失败，请重试' };
    }
  }

  /**
   * 记录登录失败尝试
   * @param {string} userType - 用户类型: user, admin
   * @param {number} userId - 用户ID
   * @returns {Promise<{locked: boolean, message: string, attempts: number}>}
   */
  async recordFailedAttempt(userType, userId) {
    try {
      const policy = await this.getPolicy(userType);
      const table = userType === 'user' ? 'users' : 'admin_users';
      
      // 获取当前失败次数
      const [rows] = await pool.query(
        `SELECT failed_attempts FROM ${table} WHERE id = ?`,
        [userId]
      );

      if (rows.length === 0) {
        return { locked: false, message: '账户不存在', attempts: 0 };
      }

      let attempts = rows[0].failed_attempts + 1;
      let locked = false;
      let message = `密码错误，还可尝试 ${policy.max_attempts - attempts} 次`;

      // 检查是否达到最大尝试次数
      if (attempts >= policy.max_attempts) {
        locked = true;
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + policy.lockout_minutes);
        
        await pool.query(
          `UPDATE ${table} SET failed_attempts = ?, locked_until = ? WHERE id = ?`,
          [attempts, lockUntil, userId]
        );

        message = `账户已被锁定 ${policy.lockout_minutes} 分钟，请稍后再试`;
      } else {
        // 更新失败次数
        await pool.query(
          `UPDATE ${table} SET failed_attempts = ? WHERE id = ?`,
          [attempts, userId]
        );
      }

      return { locked, message, attempts };
    } catch (error) {
      console.error('记录登录失败尝试失败:', error);
      return { locked: false, message: '系统错误', attempts: 0 };
    }
  }

  /**
   * 重置锁定状态
   */
  async resetLockStatus(userType, userId) {
    try {
      const table = userType === 'user' ? 'users' : 'admin_users';
      await pool.query(
        `UPDATE ${table} SET failed_attempts = 0, locked_until = NULL WHERE id = ?`,
        [userId]
      );
      return true;
    } catch (error) {
      console.error('重置锁定状态失败:', error);
      return false;
    }
  }

  /**
   * 检查密码是否过期
   * @param {string} userType - 用户类型: user, admin
   * @param {number} userId - 用户ID
   * @returns {Promise<{expired: boolean, message: string, daysLeft?: number}>}
   */
  async checkPasswordExpiry(userType, userId) {
    try {
      const policy = await this.getPolicy(userType);
      const table = userType === 'user' ? 'users' : 'admin_users';
      
      const [rows] = await pool.query(
        `SELECT last_password_change FROM ${table} WHERE id = ?`,
        [userId]
      );

      if (rows.length === 0 || !rows[0].last_password_change) {
        return { expired: false, message: '未设置密码修改时间' };
      }

      const lastChange = new Date(rows[0].last_password_change);
      const now = new Date();
      const daysSinceChange = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
      const daysLeft = policy.max_age_days - daysSinceChange;

      if (daysLeft <= 0) {
        return {
          expired: true,
          message: `密码已过期 ${Math.abs(daysLeft)} 天，请立即修改密码`,
          daysLeft: 0
        };
      } else if (daysLeft <= 7) {
        return {
          expired: false,
          message: `密码将在 ${daysLeft} 天后过期，建议提前修改`,
          daysLeft
        };
      } else {
        return {
          expired: false,
          message: '密码正常',
          daysLeft
        };
      }
    } catch (error) {
      console.error('检查密码过期失败:', error);
      return { expired: false, message: '检查失败' };
    }
  }

  /**
   * 保存密码到历史记录
   */
  async savePasswordHistory(userType, userId, passwordHash) {
    try {
      await pool.query(
        `INSERT INTO password_history (user_type, user_id, password_hash) VALUES (?, ?, ?)`,
        [userType, userId, passwordHash]
      );
      return true;
    } catch (error) {
      console.error('保存密码历史失败:', error);
      return false;
    }
  }

  /**
   * 清理过期的历史密码
   */
  async cleanupOldPasswordHistory(userType, userId, keepCount) {
    try {
      await pool.query(
        `DELETE FROM password_history 
         WHERE user_type = ? AND user_id = ? 
         AND id NOT IN (
           SELECT id FROM (
             SELECT id FROM password_history 
             WHERE user_type = ? AND user_id = ? 
             ORDER BY created_at DESC LIMIT ?
           ) AS tmp
         )`,
        [userType, userId, userType, userId, keepCount]
      );
      return true;
    } catch (error) {
      console.error('清理历史密码失败:', error);
      return false;
    }
  }
}

// 创建单例
const passwordPolicyService = new PasswordPolicyService();
export default passwordPolicyService;