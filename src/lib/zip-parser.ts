// Утилиты для работы с ZIP файлами
import JSZip from 'jszip';

export interface ParsedZipData {
  html: string;
  json: string;
}

export async function parseZipFile(file: File): Promise<ParsedZipData> {
  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    
    let html = '';
    let json = '';
    
    // Ищем HTML файлы - приоритет для файла с суффиксом editor
    const allHtmlFiles = Object.keys(contents.files).filter(name => 
      name.toLowerCase().endsWith('.html') || name.toLowerCase().endsWith('.htm')
    );
    
    // Файл с суффиксом editor идет в блок кода (html), остальные в цель
    const editorHtmlFile = allHtmlFiles.find(name => 
      name.toLowerCase().includes('editor')
    );
    
    const regularHtmlFile = allHtmlFiles.find(name => 
      !name.toLowerCase().includes('editor')
    );
    
    if (editorHtmlFile) {
      html = await contents.files[editorHtmlFile].async('text');
    } else if (regularHtmlFile) {
      html = await contents.files[regularHtmlFile].async('text');
    }
    
    // Ищем JSON файл
    const jsonFile = Object.keys(contents.files).find(name => 
      name.toLowerCase().endsWith('.json')
    );
    
    if (jsonFile) {
      json = await contents.files[jsonFile].async('text');
    }
    
    return { html, json };
  } catch (error) {
    console.error('Error parsing ZIP:', error);
    throw new Error('Не удалось распарсить ZIP файл');
  }
}
