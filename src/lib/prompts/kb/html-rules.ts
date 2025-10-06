// HTML generation rules and templates

export const HTML_RULES_KB = `## HTML Structure Rules

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
✓ **SIZE**: Width control via SIZE variable (with extra.defaultMaxWidth and extra.allowedTypes)
✓ **INNER_SPACING**: Padding control via INNER_SPACING variable
✓ **HEIGHT**: Use NUMBER (for simple height), HEIGHTV2 (for images), or TEXT_SIZE (for text containers) as appropriate
✓ **BORDER & BORDER_RADIUS**: Where visually appropriate

### Rule 3a: Gap/Spacer Elements
For vertical spacing between blocks (gaps/spacers), use NUMBER type:
\`\`\`html
<tr>
  <td>
    <div style="height: \${editor.gap}px; line-height: \${editor.gap}px; font-size: 8px;">&nbsp;</div>
  </td>
</tr>
\`\`\`
Alternative pattern:
\`\`\`html
<tr>
  <td style="height: \${editor.gap}px; background: transparent;"></td>
</tr>
\`\`\`

### Rule 4: Images MUST Have
\`\`\`html
<img src="\${editor.imageName}" 
     alt="\${editor.imageNameAlt}"
     width="\${editor.imageNameSize.formattedWidthAttribute}"
     style="display: block; \${editor.imageNameSize.formattedWidthStyle};">
\`\`\`

### Rule 5: Text Elements
- Rich text (paragraphs): Use TEXT type → \`<div>\${editor.textContent}</div>\`
- Simple text (buttons, labels): Use SIMPLE_TEXT type → \`<span>\${editor.labelText}</span>\`
- Text styles: Always wrap in \`<div style="\${editor.textStyles}">\${editor.textContent}</div>\`

### Rule 6: Image Template with All Controls
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

### Rule 7: Text with Styles Template
\`\`\`html
@{if editor.shouldShowText}
<div style="\${editor.textStyles}">\${editor.textContent}</div>
@{end if}
\`\`\`

### Rule 8: Button Template
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

### Rule 9: Critical HTML Requirements
1. Each block MUST start with: \`<!-- EDITOR_BLOCK_TEMPLATE: block_name -->\`
2. Wrap in ghost tables for Outlook compatibility: \`<!--[if mso | IE]>...<![endif]-->\` (recommended for table-based layouts, can be omitted for div-based adaptive grids)
3. Center using: parent \`<td align="center">\` + SIZE-controlled inner table
4. All images MUST have alt attributes
5. Text in @{if} blocks MUST have font-size and line-height

### Rule 10: Dynamic Product Grids - Layout Choice
- **Adaptive (responsive)**: Use div-based layout - cards will stack on mobile devices
- **Fixed (non-responsive)**: Use table-based layout - same appearance on all devices
- **Table-based with Tablerows()**: For multi-row product grids:
  \`\`\`html
  <table>
  @{for row in Tablerows(editor.collection, 3)}
      <tr>
      @{for cell in row.Cells}
          <td>
          @{if cell.Value != null}
              <!-- Product card content -->
              <img src="\${editor.productImage}" />
              \${editor.productTitle}
          @{end if}
          </td>
      @{end for}
      </tr>
  @{end for}
  </table>
  \`\`\`
  where 3 is the number of columns per row`;
