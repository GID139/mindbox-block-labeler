// JSON structure rules and type mapping

export const JSON_STRUCTURE_KB = `## JSON Structure Rules

### Required Fields for ALL Types
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

### Grouping Guidelines
Group related settings together using nested group names:

Good examples:
- \`"Settings >> Header >> Logo"\`
- \`"Settings >> Header >> Title"\`
- \`"Settings >> Button >> Appearance"\`
- \`"Settings >> Button >> Text"\`

Bad examples:
- \`"Settings"\` (too generic)
- \`"Logo"\` (no hierarchy)

### Type Detection Decision Tree

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

### Mandatory JSON Rules
1. Every parameter MUST have "group" and "extra.label"
2. Use nested groups: "Settings >> Section" (max 2 levels, NOT 3+)
3. DISPLAY_TOGGLE values are STRINGS not booleans
4. All complex objects must include ALL required nested fields
5. Fonts must be from allowed list
6. Line heights must be "1.0", "1.15", "1.5", or "2.0"
7. No trailing commas in JSON
8. Proper bracket/brace closure
9. NEVER use "role": null - omit "role" field entirely if not needed
10. SIZE defaultValue format: "manual [percent] [max_width_px]" (e.g., "manual 100 600")

### CRITICAL: Variable Naming to Avoid 3-Dot Notation

Mindbox API allows max 2 dots in variable paths: \`\${editor.variableName.method}\`

**FORBIDDEN patterns that create 3 dots:**
- ❌ name: "containerSize" + type: SIZE → \`\${editor.containerSize.formattedWidthAttribute}\` (3 dots!)
- ❌ name: "background" + accessing nested ".color" → \`\${editor.background.color}\` (3 dots!)
- ❌ name: "buttonSize" + type: BUTTON_SIZE → \`\${editor.buttonSize.formattedWidthAttribute}\` (3 dots!)

**CORRECT patterns (max 2 dots):**
- ✅ name: "containerWidth" + type: SIZE → \`\${editor.containerWidth.formattedWidthAttribute}\` (2 dots)
- ✅ name: "containerBackground" + type: COLOR → \`\${editor.containerBackground}\` (1 dot)
- ✅ name: "buttonWidth" + type: BUTTON_SIZE → \`\${editor.buttonWidth.formattedWidthAttribute}\` (2 dots)

**Naming rules by type:**
1. **SIZE** → use \`*Width\` suffix (e.g., \`blockWidth\`, \`imageWidth\`)
2. **HEIGHTV2** → use \`*Height\` suffix (e.g., \`blockHeight\`, \`imageHeight\`)
3. **BUTTON_SIZE** → use \`*ButtonWidth\` / \`*ButtonHeight\` (e.g., \`ctaButtonWidth\`)
4. **BACKGROUND/COLOR** → use flat \`*Background\` / \`*Color\` WITHOUT nested properties (e.g., \`containerBackground\`, NOT \`container.background.color\`)
5. **TEXT_SIZE** → use \`*TextHeight\` suffix (e.g., \`titleTextHeight\`)

**Auto-check before finalizing JSON:**
- [ ] No variable names that would create 3+ dots when used in HTML
- [ ] All SIZE types use \`*Width\` naming (not \`*Size\`)
- [ ] All HEIGHTV2 types use \`*Height\` naming
- [ ] All BACKGROUND/COLOR types are flat (no nested property access)
- [ ] No "role": null in any parameter`;
