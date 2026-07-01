import jwt from 'jsonwebtoken';

// 普通用户认证中间件
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '请先登录', data: null });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'user') {
      return res.status(401).json({ code: 401, message: '无效的用户令牌', data: null });
    }
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ code: 401, message: '令牌已过期或无效，请重新登录', data: null });
  }
}

// 管理员认证中间件
export function adminMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '请先登录管理员账号', data: null });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'admin') {
      return res.status(403).json({ code: 403, message: '无管理员权限', data: null });
    }
    req.adminId = decoded.id;
    req.adminRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ code: 401, message: '令牌已过期或无效，请重新登录', data: null });
  }
}

// 可选认证中间件（不强制要求登录）
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.userId = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type === 'user') {
      req.userId = decoded.id;
    } else {
      req.userId = null;
    }
  } catch (error) {
    req.userId = null;
  }
  next();
}