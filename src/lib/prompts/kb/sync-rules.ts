// Synchronization rules between HTML and JSON

export const SYNC_RULES_KB = `## HTML-JSON Synchronization Rules

### For Every Logical Element in HTML
The JSON MUST include controls for:

1. **DISPLAY_TOGGLE** control (shouldShow...)
2. **SIZE** control for width  
3. **INNER_SPACING** control for padding
4. **HEIGHT** control (NUMBER/HEIGHTV2/TEXT_SIZE)
5. **BORDER** and **BORDER_RADIUS** where appropriate

### Variable Synchronization Requirements

**HTML → JSON Direction:**
- Every \${editor.*} variable in HTML must have a corresponding JSON object
- Variable names must match exactly
- Complex variables (.formattedWidthAttribute, .formattedHeight) must map to correct control types

**JSON → HTML Direction:**
- Every JSON object should be used in the HTML
- Unused JSON objects should be removed or flagged
- Variables in JSON must exist in HTML

### Synchronization Checklist
- [ ] All HTML variables have JSON definitions
- [ ] All JSON variables are used in HTML
- [ ] Variable names match exactly (case-sensitive)
- [ ] Complex variable suffixes map correctly:
  - .formattedWidthAttribute → SIZE
  - .formattedWidthStyle → SIZE
  - .formattedHeight → HEIGHTV2
  - .containerStyle → TEXT_SIZE
  - .containerHeightAttribute → TEXT_SIZE
- [ ] DISPLAY_TOGGLE conditions match JSON variable names
- [ ] Collection variables have COLLECTION type in JSON
- [ ] Role parameters HAVE defaultValue (sample data), but will be replaced by dynamic collection data at runtime`;
