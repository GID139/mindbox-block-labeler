// Mindbox Prompts System v2.0
// Adaptive prompts based on input state (HTML/JSON presence)

import { MINDBOX_KB_CONTENT } from './knowledge-base/mindbox-kb-content';

/**
 * Determines the scenario based on what data is present
 */
export type Scenario = 
  | 'generate-from-scratch'  // No HTML, No JSON
  | 'validate-html-generate-json'  // HTML exists, JSON doesn't
  | 'validate-both';  // Both HTML and JSON exist

export function detectScenario(html: string, json: string): Scenario {
  const hasHtml = html.trim().length > 0;
  const hasJson = json.trim().length > 0;

  if (!hasHtml && !hasJson) {
    return 'generate-from-scratch';
  } else if (hasHtml && !hasJson) {
    return 'validate-html-generate-json';
  } else {
    return 'validate-both';
  }
}

// ============================================================================
// STEP 1: HTML GENERATION OR VALIDATION
// ============================================================================

interface Step1Params {
  goal: string;
  html?: string;  // Optional: if provided, will validate instead of generate
  isDynamicGrid: boolean;
  isEditable: boolean;
  settingsList: string;
}

/**
 * Step 1A: Generate HTML from scratch (when no HTML exists)
 */
export function buildStep1Generate({ goal, isDynamicGrid, isEditable, settingsList }: Step1Params): string {
  return `# STEP 1: HTML GENERATION FROM SCRATCH

## YOUR ROLE
You are an expert Mindbox email template developer. Your task is to generate complete, valid, production-ready HTML code based on the user's goal.

## KNOWLEDGE BASE (YOUR SINGLE SOURCE OF TRUTH)
${MINDBOX_KB_CONTENT}

## USER'S GOAL
${goal}

## TECHNICAL REQUIREMENTS

### Block Configuration
- **Dynamic Grid**: ${isDynamicGrid ? 'YES - Use @{for item in editor.collection} loops for product grids' : 'NO - Static block without dynamic content'}
- **Editable**: ${isEditable ? 'YES - All content must be editable via ${editor.*} variables' : 'NO - Static content, minimal variables'}

### Required Settings/Components
${settingsList || 'No specific requirements listed. Use your best judgment based on the goal.'}

## STRICT EXECUTION RULES

### Rule 1: Block Structure (NON-NEGOTIABLE)
Every logical block MUST follow this exact structure:

\`\`\`html
<!-- EDITOR_BLOCK_TEMPLATE: block_name_here -->
<!--[if mso | IE]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600">
<tr><td>
<![endif]-->

<table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
  <!-- Your block content here -->
</table>

<!--[if mso | IE]>
</td></tr></table>
<![endif]-->
\`\`\`

### Rule 2: Centering Method (MANDATORY)
To center any block:
\`\`\`html
<td align="center">
  <table width="\${editor.blockWidth.formattedWidthAttribute}" 
         style="\${editor.blockWidth.formattedWidthStyle};">
    <!-- Centered content -->
  </table>
</td>
\`\`\`

### Rule 3: Every Editable Element MUST Have (CHECKLIST)
For EACH logical element (image, text block, button), you MUST include:

✓ **DISPLAY_TOGGLE**: Wrap in \`@{if editor.shouldShow[ElementName]} ... @{end if}\`
✓ **SIZE**: Width control via SIZE variable
✓ **INNER_SPACING**: Padding control via INNER_SPACING variable
✓ **HEIGHT**: Use NUMBER, HEIGHTV2, or TEXT_SIZE as appropriate
✓ **BORDER & BORDER_RADIUS**: Where visually appropriate

### Rule 4: Variable Naming Convention
- Format: \`\${editor.descriptiveName}\`
- Use only: letters, numbers, underscore (_)
- NO dashes (-), NO Cyrillic
- Case-insensitive but use camelCase
- Must be unique within the block

### Rule 5: Images MUST Have
\`\`\`html
<img src="\${editor.imageName}" 
     alt="\${editor.imageNameAlt}"
     width="\${editor.imageNameSize.formattedWidthAttribute}"
     style="display: block; \${editor.imageNameSize.formattedWidthStyle};">
\`\`\`

### Rule 6: Text Elements
- Rich text (paragraphs): Use TEXT type → \`<div>\${editor.textContent}</div>\`
- Simple text (buttons, labels): Use SIMPLE_TEXT type → \`<span>\${editor.labelText}</span>\`
- Text styles: Always wrap in \`<div style="\${editor.textStyles}">\${editor.textContent}</div>\`

### Rule 7: Default Values to Use
When you need to set defaults in your mental model:
- SIZE: "manual 100 *"
- BACKGROUND: { "type": "color", "color": "#39AA5D" }
- IMAGE URL: "https://mindbox.ru/build/assets/images/mb-fav_marketing_green-Ds-aOpBM.svg"
- TEXT_STYLES fallbackFont: "Helvetica"

## VALIDATION CHECKLIST (SELF-CHECK BEFORE OUTPUT)

Before providing your output, verify:

1. [ ] Each block starts with \`<!-- EDITOR_BLOCK_TEMPLATE: unique_name -->\`
2. [ ] Ghost tables (\`<!--[if mso | IE]>\`) wrap each block
3. [ ] All images have non-empty alt attributes
4. [ ] Every editable element is wrapped in \`@{if editor.shouldShow...}\`
5. [ ] All \${editor.*} variables follow naming rules
6. [ ] Centering uses align="center" on parent <td>
7. [ ] Text within @{if} has font-size and line-height defined

## OUTPUT FORMAT

Provide ONLY the complete HTML code. No explanations, no markdown formatting, no comments outside the HTML itself.

Start directly with the HTML code.`;
}

/**
 * Step 1B: Validate existing HTML (when HTML exists but JSON doesn't)
 */
export function buildStep1Validate({ goal, html, isDynamicGrid, isEditable, settingsList }: Step1Params): string {
  return `# STEP 1: HTML VALIDATION AND CORRECTION

## YOUR ROLE
You are an expert Mindbox email template validator. Your task is to thoroughly validate the provided HTML code against Mindbox standards and correct any issues.

## KNOWLEDGE BASE (YOUR SINGLE SOURCE OF TRUTH)
${MINDBOX_KB_CONTENT}

## USER'S ORIGINAL GOAL
${goal}

## EXISTING HTML CODE TO VALIDATE
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

// ============================================================================
// STEP 2: JSON GENERATION OR VALIDATION
// ============================================================================

interface Step2Params {
  html: string;
  json?: string;  // Optional: if provided, will validate instead of generate
}

/**
 * Step 2A: Generate JSON from HTML (when no JSON exists)
 */
export function buildStep2Generate({ html }: Step2Params): string {
  return `# STEP 2: JSON CONFIGURATION GENERATION

## YOUR ROLE
You are an expert Mindbox JSON configuration generator. Your task is to analyze the provided HTML code and generate a complete, valid JSON settings file that exposes all editable parameters to the Mindbox email editor interface.

## KNOWLEDGE BASE (YOUR SINGLE SOURCE OF TRUTH)
${MINDBOX_KB_CONTENT}

## HTML CODE TO ANALYZE
\`\`\`html
${html}
\`\`\`

## EXECUTION ALGORITHM

### Step 1: Extract All Variables
Scan the HTML and create a complete list of ALL unique \${editor.*} variable names.

Include variables from:
- Content: \${editor.text}, \${editor.image}, \${editor.url}
- Conditions: @{if editor.shouldShowButton}
- Styles: style="\${editor.textStyles}"
- Attributes: width="\${editor.size.formattedWidthAttribute}"

### Step 2: Determine Type for Each Variable
Use this STRICT decision tree for each variable:

\`\`\`
IF variable name starts with "shouldShow" → DISPLAY_TOGGLE

ELSE IF variable is in @{if ...} condition → DISPLAY_TOGGLE

ELSE IF variable is in style="padding: ..." → INNER_SPACING

ELSE IF variable is in style="border-radius: ..." → BORDER_RADIUS

ELSE IF variable is full style attribute on text element → TEXT_STYLES or SIMPLE_TEXT_STYLES

ELSE IF variable is in style="color: ..." or bgcolor → COLOR

ELSE IF variable is in style="background-..." → BACKGROUND

ELSE IF variable ends with .formattedWidthAttribute → SIZE

ELSE IF variable ends with .formattedHeight → HEIGHTV2

ELSE IF variable ends with .containerStyle → TEXT_SIZE

ELSE IF variable is used for button dimensions → BUTTON_SIZE

ELSE IF variable is in <img src="..."> → IMAGE

ELSE IF variable is in <img alt="..."> → ALT

ELSE IF variable is in <a href="..."> → URL

ELSE IF variable contains multiple lines of text → TEXT

ELSE IF variable is short single-line text → SIMPLE_TEXT

ELSE → Use context and variable name to infer the most logical type
\`\`\`

### Step 3: Build JSON Object for Each Variable
For each variable, create a JSON object using the EXACT template from the Knowledge Base:

Required fields for ALL types:
\`\`\`json
{
  "name": "exactVariableNameFromHTML",
  "type": "DETERMINED_TYPE",
  "defaultValue": <use mandatory default from Knowledge Base>,
  "group": "Logical Group Name >> Subgroup",
  "extra": {
    "label": "User-Friendly Label"
  }
}
\`\`\`

### Step 4: Apply Mandatory Defaults
Use these defaults (from Knowledge Base Section [A]):

- **SIZE**: \`"manual 100 *"\`
- **BACKGROUND**: \`{ "type": "color", "color": "#39AA5D" }\`
- **IMAGE**: \`"https://mindbox.ru/build/assets/images/mb-fav_marketing_green-Ds-aOpBM.svg"\`
- **TEXT_STYLES/SIMPLE_TEXT_STYLES**: Must include \`"fallbackFont": "Helvetica"\`
- **DISPLAY_TOGGLE**: String \`"true"\` or \`"false"\` (NOT boolean)
- **BORDER**: \`"none"\` or \`"solid black 2"\`
- **BORDER_RADIUS**: \`"25 25 25 25"\`
- **INNER_SPACING**: \`"10 25 10 25"\`
- **HEIGHTV2**: \`"100 100"\`
- **TEXT_SIZE**: \`"30 30"\`
- **BUTTON_SIZE**: \`{ "width": "pixels 100 80", "height": "50 40" }\`

### Step 5: Organize Into Logical Groups
Group related settings together using nested group names:

Good examples:
- \`"Settings >> Header >> Logo"\`
- \`"Settings >> Header >> Title"\`
- \`"Settings >> Button >> Appearance"\`
- \`"Settings >> Button >> Text"\`

Bad examples:
- \`"Settings"\` (too generic)
- \`"Logo"\` (no hierarchy)

### Step 6: Validate Allowed Values
For complex types, ensure all nested values are from allowed lists:

**TEXT_STYLES / SIMPLE_TEXT_STYLES:**
- font: Must be from allowed fonts list (Arial, Helvetica, Roboto, etc.)
- lineHeight: Must be "1.0", "1.15", "1.5", or "2.0"
- inscription: Array with "bold", "italic", "underlined", "crossed" or []

**BACKGROUND:**
- type: "transparent", "color", or "image"
- mode (if image): "contain", "cover", "repeat", or "stretch"

**BUTTON_SIZE:**
- width type: "pixels" or "percent"

### Step 7: Final Validation Checklist
Before output, verify:
- [ ] Every variable from HTML has a JSON object
- [ ] All defaultValue types match the control type
- [ ] DISPLAY_TOGGLE values are strings, not booleans
- [ ] Complex objects have all required nested fields
- [ ] All values are from allowed lists where applicable
- [ ] Every object has group and extra.label
- [ ] Groups use nested naming (>> separator)
- [ ] JSON is valid (no trailing commas, proper brackets)

## OUTPUT FORMAT

Provide ONLY the JSON array. No explanations, no markdown code blocks, no preamble.

Start directly with the opening bracket [ and end with closing bracket ].`;
}

/**
 * Step 2B: Validate existing JSON (when both HTML and JSON exist)
 */
export function buildStep2Validate({ html, json }: Step2Params): string {
  return `# STEP 2: JSON CONFIGURATION VALIDATION

## YOUR ROLE
You are an expert Mindbox JSON validator. Your task is to validate the provided JSON configuration against the HTML code and Mindbox standards, then correct any issues.

## KNOWLEDGE BASE (YOUR SINGLE SOURCE OF TRUTH)
${MINDBOX_KB_CONTENT}

## HTML CODE (REFERENCE)
\`\`\`html
${html}
\`\`\`

## JSON CONFIGURATION TO VALIDATE
\`\`\`json
${json}
\`\`\`

## VALIDATION PROTOCOL

### Phase 1: JSON Syntax Validation
Check for:
- [ ] Valid JSON syntax (no trailing commas)
- [ ] Proper bracket/brace closure
- [ ] Correct string quoting

**HALT CONDITION**: If JSON is syntactically invalid, STOP HERE and output corrected JSON only.

### Phase 2: Type Validation
For each JSON object, verify:
- [ ] "type" field exists and is a valid Mindbox type
- [ ] "name" field exists and matches HTML variable name exactly
- [ ] "defaultValue" exists and is correct data type for the control type

Common type errors to fix:
- ❌ DISPLAY_TOGGLE with boolean defaultValue → ✅ Must be string "true" or "false"
- ❌ SIZE without "manual 100 *" → ✅ Must use mandatory default
- ❌ BACKGROUND without correct structure → ✅ Must be { "type": "color", "color": "#39AA5D" }
- ❌ TEXT_STYLES without "fallbackFont" → ✅ Must include "fallbackFont": "Helvetica"

### Phase 3: Completeness Check (HTML → JSON)
Extract all \${editor.*} variables from HTML.

For each variable:
- [ ] Verify a corresponding JSON object exists
- [ ] If missing, ADD it using correct template and defaults

### Phase 4: Synchronization Check (JSON → HTML)
For each JSON object:
- [ ] Verify the variable is actually used in the HTML
- [ ] If not used, REMOVE it from JSON or flag as unused

### Phase 5: Allowed Values Validation
Verify all values are from allowed lists:

**Fonts**: Only use allowed fonts from Knowledge Base
**Line Heights**: Only "1.0", "1.15", "1.5", "2.0"
**COLLECTION types**: Only allowed collection values
**BACKGROUND modes**: Only "contain", "cover", "repeat", "stretch"
**BUTTON_SIZE width types**: Only "pixels" or "percent"

### Phase 6: Structure Validation
Verify:
- [ ] Every object has "group" field
- [ ] Every object has "extra.label" field
- [ ] Groups use nested structure ("Settings >> Subsection")
- [ ] Labels are user-friendly (not technical variable names)

### Phase 7: Mandatory Controls Audit
For each logical element in HTML, verify JSON has:
- [ ] DISPLAY_TOGGLE (shouldShow...)
- [ ] SIZE (width)
- [ ] INNER_SPACING (padding)
- [ ] HEIGHT (NUMBER/HEIGHTV2/TEXT_SIZE)
- [ ] BORDER and BORDER_RADIUS (where appropriate)

## CORRECTION STRATEGY

**Minor issues**: Fix silently (wrong data type, missing fallbackFont)
**Missing variables**: Add using correct template and mandatory defaults
**Unused variables**: Remove from JSON
**Wrong types**: Change to correct type based on HTML usage
**Invalid values**: Replace with nearest allowed value

## OUTPUT FORMAT

Provide ONLY the corrected JSON array. No explanations, no markdown code blocks, no preamble.

Start directly with the opening bracket [ and end with closing bracket ].`;
}

/**
 * Main Step 2 builder that routes to generate or validate
 */
export function buildStep2(params: Step2Params): string {
  const hasJson = params.json && params.json.trim().length > 0;
  
  if (hasJson) {
    return buildStep2Validate(params);
  } else {
    return buildStep2Generate(params);
  }
}

// ============================================================================
// STEP 3: DEBUGGING AND SYNCHRONIZATION (ALWAYS RUNS)
// ============================================================================

interface Step3Params {
  goal: string;
  html: string;
  json: string;
  quickFix: boolean;
}

/**
 * Step 3: Final debugging, synchronization, and quality assurance
 * This step ALWAYS runs regardless of scenario
 */
export function buildStep3({ goal, html, json, quickFix }: Step3Params): string {
  return `# STEP 3: FINAL DEBUGGING AND SYNCHRONIZATION

## YOUR ROLE
You are a senior Mindbox quality assurance engineer. Your task is to perform a comprehensive final audit of both HTML and JSON files, ensure perfect synchronization, and verify they meet the user's original goal.

## KNOWLEDGE BASE (YOUR SINGLE SOURCE OF TRUTH)
${MINDBOX_KB_CONTENT}

## USER'S ORIGINAL GOAL
${goal}

## HTML CODE TO AUDIT
\`\`\`html
${html}
\`\`\`

## JSON CONFIGURATION TO AUDIT
\`\`\`json
${json}
\`\`\`

## EXECUTION PROTOCOL

### PHASE 1: SYNTAX VALIDATION (CRITICAL)

#### HTML Syntax Check
- [ ] All tags are properly closed
- [ ] No broken \${editor.*} variables
- [ ] All @{if} blocks have matching @{end if}
- [ ] No syntax errors that would break rendering

#### JSON Syntax Check
- [ ] Valid JSON (no trailing commas)
- [ ] All brackets and braces balanced
- [ ] Proper string escaping

**CRITICAL HALT**: If you find fatal syntax errors, STOP ALL OTHER CHECKS. Fix syntax errors only and output corrected files with a report listing only the syntax issues.

---

### PHASE 2: KNOWLEDGE BASE COMPLIANCE AUDIT

#### A. HTML Standards Checklist
- [ ] Each block has \`<!-- EDITOR_BLOCK_TEMPLATE: name -->\` header
- [ ] Each block wrapped in ghost tables for Outlook
- [ ] All images have non-empty alt attributes
- [ ] Text within @{if} has font-size and line-height defined
- [ ] Centering uses align="center" on parent <td> with SIZE-controlled inner table
- [ ] All \${editor.*} variables follow naming rules (no dashes, no Cyrillic)

#### B. JSON Standards Checklist
- [ ] All "type" values are valid Mindbox types from Knowledge Base
- [ ] All "defaultValue" fields use correct data types
- [ ] DISPLAY_TOGGLE values are strings ("true"/"false"), NOT booleans
- [ ] SIZE defaultValue is "manual 100 *"
- [ ] BACKGROUND defaultValue is { "type": "color", "color": "#39AA5D" }
- [ ] IMAGE defaultValue is Mindbox standard URL
- [ ] TEXT_STYLES/SIMPLE_TEXT_STYLES include "fallbackFont": "Helvetica"
- [ ] All fonts are from allowed fonts list
- [ ] All lineHeight values are from allowed list ("1.0", "1.15", "1.5", "2.0")
- [ ] Every object has "group" and "extra.label" fields
- [ ] Groups use nested structure

#### C. Mandatory Controls Audit
For EACH logical element (image, text block, button, container):
- [ ] Has DISPLAY_TOGGLE in HTML (\`@{if editor.shouldShow...}\`)
- [ ] Has DISPLAY_TOGGLE in JSON (type: "DISPLAY_TOGGLE")
- [ ] Has SIZE control for width
- [ ] Has INNER_SPACING control for padding
- [ ] Has HEIGHT control (NUMBER/HEIGHTV2/TEXT_SIZE)
- [ ] Has BORDER and BORDER_RADIUS where visually appropriate

---

### PHASE 3: SYNCHRONIZATION AUDIT (CRITICAL)

#### HTML → JSON Direction
1. Extract ALL \${editor.*} variables from HTML
2. For each variable:
   - [ ] Verify matching JSON object exists (exact name match)
   - [ ] If missing: **ADD to JSON** using correct type and defaults

#### JSON → HTML Direction
1. Extract ALL "name" values from JSON array
2. For each name:
   - [ ] Verify variable is used somewhere in HTML
   - [ ] If not used: **REMOVE from JSON** (unused variable)

#### Special Cases
- Variables like \`.formattedWidthAttribute\` in HTML should match \`SIZE\` object in JSON
- Variables like \`.formattedHeight\` in HTML should match \`HEIGHTV2\` object in JSON
- Variables like \`.containerStyle\` in HTML should match \`TEXT_SIZE\` object in JSON
- Style variables like \`\${editor.textStyles}\` should match \`TEXT_STYLES\` or \`SIMPLE_TEXT_STYLES\` in JSON

---

### PHASE 4: GOAL CONFORMANCE VERIFICATION

Review the **USER'S ORIGINAL GOAL** at the top of this prompt.

Ask yourself:
1. Does the HTML structure actually implement what the user requested?
2. Are all requested features present and editable?
3. Are there any logical errors or misinterpretations?

If the code doesn't match the goal:
- Identify what's wrong
- Correct it
- Note it in your report

---

### PHASE 5: GENERATE CORRECTED FILES AND REPORT

Based on all findings:

1. **Generate corrected HTML** (if any issues found)
2. **Generate corrected JSON** (if any issues found)
3. **Generate detailed report** using this exact format:

${quickFix ? `
## QUICK FIX MODE
You are in quick fix mode. Provide ONLY the corrected HTML and JSON files.
DO NOT generate a detailed report.
Output format:
- First, the complete corrected HTML
- Then "---JSON---" on a line by itself
- Then the complete corrected JSON
` : `
For each issue found, use this markdown structure:

---
#### Issue #N: [Brief Title]
* **Problem**: Describe what was wrong
* **Solution**: Describe what you changed
* **Rationale**: Explain why, referencing Knowledge Base section if applicable

Example:
---
#### Issue #1: Missing fallbackFont in Title Styles
* **Problem**: The \`titleTextStyles\` JSON object of type TEXT_STYLES did not include the \`fallbackFont\` property.
* **Solution**: Added \`"fallbackFont": "Helvetica"\` to the defaultValue object.
* **Rationale**: According to Knowledge Base Section [A], all TEXT_STYLES and SIMPLE_TEXT_STYLES objects MUST include fallbackFont set to "Helvetica" for proper email client compatibility.

---
#### Issue #2: Unused JSON Variable
* **Problem**: The JSON contains a variable \`editor.oldFeature\` that is not used anywhere in the HTML.
* **Solution**: Removed the JSON object for \`oldFeature\`.
* **Rationale**: JSON should only contain variables that are actually used in the HTML to avoid clutter in the editor interface.
`}

## OUTPUT FORMAT

${quickFix ? `
Output the corrected HTML, followed by "---JSON---", followed by the corrected JSON.

No explanations, no markdown code blocks.
` : `
Your output MUST contain exactly three sections in this order:

### 1. CORRECTED HTML
\`\`\`html
[complete corrected HTML here]
\`\`\`

### 2. CORRECTED JSON
\`\`\`json
[complete corrected JSON array here]
\`\`\`

### 3. DETAILED REPORT
[Use the markdown format specified above for each issue]

If NO issues were found, output:
- The original HTML unchanged
- The original JSON unchanged
- Report: "✅ No issues found. Code is fully compliant with Mindbox standards."
`}`;
}

// ============================================================================
// HELPER: Get Human-Readable Step Name
// ============================================================================

export function getStepName(step: number, scenario: Scenario): string {
  if (step === 1) {
    return scenario === 'generate-from-scratch' || scenario === 'validate-html-generate-json'
      ? 'Generating HTML structure...'
      : 'Validating HTML code...';
  } else if (step === 2) {
    return scenario === 'validate-both'
      ? 'Validating JSON configuration...'
      : 'Generating JSON configuration...';
  } else if (step === 3) {
    return 'Final debugging and synchronization...';
  }
  return `Step ${step}`;
}

// ============================================================================
// HELPER: Get Full Pipeline Description
// ============================================================================

export function getPipelineDescription(scenario: Scenario): string {
  const descriptions: Record<Scenario, string> = {
    'generate-from-scratch': 'Step 1: Generate HTML → Step 2: Generate JSON → Step 3: Debug & Sync',
    'validate-html-generate-json': 'Step 1: Validate HTML → Step 2: Generate JSON → Step 3: Debug & Sync',
    'validate-both': 'Step 1: Validate HTML → Step 2: Validate JSON → Step 3: Debug & Sync'
  };
  return descriptions[scenario];
}
