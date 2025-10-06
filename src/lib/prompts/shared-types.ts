// Shared types for Mindbox prompts system

export type Scenario = 
  | 'generate-from-scratch'  // No HTML, No JSON
  | 'validate-html-generate-json'  // HTML exists, JSON doesn't
  | 'validate-both';  // Both HTML and JSON exist

export interface Step1Params {
  goal: string;
  html?: string;
  visualHtml?: string;
  isDynamicGrid: boolean;
  isEditable: boolean;
  settingsList: string;
}

export interface Step2Params {
  html: string;
  visualHtml?: string;
  json?: string;
}

export interface Step3Params {
  goal: string;
  html: string;
  visualHtml?: string;
  json: string;
  quickFix?: boolean;
}
