export interface MindboxState {
  goal: string;
  html: string;
  json: string;
  quickFix: boolean;
  isDynamicGrid: boolean;
  isEditable: boolean;
  settings: Record<string, boolean>;
  improvedGoal: string;
  fixedHtml: string;
  fixedJson: string;
  reportMarkdown: string;
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
