// Утилиты для работы с ZIP файлами
import JSZip from 'jszip';
import { logger } from './logger';

export interface ParsedZipData {
  editorHtml: string;   // Рабочий шаблон с переменными ${editor.*}
  visualHtml: string;   // Визуальный шаблон с реальными значениями
  json: string;
}

export async function parseZipFile(file: File): Promise<ParsedZipData> {
  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    
    let editorHtml = '';
    let visualHtml = '';
    let json = '';
    
    // Ищем HTML файлы
    const allHtmlFiles = Object.keys(contents.files).filter(name => 
      name.toLowerCase().endsWith('.html') || name.toLowerCase().endsWith('.htm')
    );
    
    // Файл с суффиксом editor - рабочий шаблон с переменными
    const editorHtmlFile = allHtmlFiles.find(name => 
      name.toLowerCase().includes('editor')
    );
    
    // Обычный HTML файл - визуальный шаблон
    const visualHtmlFile = allHtmlFiles.find(name => 
      !name.toLowerCase().includes('editor')
    );
    
    if (editorHtmlFile) {
      editorHtml = await contents.files[editorHtmlFile].async('text');
    }
    
    if (visualHtmlFile) {
      visualHtml = await contents.files[visualHtmlFile].async('text');
    }
    
    // Ищем JSON файл
    const jsonFile = Object.keys(contents.files).find(name => 
      name.toLowerCase().endsWith('.json')
    );
    
    if (jsonFile) {
      json = await contents.files[jsonFile].async('text');
    }
    
    return { editorHtml, visualHtml, json };
  } catch (error) {
    logger.error('Error parsing ZIP', 'zip-parser', { error: error instanceof Error ? error.message : error });
    throw new Error('Не удалось распарсить ZIP файл');
  }
}
