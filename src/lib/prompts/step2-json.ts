// Step 2: JSON Configuration Generation and Validation
import type { Step2Params } from './shared-types';
import { SHARED_KB } from './kb/shared';
import { CORE_TYPES_KB } from './kb/core-types';
import { JSON_STRUCTURE_KB } from './kb/json-structure';
import { VALIDATION_CHECKLISTS } from './kb/validation-checklists';

/**
 * Step 2A: Generate JSON from HTML (when no JSON exists)
 */
export function buildStep2Generate({ html, visualHtml }: Step2Params): string {
  return `# STEP 2: JSON CONFIGURATION GENERATION

## YOUR ROLE
You are an expert Mindbox JSON configuration generator. Your task is to analyze the provided HTML code and generate a complete, valid JSON settings file that exposes all editable parameters to the Mindbox email editor interface.

## KNOWLEDGE BASE (YOUR SINGLE SOURCE OF TRUTH)

${SHARED_KB}

${CORE_TYPES_KB}

${JSON_STRUCTURE_KB}

${visualHtml ? `## VISUAL REFERENCE (HOW THE BLOCK LOOKS)
This is the visual template showing how the block appears with real values:

\`\`\`html
${visualHtml}
\`\`\`

Use this as a reference to understand the visual structure and design intent.

` : ''}## EDITOR HTML CODE TO ANALYZE
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
Use the Type Detection Decision Tree from the JSON Structure Knowledge Base above.

### Step 3: Build JSON Object for Each Variable
For each variable, create a JSON object with all required fields as defined in JSON_STRUCTURE_KB.

### Step 4: Apply Mandatory Defaults
Use the defaults specified in CORE_TYPES_KB section "Mandatory Default Values".

### Step 5: Organize Into Logical Groups
Group related settings together using nested group names as defined in JSON_STRUCTURE_KB.

### Step 6: Validate Allowed Values
Ensure all nested values are from allowed lists (fonts, line heights, background modes, etc.)

### Step 7: Final Validation Checklist

${VALIDATION_CHECKLISTS}

Before output, verify all items in the JSON Validation Checklist.

## OUTPUT FORMAT

Provide ONLY the JSON array. No explanations, no markdown code blocks, no preamble.

Start directly with the opening bracket [ and end with closing bracket ].`;
}

/**
 * Step 2B: Validate existing JSON (when both HTML and JSON exist)
 */
export function buildStep2Validate({ html, visualHtml, json }: Step2Params): string {
  return `# STEP 2: JSON CONFIGURATION VALIDATION

## YOUR ROLE
You are an expert Mindbox JSON validator. Your task is to validate the provided JSON configuration against the HTML code and Mindbox standards, then correct any issues.

## KNOWLEDGE BASE (YOUR SINGLE SOURCE OF TRUTH)

${SHARED_KB}

${CORE_TYPES_KB}

${JSON_STRUCTURE_KB}

${visualHtml ? `## VISUAL REFERENCE (HOW THE BLOCK LOOKS)
\`\`\`html
${visualHtml}
\`\`\`

` : ''}## EDITOR HTML CODE (REFERENCE)
\`\`\`html
${html}
\`\`\`

## JSON CONFIGURATION TO VALIDATE
\`\`\`json
${json}
\`\`\`

## VALIDATION PROTOCOL

${VALIDATION_CHECKLISTS}

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

Use the Common Errors reference from VALIDATION_CHECKLISTS to identify and fix type errors.

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
Verify all values are from allowed lists (refer to SHARED_KB for allowed values).

### Phase 6: Structure Validation
Verify:
- [ ] Every object has "group" field
- [ ] Every object has "extra.label" field
- [ ] Groups use nested structure ("Settings >> Subsection")
- [ ] Labels are user-friendly (not technical variable names)

### Phase 7: Mandatory Controls Audit
For each logical element in HTML, verify JSON has all required controls as defined in SYNC_RULES_KB.

## OUTPUT FORMAT

Provide ONLY the corrected JSON array. No explanations, no markdown, no preamble.

Start directly with [ and end with ].`;
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
