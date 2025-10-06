// Shared KB constants used across all steps

export const SHARED_KB = `## Priority Hierarchy

This knowledge base follows a strict priority hierarchy for conflict resolution:

* **[A] Priority Level A**: Normative standards (Knowledge Base) - HIGHEST PRIORITY
* **[B] Priority Level B**: Generation & debugging prompts - MEDIUM PRIORITY  
* **[C] Priority Level C**: Documentation examples & patterns - LOWEST PRIORITY

**Rule:** When information conflicts, always follow: A > B > C

## Variable Naming Rules

- Format: \${editor.descriptiveName}
- Only: letters, numbers, underscore (_)
- NO dashes (-), NO Cyrillic
- Case-insensitive but use camelCase
- Must be unique within the block

## Allowed Values Reference

### Fonts
Arial, Helvetica, Roboto, Open Sans, Montserrat, Inter, Geneva, Times New Roman, Verdana, Courier / Courier New, Tahoma, Georgia, Palatino, Trebuchet MS

### Line Heights
1.0, 1.15, 1.5, 2.0 (ONLY these values)

### Align Values
left, center, right

### Background Modes
contain, cover, repeat, stretch

### Width Types
pixels, percent

### Collection Types
RECIPIENT_RECOMMENDATIONS, FROM_SEGMENT, FROM_PRODUCT_LIST, ORDER, VIEWED_PRODUCTS_IN_SESSION, PRODUCT_LIST_ITEM, PRODUCT_VIEW, FROM_CUSTOMER_COMPUTED_FIELD`;
