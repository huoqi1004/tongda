import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('正在初始化数据库...');
    await connection.query(sql);
    console.log('数据库初始化成功！');
    console.log('已创建所有表并插入初始数据。');
    console.log('管理员账号: admin / admin123456');
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    process.exit(1);
  } finally {
    connection.release();
    await pool.end();
  }
}

initDatabase();