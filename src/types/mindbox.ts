export interface MindboxState {
  goal: string;
  
  // Оригинальный код от пользователя (не трогаем после загрузки)
  originalHtml: string;        // HTML код из ZIP или введённый вручную
  originalJson: string;        // JSON из ZIP или введённый вручную
  visualHtml?: string;         // Визуальный HTML для референса
  
  // Рабочий код для AI обработки (временный буфер)
  html: string;                // Используется AI для генерации/валидации
  json: string;                // Используется AI для генерации/валидации
  
  // Финальный исправленный код (результат Step 3)
  fixedHtml: string;
  fixedJson: string;
  reportMarkdown: string;
  
  quickFix: boolean;
  fastMode?: boolean;
  isDynamicGrid: boolean;
  isEditable: boolean;
  settings: Record<string, boolean>;
  improvedGoal: string;
  log: string[];
}

export interface HistoryItem {
  timestamp: number;
  name: string;
  data: Partial<MindboxState>;
}

export interface Component {
  title: string;
  settings: Record<string, SettingConfig>;
}

export interface SettingConfig {
  group?: string;
  tooltip?: string;
}
