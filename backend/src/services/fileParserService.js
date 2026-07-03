import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
import { promises as fs } from 'fs';
import path from 'path';

/**
 * 文件内容解析服务
 * 支持多种文件格式：txt, md, docx, pdf, jpg, png等
 */
class FileParserService {
  /**
   * 解析文件内容
   * @param {string} filePath - 文件路径
   * @param {string} fileType - 文件扩展名
   * @returns {Promise<{content: string, success: boolean, message: string}>}
   */
  async parseFile(filePath, fileType) {
    const ext = fileType.toLowerCase();

    try {
      switch (ext) {
        case '.txt':
        case '.md':
        case '.html':
        case '.csv':
        case '.json':
          return await this.parseTextFile(filePath, ext);
        case '.docx':
          return await this.parseDocxFile(filePath);
        case '.pdf':
          return await this.parsePdfFile(filePath);
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.gif':
        case '.bmp':
          return await this.parseImageFile(filePath, ext);
        default:
          return {
            content: '',
            success: false,
            message: `不支持的文件类型: ${ext}`
          };
      }
    } catch (error) {
      console.error(`文件解析失败 (${filePath}):`, error);
      return {
        content: '',
        success: false,
        message: `文件解析失败: ${error.message}`
      };
    }
  }

  /**
   * 解析文本文件
   */
  async parseTextFile(filePath, ext) {
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      content,
      success: true,
      message: '文本文件解析成功'
    };
  }

  /**
   * 解析DOCX文件
   */
  async parseDocxFile(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      const content = result.value;
      
      if (!content || content.trim().length === 0) {
        return {
          content: '',
          success: false,
          message: 'DOCX文件内容为空'
        };
      }

      return {
        content,
        success: true,
        message: 'DOCX文件解析成功'
      };
    } catch (error) {
      throw new Error(`DOCX解析失败: ${error.message}`);
    }
  }

  /**
   * 解析PDF文件
   */
  async parsePdfFile(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      const content = data.text;

      if (!content || content.trim().length === 0) {
        return {
          content: '',
          success: false,
          message: 'PDF文件内容为空'
        };
      }

      return {
        content,
        success: true,
        message: 'PDF文件解析成功'
      };
    } catch (error) {
      throw new Error(`PDF解析失败: ${error.message}`);
    }
  }

  /**
   * 解析图片文件（OCR识别）
   * 注意：这需要安装tesseract-ocr或使用云服务
   * 当前返回提示信息，实际使用时需要接入OCR服务
   */
  async parseImageFile(filePath, ext) {
    // 方法1: 使用Tesseract.js（需要安装）
    // 方法2: 使用阿里云OCR API
    // 方法3: 使用百度OCR API
    
    // 这里提供一个基础实现，提示用户需要配置OCR服务
    const imageSize = await this.getImageSize(filePath);
    
    return {
      content: `[图片文件] ${path.basename(filePath)}\n` +
               `文件大小: ${(imageSize / 1024).toFixed(2)} KB\n` +
               `格式: ${ext.toUpperCase().replace('.', '')}\n\n` +
               `⚠️ 图片内容识别需要配置OCR服务。\n` +
               `请联系管理员配置阿里云OCR或百度OCR API。\n\n` +
               `如需提取图片中的文字内容，请：\n` +
               `1. 使用OCR工具提取文字\n` +
               `2. 或将文字内容复制到文本文件中上传`,
      success: true,
      message: '图片文件已识别（需配置OCR服务）',
      isImage: true
    };
  }

  /**
   * 获取图片文件大小
   */
  async getImageSize(filePath) {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  /**
   * 获取支持的文件类型列表
   */
  static getSupportedTypes() {
    return {
      documents: [
        { ext: '.txt', name: '纯文本文件', ocr: false },
        { ext: '.md', name: 'Markdown文件', ocr: false },
        { ext: '.docx', name: 'Word文档', ocr: false },
        { ext: '.pdf', name: 'PDF文档', ocr: false },
        { ext: '.html', name: 'HTML文件', ocr: false },
        { ext: '.csv', name: 'CSV表格', ocr: false },
        { ext: '.json', name: 'JSON文件', ocr: false }
      ],
      images: [
        { ext: '.jpg', name: 'JPEG图片', ocr: true },
        { ext: '.jpeg', name: 'JPEG图片', ocr: true },
        { ext: '.png', name: 'PNG图片', ocr: true },
        { ext: '.gif', name: 'GIF图片', ocr: true },
        { ext: '.bmp', name: 'BMP图片', ocr: true }
      ]
    };
  }

  /**
   * 检查文件类型是否支持
   */
  static isSupported(ext) {
    const supported = [
      '.txt', '.md', '.docx', '.pdf', '.html', '.csv', '.json',
      '.jpg', '.jpeg', '.png', '.gif', '.bmp'
    ];
    return supported.includes(ext.toLowerCase());
  }

  /**
   * 获取文件类型分类
   */
  static getFileCategory(ext) {
    const documentExts = ['.txt', '.md', '.docx', '.pdf', '.html', '.csv', '.json'];
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    
    if (documentExts.includes(ext.toLowerCase())) return 'document';
    if (imageExts.includes(ext.toLowerCase())) return 'image';
    return 'unknown';
  }
}

// 添加实例方法包装静态方法
FileParserService.prototype.getSupportedTypes = function() {
  return FileParserService.getSupportedTypes();
};
FileParserService.prototype.isSupported = function(ext) {
  return FileParserService.isSupported(ext);
};
FileParserService.prototype.getFileCategory = function(ext) {
  return FileParserService.getFileCategory(ext);
};

// 创建单例
const fileParserService = new FileParserService();
export default fileParserService;
