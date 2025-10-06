// Step 1: HTML Generation and Validation
import type { Step1Params } from './shared-types';
import { SHARED_KB } from './kb/shared';
import { HTML_RULES_KB } from './kb/html-rules';
import { CORE_TYPES_KB } from './kb/core-types';
import { VALIDATION_CHECKLISTS } from './kb/validation-checklists';

/**
 * Step 1A: Generate HTML from scratch (when no HTML exists)
 */
export function buildStep1Generate({ goal, isDynamicGrid, isEditable, settingsList }: Step1Params): string {
  return `# STEP 1: HTML GENERATION FROM SCRATCH

## YOUR ROLE
You are an expert Mindbox email template developer. Your task is to generate complete, valid, production-ready HTML code based on the user's goal.

## KNOWLEDGE BASE (YOUR SINGLE SOURCE OF TRUTH)

${SHARED_KB}

${CORE_TYPES_KB}

${HTML_RULES_KB}

## USER'S GOAL
${goal}

## TECHNICAL REQUIREMENTS

### Block Configuration
- **Dynamic Grid**: ${isDynamicGrid ? 'YES - Use @{for item in editor.collection} loops for product grids' : 'NO - Static block without dynamic content'}
- **Editable**: ${isEditable ? 'YES - All content must be editable via ${editor.*} variables' : 'NO - Static content, minimal variables'}

### Required Settings/Components
${settingsList || 'No specific requirements listed. Use your best judgment based on the goal.'}

## VALIDATION CHECKLIST (SELF-CHECK BEFORE OUTPUT)

${VALIDATION_CHECKLISTS}

Before providing your output, verify all items in the HTML Validation Checklist.

## OUTPUT FORMAT

Provide ONLY the complete HTML code. No explanations, no markdown formatting, no comments outside the HTML itself.

Start directly with the HTML code.`;
}

/**
 * Step 1B: Validate existing HTML (when HTML exists but JSON doesn't)
 */
export function buildStep1Validate({ goal, html, visualHtml, isDynamicGrid, isEditable, settingsList }: Step1Params): string {
  return `# STEP 1: HTML VALIDATION AND CORRECTION

## YOUR ROLE
You are an expert Mindbox email template validator. Your task is to thoroughly validate the provided HTML code against Mindbox standards and correct any issues.

## KNOWLEDGE BASE (YOUR SINGLE SOURCE OF TRUTH)

${SHARED_KB}

${CORE_TYPES_KB}

${HTML_RULES_KB}

## USER'S ORIGINAL GOAL
${goal}

${visualHtml ? `## VISUAL REFERENCE (HOW THE BLOCK SHOULD LOOK)
This is the visual template showing how the final block should appear with real values:

\`\`\`html
${visualHtml}
\`\`\`

**IMPORTANT**: Use this as a visual reference to understand the design intent and structure. 
Your task is to validate/fix the EDITOR HTML below, ensuring it produces this visual result when variables are populated.

` : ''}## EDITOR HTML CODE TO VALIDATE
\`\`\`html
${html}
\`\`\`

## TECHNICAL REQUIREMENTS

### Block Configuration
- **Dynamic Grid**: ${isDynamicGrid ? 'YES - Must use @{for item in editor.collection} loops' : 'NO - Static block'}
- **Editable**: ${isEditable ? 'YES - All content must be editable via ${editor.*} variables' : 'NO - Minimal variables'}

### Required Settings/Components
${settingsList || 'Validate based on what exists in the HTML'}

## VALIDATION PROTOCOL

${VALIDATION_CHECKLISTS}

### Phase 1: Syntax Validation
Check for:
- [ ] Unclosed HTML tags
- [ ] Invalid variable syntax (\${editor.*} format)
- [ ] Malformed @{if} / @{end if} constructs
- [ ] Missing required attributes (alt on images, href on links)

### Phase 2: Structure Validation
Verify each block has:
- [ ] \`<!-- EDITOR_BLOCK_TEMPLATE: name -->\` header comment
- [ ] Ghost table wrappers for Outlook compatibility
- [ ] Table-based layout (not divs)
- [ ] Proper centering method (align="center" on parent <td>)

### Phase 3: Variable Completeness
For each logical element, verify presence of:
- [ ] DISPLAY_TOGGLE (\`@{if editor.shouldShow...}\`)
- [ ] SIZE variable for width
- [ ] INNER_SPACING variable for padding
- [ ] HEIGHT variable (NUMBER/HEIGHTV2/TEXT_SIZE)
- [ ] BORDER and BORDER_RADIUS where appropriate

### Phase 4: Standards Compliance
Verify:
- [ ] All images have alt attributes with \${editor.*} variables
- [ ] Text styles use TEXT_STYLES or SIMPLE_TEXT_STYLES
- [ ] Variable names follow conventions (no dashes, no Cyrillic)
- [ ] SIZE variables use formattedWidthAttribute/formattedWidthStyle
- [ ] Text in @{if} blocks has font-size and line-height

### Phase 5: Goal Alignment
Review the USER'S ORIGINAL GOAL and verify the HTML actually implements what was requested.

## CORRECTION RULES

If you find issues:
1. **Minor issues**: Fix silently (missing alt, wrong variable format)
2. **Structural issues**: Rebuild the affected section properly
3. **Missing mandatory controls**: Add them using correct syntax from Knowledge Base
4. **Logic errors**: Correct to match the user's goal

## OUTPUT FORMAT

Provide ONLY the corrected HTML code. No explanations, no markdown formatting, no preamble.

Start directly with the complete, corrected HTML.`;
}

/**
 * Main Step 1 builder that routes to generate or validate
 */
export function buildStep1(params: Step1Params): string {
  const hasHtml = params.html && params.html.trim().length > 0;
  
  if (hasHtml) {
    return buildStep1Validate(params);
  } else {
    return buildStep1Generate(params);
  }
}
