# Mindbox Integration Guide

## Overview

This visual editor includes full integration with Mindbox email template system, allowing you to create email templates visually and export them in Mindbox-compatible HTML and JSON formats.

## Features

### 1. **Mindbox Mode for Blocks**

Each block (TEXT, BUTTON, IMAGE, CONTAINER) can be switched to Mindbox mode, which enables:

- Automatic generation of Mindbox variables (`${editor.blockName_*}`)
- Conditional blocks (`@{if}...@{end if}`)
- MSO-compatible table layouts for Outlook
- JSON parameter definitions for Mindbox editor

### 2. **Automatic Hierarchy Detection**

The system automatically detects parent-child relationships based on visual overlap:

- If a red block is visually inside a blue container, it will be nested in the HTML output
- Uses bounding box detection to determine containment
- Selects the smallest containing block as parent to handle nested containers

### 3. **Manual Grouping**

You can manually group blocks using:

- **Keyboard**: `Ctrl+G` (Windows/Linux) or `Cmd+G` (Mac)
- **Context Menu**: Right-click → "Group"
- **Tools Menu**: Tools → Group Selection

To ungroup:
- **Keyboard**: `Ctrl+Shift+G` or `Cmd+Shift+G`
- **Context Menu**: Right-click on group → "Ungroup"

### 4. **Validation**

Before export, the system validates:

- ✅ Variable naming (no dashes, no Cyrillic, only `a-z`, `0-9`, `_`)
- ✅ Unique block names across the project
- ✅ Required fields (background, text styles, etc.)
- ✅ Correct spacing format (`top right bottom left`)
- ✅ Hierarchy depth limits
- ✅ Mindbox-specific requirements (line height values, fonts, etc.)

## Getting Started

### Step 1: Enable Mindbox Mode

1. Select a block on the canvas
2. In the Settings Panel (right side), find "Mindbox Settings"
3. Toggle "Enable Mindbox Mode"
4. Configure block-specific settings:
   - **Block Name**: Unique identifier for variables (e.g., `header`, `footer`)
   - **Background**: Color or image background
   - **Inner Spacing**: Padding inside the block (format: `top right bottom left`)
   - **Outer Spacing**: Margin around the block (pixels)
   - **Display Toggle**: Show/hide block
   - **Border & Border Radius**: Styling options
   - **Align**: Text alignment (left, center, right)

### Step 2: Configure Type-Specific Settings

#### For TEXT blocks:
- **Text**: The actual text content
- **Text Styles**: Font, size, color, line height, etc.

#### For BUTTON blocks:
- **Button Text**: Text displayed on the button
- **URL**: Link destination
- **Text Styles**: Button text styling

#### For IMAGE blocks:
- **Image URL**: Source of the image
- **Alt Text**: Accessibility description
- **Link URL**: Optional link wrapper

### Step 3: Arrange Blocks

#### Visual Layout:
- Drag blocks to position them
- Blocks visually inside containers will be automatically nested in export

#### Manual Grouping:
1. Select multiple blocks (Click + Shift or Drag selection box)
2. Press `Ctrl+G` to group them
3. The group can be moved as a single unit

### Step 4: Validate

Before exporting, check the **Mindbox Validation Panel** in the Settings sidebar:

- **Green badge**: All validations passed ✅
- **Red badge**: Errors found that must be fixed ❌
- **Yellow badge**: Warnings (export will proceed but review recommended) ⚠️

Click "Revalidate" to check again after making changes.

### Step 5: Preview Hierarchy

Use the **Hierarchy Preview** panel to see the auto-detected nesting structure:

- Shows parent-child relationships
- Highlights any overlapping conflicts
- Displays relative coordinates for nested blocks

### Step 6: Export

1. Click **File** → **Export Mindbox Template**
2. System validates automatically before export
3. Two files will download:
   - `[project-name]_mindbox.html` - Template HTML with Mindbox variables
   - `[project-name]_mindbox.json` - Parameter definitions for Mindbox editor

## HTML Structure

Generated HTML follows Mindbox best practices:

```html
<!-- EDITOR_BLOCK_TEMPLATE: template_name -->

<!--[if mso]>
<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600" align="center">
<tr><td>
<![endif]-->

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto;">
  <tbody>
    <tr>
      <td style="padding: 0;">
        
        <!-- Block with conditional display -->
        @{if editor.shouldShowHeader}
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
          <tbody>
            <tr>
              <td bgcolor="${editor.header_background}" 
                  style="padding: ${editor.header_innerSpacing}; 
                         ${editor.header_background.formattedBackgroundStyles};">
                <div style="${editor.header_styles}">${editor.header_text}</div>
              </td>
            </tr>
          </tbody>
        </table>
        @{end if}
        
      </td>
    </tr>
  </tbody>
</table>

<!--[if mso]>
</td></tr>
</table>
<![endif]-->
```

## JSON Structure

Generated JSON provides editor parameters:

```json
[
  {
    "name": "shouldShowHeader",
    "type": "DISPLAY_TOGGLE",
    "defaultValue": "true",
    "group": "Header",
    "extra": {
      "label": "Показывать заголовок"
    }
  },
  {
    "name": "header_text",
    "type": "TEXT",
    "defaultValue": "Your Header Text",
    "group": "Header",
    "extra": {
      "label": "Текст заголовка"
    }
  },
  {
    "name": "header_styles",
    "type": "TEXT_STYLES",
    "defaultValue": {
      "font": "Arial",
      "fontSize": "24",
      "lineHeight": "1.5",
      "color": "#000000",
      "fallbackFont": "Helvetica"
    },
    "group": "Header",
    "extra": {
      "label": "Стили заголовка"
    }
  }
]
```

## Variable Naming Rules

### ✅ Valid Names:
- `header_text`
- `buttonWidth`
- `container_background`
- `image1_url`

### ❌ Invalid Names:
- `header-text` (contains dash)
- `кнопка` (Cyrillic characters)
- `my button` (contains space)
- `header.text` (contains dot - will create 3+ level nesting)

## Mindbox Types Reference

### Common Types:

| Type | Purpose | Example |
|------|---------|---------|
| `TEXT` | Editable text content | `"Hello World"` |
| `TEXT_STYLES` | Font, size, color, etc. | `{ "font": "Arial", "fontSize": "16" }` |
| `SIMPLE_TEXT` | Simple text (for buttons) | `"Click Here"` |
| `SIMPLE_TEXT_STYLES` | Button text styles | `{ "color": "#FFFFFF" }` |
| `BACKGROUND` | Background color/image | `{ "type": "color", "color": "#FF0000" }` |
| `BORDER` | Border styling | `"1px solid #000000"` |
| `BORDER_RADIUS` | Corner rounding | `"5 5 5 5"` |
| `INNER_SPACING` | Padding | `"10 20 10 20"` |
| `NUMBER` | Numeric value | `"20"` |
| `URL` | Link destination | `"https://example.com"` |
| `IMAGE` | Image source | `"https://example.com/image.jpg"` |
| `ALT` | Image alt text | `"Description"` |
| `DISPLAY_TOGGLE` | Show/hide control | `"true"` or `"false"` (string!) |

## Best Practices

### 1. **Naming Conventions**
- Use descriptive block names: `header`, `mainButton`, `footerLogo`
- Keep names unique across the entire template
- Use camelCase or snake_case consistently

### 2. **Layout Strategy**
- Start with the main container (600px width is standard for emails)
- Add content blocks from top to bottom
- Use nesting for complex layouts (e.g., button inside colored section)

### 3. **Validation Workflow**
1. Build your layout visually
2. Enable Mindbox mode on all blocks
3. Configure settings for each block
4. Check Hierarchy Preview for correct nesting
5. Run validation
6. Fix any errors
7. Export

### 4. **Testing**
After export:
1. Upload HTML and JSON to Mindbox
2. Test in preview mode
3. Send test emails to verify rendering in different clients
4. Check Outlook-specific rendering (MSO tags handle this)

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Group Selected | `Ctrl+G` | `Cmd+G` |
| Ungroup | `Ctrl+Shift+G` | `Cmd+Shift+G` |
| Delete Block | `Delete` or `Backspace` | `Delete` or `Backspace` |
| Duplicate | `Ctrl+D` | `Cmd+D` |
| Copy | `Ctrl+C` | `Cmd+C` |
| Paste | `Ctrl+V` | `Cmd+V` |
| Undo | `Ctrl+Z` | `Cmd+Z` |
| Redo | `Ctrl+Shift+Z` | `Cmd+Shift+Z` |

## Troubleshooting

### Issue: Export validation fails
**Solution**: Check the Validation Panel for specific errors. Common issues:
- Duplicate block names
- Invalid characters in block names
- Missing required fields (text styles, background)
- Invalid spacing format

### Issue: Blocks not nesting correctly
**Solution**: 
1. Check Hierarchy Preview to see detected structure
2. Ensure child block is fully inside parent visually
3. Use manual grouping (`Ctrl+G`) for explicit control

### Issue: Variables not generating correctly
**Solution**:
- Ensure block name follows naming rules (no dashes, Cyrillic, etc.)
- Check that Mindbox mode is enabled for the block
- Verify block has unique name

### Issue: Outlook rendering issues
**Solution**:
- MSO ghost tables are automatically included
- Ensure you're using table-based layout (not divs)
- Test with Litmus or Email on Acid for Outlook clients

## Advanced Features

### Custom Variable Prefixes
Block names become variable prefixes:
- Block name: `header` → Variables: `header_text`, `header_styles`, `header_background`
- Block name: `mainCTA` → Variables: `mainCTA_buttonText`, `mainCTA_url`

### Nested Structures
When blocks are nested:
```html
<!-- Parent container -->
<td style="padding: ${editor.container_innerSpacing};">
  
  <!-- Nested child block -->
  <table>
    <tr>
      <td style="${editor.childBlock_styles}">
        ${editor.childBlock_text}
      </td>
    </tr>
  </table>
  
</td>
```

### Conditional Sections
Every block automatically gets a `shouldShow*` toggle:
```html
@{if editor.shouldShowPromoSection}
  <!-- Promo content -->
@{end if}
```

## Support

For issues or questions:
1. Check this documentation
2. Review validation errors in the panel
3. Test with simple templates first
4. Refer to Mindbox official documentation for platform-specific questions

## Changelog

### Version 1.0.0
- Initial Mindbox integration
- Automatic hierarchy detection
- Manual grouping support
- Full validation system
- HTML/JSON export with MSO compatibility
