// Validation checklists for HTML and JSON

export const VALIDATION_CHECKLISTS = `## Validation Checklists

### HTML Validation Checklist
- [ ] EDITOR_BLOCK_TEMPLATE header present with unique name
- [ ] Ghost tables for Outlook (\`<!--[if mso | IE]>\`)
- [ ] All HTML tags properly closed
- [ ] All images have alt attributes
- [ ] Text in @{if} blocks has font-size and line-height
- [ ] Centering uses correct method (align="center" + inner table)
- [ ] Variables follow naming rules (no dashes, no Cyrillic)
- [ ] All \${editor.*} variables use valid syntax
- [ ] @{if} / @{end if} constructs properly formed
- [ ] Required attributes present (alt on images, href on links)
- [ ] Table-based layout (not divs)

### JSON Validation Checklist
- [ ] Valid JSON syntax (no trailing commas)
- [ ] All types are valid Mindbox types
- [ ] DISPLAY_TOGGLE values are strings, not booleans
- [ ] SIZE has "manual 100 *" or equivalent
- [ ] BACKGROUND has correct structure
- [ ] TEXT_STYLES has fallbackFont field
- [ ] All fonts from allowed list
- [ ] All lineHeights are "1.0", "1.15", "1.5", or "2.0"
- [ ] Every object has "group" field
- [ ] Every object has "extra.label" field
- [ ] Groups use nested structure ("Settings >> Subsection")
- [ ] Labels are user-friendly (not technical variable names)
- [ ] Complex objects have all required nested fields
- [ ] BUTTON_SIZE width type is "pixels" or "percent"
- [ ] BACKGROUND mode is from allowed list
- [ ] No unused variables

### Synchronization Validation Checklist
- [ ] Every HTML variable has JSON object
- [ ] Every JSON object used in HTML
- [ ] Variable names match exactly
- [ ] Complex variables (.formattedWidth) map to correct types
- [ ] DISPLAY_TOGGLE conditions exist for all shouldShow* variables
- [ ] All mandatory controls present for each element
- [ ] Collection types match between HTML and JSON
- [ ] Role parameters properly configured

### Common Errors to Fix

**Type Errors:**
- ❌ DISPLAY_TOGGLE with boolean defaultValue → ✅ Must be string "true" or "false"
- ❌ SIZE without "manual 100 *" → ✅ Must use mandatory default
- ❌ BACKGROUND without correct structure → ✅ Must be { "type": "color", "color": "#39AA5D" }
- ❌ TEXT_STYLES without "fallbackFont" → ✅ Must include "fallbackFont": "Helvetica"

**Structure Errors:**
- ❌ Missing EDITOR_BLOCK_TEMPLATE → ✅ Add block header
- ❌ Missing ghost tables → ✅ Add Outlook wrappers
- ❌ Div-based centering → ✅ Use table-based centering
- ❌ Missing alt on images → ✅ Add alt with variable

**Variable Errors:**
- ❌ Variable with dashes (my-var) → ✅ Use camelCase (myVar)
- ❌ Cyrillic variable names → ✅ Use Latin letters only
- ❌ Unused variables in JSON → ✅ Remove or verify usage`;
