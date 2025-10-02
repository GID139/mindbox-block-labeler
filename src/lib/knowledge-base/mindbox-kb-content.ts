// Auto-generated knowledge base content
// This file contains the complete Mindbox documentation as a string constant

export const MINDBOX_KB_CONTENT = `# MINDBOX EMAIL BLOCKS - COMPLETE KNOWLEDGE BASE

**Version:** 1.0.0  
**Last Updated:** 2025-10-02

---

## Priority Hierarchy

This knowledge base follows a strict priority hierarchy for conflict resolution:

* **[A] Priority Level A**: Normative standards (Knowledge Base) - HIGHEST PRIORITY
* **[B] Priority Level B**: Generation & debugging prompts - MEDIUM PRIORITY  
* **[C] Priority Level C**: Documentation examples & patterns - LOWEST PRIORITY

**Rule:** When information conflicts, always follow: A > B > C

---

# [A] MINDBOX JSON KNOWLEDGE BASE (НОРМАТИВ)

This document is the master reference for all valid JSON configurations used in Mindbox custom email blocks.

## Core Control Types

### DISPLAY_TOGGLE
- Type: String "true" or "false" (NOT boolean)
- Usage: \`@{if editor.variableName} ... @{end if}\`
- Default: "true"

### TEXT & SIMPLE_TEXT
- TEXT: Rich text with formatting
- SIMPLE_TEXT: Plain text without formatting  
- Usage: \`\${editor.variableName}\`

### IMAGE, URL, ALT, ICON
- IMAGE: Image source URL
- URL: Link destination
- ALT: Image alt text
- ICON: Small icon image
- Default IMAGE: "https://mindbox.ru/build/assets/images/mb-fav_marketing_green-Ds-aOpBM.svg"

### SIZE (Width Control)
- Format: "manual 100 *" (MANDATORY default)
- Usage: width="\${editor.var.formattedWidthAttribute}" style="\${editor.var.formattedWidthStyle}"

### HEIGHTV2 (Height Control)  
- Format: "100 100" (desktop mobile)
- Usage: height="\${editor.var.formattedHeight}"

### TEXT_SIZE (Text Container Height)
- Format: "30 30" (desktop mobile)
- Usage: height="\${editor.var.containerHeightAttribute}" style="\${editor.var.containerStyle}"

### BUTTON_SIZE
- Format: { "width": "pixels 100 80", "height": "50 40" }
- Width types: "pixels" or "percent"

### BORDER_RADIUS
- Format: "25 25 25 25" (TL TR BR BL)

### INNER_SPACING (Padding)
- Format: "10 25 10 25" (T R B L)

### BORDER
- Format: "none" or "solid black 2" (style color width)

### BACKGROUND
- Transparent: { "type": "transparent" }
- Color: { "type": "color", "color": "#39AA5D" } (MANDATORY default)
- Image: { "type": "image", "url": "...", "color": "#39AA5D", "mode": "cover" }
- Modes: "contain", "cover", "repeat", "stretch"

### TEXT_STYLES & SIMPLE_TEXT_STYLES
Required fields:
- font: "Arial", "Helvetica", "Roboto", etc.
- fontSize: string number
- lineHeight: "1.0", "1.15", "1.5", "2.0" (ONLY these values)
- inscription: [] or ["bold"], ["italic"], ["underlined"], ["crossed"]
- color: "#RRGGBB"
- fallbackFont: "Helvetica" (MANDATORY)
- letterSpacing: string number

### COLOR
- Format: "#RRGGBB"

### ALIGN
- Values: "left", "center", "right"

### COLLECTION (Dynamic Content)
- Values: "RECIPIENT_RECOMMENDATIONS", "FROM_SEGMENT", "FROM_PRODUCT_LIST", "ORDER", "VIEWED_PRODUCTS_IN_SESSION", "PRODUCT_LIST_ITEM", "PRODUCT_VIEW", "FROM_CUSTOMER_COMPUTED_FIELD"

### Dynamic Roles
- ProductTitle, ProductPrice, ProductOldPrice, ProductUrl, ProductImageUrl, ProductDescription, ProductBadge
- Use "role" instead of "defaultValue"

---

## MANDATORY RULES

### For Every Logical Element:
1. DISPLAY_TOGGLE control (shouldShow...)
2. SIZE control for width  
3. INNER_SPACING control for padding
4. HEIGHT control (NUMBER/HEIGHTV2/TEXT_SIZE)
5. BORDER and BORDER_RADIUS where appropriate

### HTML Structure Rules:
1. Each block MUST start with: \`<!-- EDITOR_BLOCK_TEMPLATE: block_name -->\`
2. Wrap in ghost tables: \`<!--[if mso | IE]>...<![endif]-->\`
3. Center using: parent \`<td align="center">\` + SIZE-controlled inner table
4. All images MUST have alt attributes
5. Text in @{if} blocks MUST have font-size and line-height

### JSON Structure Rules:
1. Every parameter MUST have "group" and "extra.label"
2. Use nested groups: "Settings >> Section >> Subsection"
3. DISPLAY_TOGGLE values are STRINGS not booleans
4. All complex objects must include ALL required nested fields

### Variable Naming:
- Format: \${editor.descriptiveName}
- Only: letters, numbers, underscore (_)
- NO dashes (-), NO Cyrillic
- Case-insensitive but use camelCase

---

# [B] HTML GENERATION GUIDELINES

## Block Structure Template:
\`\`\`html
<!-- EDITOR_BLOCK_TEMPLATE: unique_block_name -->
<!--[if mso | IE]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600">
<tr><td>
<![endif]-->

<table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
  <tr>
    <td align="center">
      <table width="\${editor.blockWidth.formattedWidthAttribute}" 
             style="\${editor.blockWidth.formattedWidthStyle};">
        <!-- Block content here -->
      </table>
    </td>
  </tr>
</table>

<!--[if mso | IE]>
</td></tr></table>
<![endif]-->
\`\`\`

## Centering Method:
\`\`\`html
<td align="center">
  <table width="\${editor.size.formattedWidthAttribute}" 
         style="\${editor.size.formattedWidthStyle};">
    <!-- Centered content -->
  </table>
</td>
\`\`\`

## Image with All Controls:
\`\`\`html
@{if editor.shouldShowImage}
<a href="\${editor.imageUrl}">
  <img src="\${editor.image}" 
       alt="\${editor.imageAlt}"
       width="\${editor.imageSize.formattedWidthAttribute}"
       height="\${editor.imageHeight.formattedHeight}"
       style="display: block; 
              \${editor.imageSize.formattedWidthStyle}; 
              height: \${editor.imageHeight.formattedHeight};
              border: \${editor.imageBorder};
              border-radius: \${editor.imageBorderRadius};">
</a>
@{end if}
\`\`\`

## Text with Styles:
\`\`\`html
@{if editor.shouldShowText}
<div style="\${editor.textStyles}">\${editor.textContent}</div>
@{end if}
\`\`\`

## Button Structure:
\`\`\`html
@{if editor.shouldShowButton}
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="\${editor.buttonAlign}">
      <a href="\${editor.buttonUrl}" style="display: inline-block;">
        <table border="0" cellpadding="0" cellspacing="0"
               width="\${editor.buttonSize.width}"
               style="width: \${editor.buttonSize.formattedWidth};"
               class="\${editor.buttonSize.class}">
          <tbody>
            <tr>
              <td align="center" valign="middle" 
                  height="\${editor.buttonSize.height}" 
                  style="height: \${editor.buttonSize.formattedHeight}; 
                         background-color: \${editor.buttonBackground}; 
                         border-radius: \${editor.buttonBorderRadius};
                         border: \${editor.buttonBorder};
                         padding: \${editor.buttonPadding};
                         \${editor.buttonTextStyles};" 
                  class="\${editor.buttonSize.class}">
                \${editor.buttonText}
              </td>
            </tr>
          </tbody>
        </table>
      </a>
    </td>
  </tr>
</table>
@{end if}
\`\`\`

---

# [C] VALIDATION CHECKLISTS

## HTML Validation:
- [ ] EDITOR_BLOCK_TEMPLATE header present
- [ ] Ghost tables for Outlook
- [ ] All tags properly closed
- [ ] All images have alt
- [ ] Text in @{if} has font-size/line-height
- [ ] Centering uses correct method
- [ ] Variables follow naming rules

## JSON Validation:
- [ ] Valid JSON syntax
- [ ] All types are valid Mindbox types
- [ ] DISPLAY_TOGGLE are strings not booleans
- [ ] SIZE has "manual 100 *"
- [ ] BACKGROUND has correct structure
- [ ] TEXT_STYLES has fallbackFont
- [ ] All fonts from allowed list
- [ ] All lineHeights from allowed values
- [ ] Every object has group and extra.label
- [ ] Groups are nested properly

## Synchronization:
- [ ] Every HTML variable has JSON object
- [ ] Every JSON object used in HTML
- [ ] Variable names match exactly
- [ ] Complex variables (.formattedWidth) map to correct types

---

**End of Knowledge Base**`;
