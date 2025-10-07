// Step 3: Debugging and Synchronization
import type { Step3Params } from './shared-types';
import { SHARED_KB } from './kb/shared';
import { HTML_RULES_KB } from './kb/html-rules';
import { CORE_TYPES_KB } from './kb/core-types';
import { JSON_STRUCTURE_KB } from './kb/json-structure';
import { SYNC_RULES_KB } from './kb/sync-rules';
import { VALIDATION_CHECKLISTS } from './kb/validation-checklists';

/**
 * Step 3: Comprehensive debugging and synchronization
 * This step always runs and has access to all KB modules
 */
export function buildStep3({ goal, html, visualHtml, json, quickFix = false }: Step3Params): string {
  return `# STEP 3: DEBUGGING & SYNCHRONIZATION

## YOUR ROLE
You are an expert Mindbox quality assurance engineer. Your task is to perform a comprehensive final check of both HTML and JSON, ensuring perfect synchronization and compliance with all Mindbox standards.

## KNOWLEDGE BASE (COMPLETE REFERENCE)

${SHARED_KB}

${CORE_TYPES_KB}

${HTML_RULES_KB}

${JSON_STRUCTURE_KB}

${SYNC_RULES_KB}

${VALIDATION_CHECKLISTS}

## USER'S ORIGINAL GOAL
${goal}

${visualHtml ? `## VISUAL REFERENCE
\`\`\`html
${visualHtml}
\`\`\`

` : ''}## CURRENT EDITOR HTML
\`\`\`html
${html}
\`\`\`

## CURRENT JSON CONFIGURATION
\`\`\`json
${json}
\`\`\`

## EXECUTION MODE
${quickFix ? '**QUICK FIX MODE**: Focus on critical errors only. Skip minor formatting issues.' : '**FULL VALIDATION MODE**: Perform comprehensive check of all aspects.'}

## COMPREHENSIVE VALIDATION PROTOCOL

### Stage 1: Cross-Reference Validation
1. Extract all \${editor.*} variables from HTML
2. Extract all "name" fields from JSON
3. Compare and identify:
   - Variables in HTML but missing in JSON → ADD to JSON
   - Variables in JSON but not used in HTML → REMOVE from JSON or mark as warning
   - Variables with naming mismatches → FIX to match

### Stage 2: HTML Deep Dive
Run all checks from HTML Validation Checklist:
- [ ] Block structure compliance
- [ ] Ghost tables present
- [ ] Variable syntax correctness
- [ ] Mandatory controls for each element
- [ ] Proper centering implementation
- [ ] Image alt attributes
- [ ] Text styling compliance

### Stage 3: JSON Deep Dive
Run all checks from JSON Validation Checklist:
- [ ] Syntax validity
- [ ] Type correctness
- [ ] Default values compliance
- [ ] Allowed values validation
- [ ] Group structure
- [ ] Label quality

### Stage 4: Synchronization Audit
Run all checks from Synchronization Validation Checklist:
- [ ] HTML-JSON variable mapping
- [ ] Control completeness
- [ ] Type matching (SIZE, HEIGHTV2, TEXT_SIZE, etc.)
- [ ] DISPLAY_TOGGLE consistency
- [ ] Collection and role parameter alignment

### Stage 5: Goal Alignment Check
Review the USER'S ORIGINAL GOAL and verify:
- [ ] HTML implements the requested functionality
- [ ] JSON exposes appropriate editor controls
- [ ] Design matches user expectations
- [ ] No unnecessary complexity added

### Stage 6: Standards Compliance
Final check against all mandatory rules:
- [ ] All DISPLAY_TOGGLE values are strings ("true" or "false", NOT booleans)
- [ ] All SIZE controls use "manual [percent] [max_px]" format (e.g., "manual 100 600")
- [ ] All TEXT_STYLES include fallbackFont
- [ ] All BACKGROUND objects have correct structure
- [ ] All fonts from allowed list
- [ ] All line heights from allowed values
- [ ] No Cyrillic or dashes in variable names
- [ ] **CRITICAL**: No "role": null in JSON (omit field entirely if not needed)
- [ ] **CRITICAL**: Groups max 2 levels ("Settings >> Section", NOT 3+ levels)
- [ ] **CRITICAL**: No 3-dot notation in HTML variables
- [ ] **CRITICAL**: BACKGROUND variables use \`.background\` method (NOT direct usage)

## CORRECTION STRATEGY

### Priority 1: Critical Errors (Always Fix)
- Syntax errors in HTML or JSON
- Missing mandatory controls
- Type mismatches
- Synchronization failures
- Invalid variable names
- **3-dot notation violations**: Rename variables (e.g., containerSize → containerWidth)
- **"role": null in JSON**: Remove "role" field entirely
- **Wrong SIZE format**: Change to "manual [percent] [max_px]"
- **Nested color access**: Flatten variables (e.g., background.color → backgroundColor)
- **Deep group hierarchies**: Simplify to max 2 levels
- **Direct BACKGROUND usage**: Replace \${editor.varName} with \${editor.varName.background}

### Priority 2: Standard Compliance (Fix Unless Quick Mode)
- Missing ghost tables
- Incorrect default values
- Non-optimal grouping
- Missing labels

### Priority 3: Optimization (Fix Only in Full Mode)
- Better variable naming
- Improved group organization
- Enhanced user labels

## OUTPUT FORMAT

You must provide TWO outputs:

### OUTPUT 1: CORRECTED HTML
\`\`\`html
[Complete corrected HTML code]
\`\`\`

### OUTPUT 2: CORRECTED JSON
\`\`\`json
[Complete corrected JSON array]
\`\`\`

Provide both outputs with clear separation. No additional explanations needed.`;
}
