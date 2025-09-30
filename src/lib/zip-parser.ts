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
    
    // Ищем HTML файл
    const htmlFile = Object.keys(contents.files).find(name => 
      name.toLowerCase().endsWith('.html') || name.toLowerCase().endsWith('.htm')
    );
    
    if (htmlFile) {
      html = await contents.files[htmlFile].async('text');
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
