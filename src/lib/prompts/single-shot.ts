import { SHARED_KB } from './kb/shared';
import { CORE_TYPES_KB } from './kb/core-types';
import { HTML_RULES_KB } from './kb/html-rules';
import { JSON_STRUCTURE_KB } from './kb/json-structure';
import { SYNC_RULES_KB } from './kb/sync-rules';
import { VALIDATION_CHECKLISTS } from './kb/validation-checklists';

interface SingleShotParams {
  goal: string;
  html?: string;
  json?: string;
  visualHtml?: string;
  isDynamicGrid: boolean;
  isEditable: boolean;
  settingsList?: string;
}

export function buildSingleShotPrompt({ 
  goal, 
  html = '', 
  json = '', 
  visualHtml = '',
  isDynamicGrid,
  isEditable,
  settingsList = ''
}: SingleShotParams): string {
  const hasExistingCode = html.trim() || json.trim();
  
  return `# MINDBOX BLOCK GENERATION - FAST MODE (SINGLE REQUEST)

## YOUR ROLE
You are a Mindbox email editor expert. Generate complete, valid HTML + JSON in ONE response following the complete Knowledge Base.

## COMPLETE KNOWLEDGE BASE

${SHARED_KB}

${CORE_TYPES_KB}

${HTML_RULES_KB}

${JSON_STRUCTURE_KB}

${SYNC_RULES_KB}

${VALIDATION_CHECKLISTS}

## USER REQUIREMENTS

### Goal
${goal}

${visualHtml ? `### Visual Reference HTML
\`\`\`html
${visualHtml}
\`\`\`
` : ''}

${html ? `### Existing HTML (validate and fix if needed)
\`\`\`html
${html}
\`\`\`
` : ''}

${json ? `### Existing JSON (validate and fix if needed)
\`\`\`json
${json}
\`\`\`
` : ''}

### Technical Requirements
- Dynamic Grid: ${isDynamicGrid ? 'YES - Use #foreach for product grids' : 'NO'}
- Editable Mode: ${isEditable ? 'YES - Use ${editor.variableName} for editable content' : 'NO'}
${settingsList ? `- Required Settings: ${settingsList}` : ''}

## TASK

${hasExistingCode 
  ? `Validate and correct the existing HTML and JSON code to ensure:
1. Full compliance with the Knowledge Base
2. Proper HTML structure (Ghost Tables, SIZE controls, outer spacing)
3. Complete JSON configuration with all mandatory controls
4. Perfect synchronization between HTML variables and JSON controls
5. Fix all validation errors and warnings`
  : `Generate from scratch:
1. Valid Mindbox HTML following the complete block structure
2. Complete JSON configuration with all mandatory controls
3. Ensure perfect synchronization between HTML and JSON`}

## OUTPUT FORMAT

Provide TWO code blocks in this exact format:

\`\`\`html
[Complete HTML code following Knowledge Base rules]
\`\`\`

\`\`\`json
[Complete JSON array with all controls]
\`\`\`

**CRITICAL RULES:**
- Output ONLY the two code blocks, no explanations
- HTML must follow Ghost Table + SIZE control structure
- JSON must include ALL mandatory controls (TEXT_STYLES, BUTTON_SETTINGS, IMAGE, etc.)
- Variables in HTML must exactly match "controlName" in JSON
- All variable names must follow \${editor.camelCase} format
- SIZE control defaultValue must be "manual 100 *"
- Background cells must use formattedWidthAttribute and formattedWidthStyle from SIZE control
- Outer spacing must use vertical spacers (Ghost Tables)
- Text styles must include fallbackFont (default: "Arial, sans-serif")`;
}
