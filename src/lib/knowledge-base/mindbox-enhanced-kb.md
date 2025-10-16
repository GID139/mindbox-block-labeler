# MINDBOX EMAIL BLOCKS — COMPLETE KNOWLEDGE BASE (ENHANCED)

**Version:** 3.1.0  
**Last Updated:** 2025-10-16  
**Status:** Production-Ready

Этот документ синхронизирован с официальной документацией Mindbox по кастомным email-блокам.  
**Официальная документация:** https://docs.mindbox.ru/docs/custom-blocks

---

## 📚 Table of Contents

1. [Priority Hierarchy](#priority-hierarchy)
2. [Quick Reference: Allowed Values](#allowed-values-reference)
3. [Global Rules & Terminology](#global-rules-and-terminology)
4. [Variable Naming Rules](#variable-naming-rules)
5. [Block Naming Rules](#block-naming-rules)
6. [JSON Structure Requirements](#json-structure-requirements)
7. [Workflow: Step-by-Step Process](#workflow-step-by-step-process)
8. [Content & Display Controls](#content-display-controls)
9. [Styling Controls](#styling-controls)
10. [Sizing & Spacing Controls](#sizing-spacing-controls)
11. [Dynamic Content Controls](#dynamic-content-controls)
12. [HTML Structure Rules](#html-structure-rules)
13. [Advanced Patterns](#advanced-patterns)
    - [Gap/Spacer Between Blocks](#pattern-0-gapspacer-between-blocks)
    - [Static vs Dynamic Product Grids](#pattern-01-static-vs-dynamic-product-grids)
    - [Adaptive vs Fixed Layout](#pattern-02-adaptive-vs-fixed-layout)
    - [Advanced Customization](#pattern-03-advanced-customization-logic-in-templates)
14. [Complete Examples](#complete-examples)
15. [Developer Checklist](#developer-checklist)
16. [AI Generation Prompts [B]](#ai-generation-prompts)
17. [Russian Documentation [C]](#russian-documentation)
18. [Changelog](#changelog)

---

## Priority Hierarchy

This knowledge base follows a strict priority hierarchy for conflict resolution:

* **[A] Priority Level A**: Normative standards (Knowledge Base) — **HIGHEST PRIORITY**
* **[B] Priority Level B**: Generation & debugging prompts — **MEDIUM PRIORITY**  
* **[C] Priority Level C**: Documentation examples & patterns — **LOWEST PRIORITY**

**Rule:** When information conflicts, always follow: **A > B > C**

---

## Allowed Values Reference

### Fonts
```
"Arial", "Helvetica", "Roboto", "Open Sans", "Montserrat", "Inter", "Geneva", 
"Times New Roman", "Verdana", "Courier / Courier New", "Tahoma", "Georgia", 
"Palatino", "Trebuchet MS"
```

### Line Heights
```
"1.0", "1.15", "1.5", "2.0"
```
**ONLY these four values are allowed.**

### Align Values
```
"left", "center", "right"
```

### Background Modes
```
"contain", "cover", "repeat", "stretch"
```

### Width Types (for SIZE/BUTTON_SIZE)
```
"pixels", "percent"
```

### Collection Types
```
"RECIPIENT_RECOMMENDATIONS", "FROM_SEGMENT", "FROM_PRODUCT_LIST", "ORDER", 
"VIEWED_PRODUCTS_IN_SESSION", "PRODUCT_LIST_ITEM", "PRODUCT_VIEW", 
"FROM_CUSTOMER_COMPUTED_FIELD"
```

### Dynamic Data Roles
```
"ProductTitle", "ProductPrice", "ProductOldPrice", "ProductUrl", 
"ProductImageUrl", "ProductDescription", "ProductBadge"
```

---

## Global Rules and Terminology

### Rule 0: EDITOR_BLOCK_TEMPLATE (MANDATORY)

**The FIRST line of ANY HTML block MUST be:**
```html
<!-- EDITOR_BLOCK_TEMPLATE: block_system_name -->
```

**This is NON-NEGOTIABLE. No exceptions.**

### Variable Naming Rules

**Format:** `${editor.descriptiveName}`

**Allowed characters:**
* Latin letters (a-z, A-Z)
* Numbers (0-9)
* Underscore (_)

**NOT allowed:**
* Dashes (-)
* Cyrillic characters
* Special characters

**Properties:**
* Case-insensitive (but use camelCase for consistency)
* Must be unique within each block
* No spaces

**Examples:**
* ✅ `${editor.buttonText}`
* ✅ `${editor.main_image_url}`
* ❌ `${editor.button-text}` (dash not allowed)
* ❌ `${editor.текстКнопки}` (Cyrillic not allowed)

### Block Naming Rules

**Format:** Must appear in the mandatory first-line comment
```html
<!-- EDITOR_BLOCK_TEMPLATE: system_name_here -->
```

**Allowed characters:**
* Latin letters (a-z, A-Z)
* Numbers (0-9)
* Underscore (_)

**Properties:**
* **Unique across the entire project** (not just within one file)
* **Permanent** — saved forever with the block
* Re-uploading with the same name overwrites the previous version
* **Important:** Already inserted instances in emails remain unchanged even when block is updated
* Consider using versioning in names (e.g., `header_v2`) for major changes
* Use descriptive, semantic names (e.g., `product_grid_3col` not `block_1`)

**Examples:**
* ✅ `header_block`
* ✅ `product_grid_3col`
* ✅ `cta_button_v2`
* ❌ `header-block` (dash not allowed)
* ❌ `заголовок` (Cyrillic not allowed)

### Visibility Control (DISPLAY_TOGGLE)

**MANDATORY RULE:**  
Every editable element MUST be wrapped in a visibility condition:

```html
@{if editor.shouldShowElement}
  <!-- Your element HTML here -->
@{end if}
```

Corresponding JSON:
```json
{
  "name": "shouldShowElement",
  "type": "DISPLAY_TOGGLE",
  "defaultValue": "true",
  "group": "Visibility",
  "extra": { "label": "Show Element" }
}
```

---

## JSON Structure Requirements

### Mandatory Fields

Every JSON parameter object **MUST** include:

1. **`name`** — exact match to HTML variable (without `${editor.}` prefix)
2. **`type`** — one of the valid types from this knowledge base
3. **`defaultValue`** — default value (type varies by control type)
4. **`group`** — logical grouping for UI organization
5. **`extra.label`** — user-friendly display label

### Optional Fields

* **`role`** — **MANDATORY** for dynamic product grids; links to product data fields
* **`size`** — for COLLECTION type; specifies number of items

### Example Structure

```json
{
  "name": "buttonText",
  "type": "SIMPLE_TEXT",
  "defaultValue": "Click Here",
  "group": "Button Settings",
  "extra": { "label": "Button Text" }
}
```

---

## Workflow: Step-by-Step Process

Creating custom Mindbox blocks follows a two-stage workflow:

### Stage 1: HTML Markup

**Objective:** Create the HTML structure with Mindbox variables.

**Steps:**
1. **Add the mandatory first line:**
   ```html
   <!-- EDITOR_BLOCK_TEMPLATE: unique_block_name -->
   ```
   
2. **Build the email-compatible HTML structure:**
   - Use table-based layout for maximum email client compatibility
   - Add Outlook ghost tables (`<!--[if mso | IE]>`)
   - Use `role="presentation"` for layout tables
   
3. **Add visibility conditions:**
   - Wrap each editable element in `@{if editor.shouldShow*}...@{end if}`
   - This creates toggle controls in the editor
   
4. **Insert variables for content:**
   - Text: `${editor.textVariable}`
   - Images: `src="${editor.imageVariable}"`
   - Links: `href="${editor.urlVariable}"`
   - Styles: Use appropriate method properties (`.formattedWidthAttribute`, etc.)
   
5. **Add variables for styling:**
   - Colors: `style="color: ${editor.textColor};"`
   - Spacing: `style="padding: ${editor.blockPadding};"`
   - Borders: `style="border: ${editor.blockBorder};"`
   
6. **Add dynamic collections (if needed):**
   - Use `@{for row in Tablerows(editor.collection, 3)}` for fixed grids
   - Use `@{for item in editor.collection}` for adaptive grids

**Visual Examples:** See [official documentation](https://docs.mindbox.ru/docs/custom-blocks) for screenshots of block tagging.

### Stage 2: JSON Configuration

**Objective:** Define parameter properties for the Mindbox editor interface.

**Steps:**
1. **Upload HTML to Mindbox:**
   - Navigate to Settings → Email → Block Gallery
   - Upload your HTML file
   - Mindbox will detect all `${editor.*}` variables
   
2. **Configure each variable's properties:**
   - Select appropriate `type` from control types
   - Set user-friendly `extra.label`
   - Organize into logical `group` structures
   - Define sensible `defaultValue`
   
3. **Test in constructor:**
   - Insert block into a test email
   - Verify all controls appear correctly
   - Check that changes apply as expected
   
4. **Save and publish:**
   - Save the block configuration
   - Block is now available in the gallery

**Visual Examples:** See [official documentation](https://docs.mindbox.ru/docs/editor-variables) for screenshots of the JSON configuration interface.

---

## Content & Display Controls

### DISPLAY_TOGGLE

Checkbox to show/hide an HTML element.

| Property | Value |
|----------|-------|
| **Type** | `"DISPLAY_TOGGLE"` |
| **defaultValue** | `"true"` or `"false"` (string, not boolean) |
| **HTML** | `@{if editor.shouldShowElement} ... @{end if}` |

**JSON Example:**
```json
{
  "name": "shouldShowButton",
  "type": "DISPLAY_TOGGLE",
  "defaultValue": "true",
  "group": "Button",
  "extra": { "label": "Show Button" }
}
```

### TEXT

Rich text editor for multi-line content with formatting.

| Property | Value |
|----------|-------|
| **Type** | `"TEXT"` |
| **defaultValue** | Any string with HTML formatting |
| **HTML** | `<div>${editor.mainText}</div>` |

**JSON Example:**
```json
{
  "name": "mainText",
  "type": "TEXT",
  "defaultValue": "Your rich text content here...",
  "group": "Content",
  "extra": { "label": "Main Text Block" }
}
```

### SIMPLE_TEXT

Single-line text input without formatting.

| Property | Value |
|----------|-------|
| **Type** | `"SIMPLE_TEXT"` |
| **defaultValue** | Plain text string |
| **HTML** | `<span>${editor.buttonLabel}</span>` |

**JSON Example:**
```json
{
  "name": "buttonText",
  "type": "SIMPLE_TEXT",
  "defaultValue": "Click Here",
  "group": "Button",
  "extra": { "label": "Button Text" }
}
```

### URL

URL input field with validation.

| Property | Value |
|----------|-------|
| **Type** | `"URL"` |
| **defaultValue** | Valid URL string |
| **HTML** | `<a href="${editor.buttonUrl}">...</a>` |

**JSON Example:**
```json
{
  "name": "buttonLink",
  "type": "URL",
  "defaultValue": "https://mindbox.ru",
  "group": "Button",
  "extra": { "label": "Button Link" }
}
```

### IMAGE

Image upload or URL input.

| Property | Value |
|----------|-------|
| **Type** | `"IMAGE"` |
| **defaultValue** | **Standard:** `"https://via.placeholder.com/600x400"` |
| **HTML** | `<img src="${editor.headerImage}" ... >` |

**JSON Example:**
```json
{
  "name": "headerImage",
  "type": "IMAGE",
  "defaultValue": "https://via.placeholder.com/600x400",
  "group": "Media",
  "extra": { "label": "Header Image" }
}
```

### ALT

Alternative text for images (accessibility).

| Property | Value |
|----------|-------|
| **Type** | `"ALT"` |
| **defaultValue** | Descriptive text string |
| **HTML** | `<img ... alt="${editor.imageAlt}">` |

**⚠️ IMPORTANT for Dynamic Product Grids:**
* In dynamic product grids using `COLLECTION`, ALT parameters **MUST** include `"role": "ProductTitle"`
* Example: `"role": "ProductTitle"` to automatically populate from product data

**JSON Example (Static Block):**
```json
{
  "name": "imageAlt",
  "type": "ALT",
  "defaultValue": "Company Logo",
  "group": "Media",
  "extra": { "label": "Image Alt Text" }
}
```

**JSON Example (Dynamic Product Grid):**
```json
{
  "name": "productImageAlt",
  "type": "ALT",
  "role": "ProductTitle",
  "defaultValue": "Product Name",
  "group": "Product Card",
  "extra": { "label": "Product Image Alt" }
}
```

### ICON

Small image/icon upload.

| Property | Value |
|----------|-------|
| **Type** | `"ICON"` |
| **defaultValue** | Icon image URL |
| **HTML** | `<img src="${editor.socialIcon}" ... >` |

**JSON Example:**
```json
{
  "name": "socialIcon",
  "type": "ICON",
  "defaultValue": "https://via.placeholder.com/24",
  "group": "Media",
  "extra": { "label": "Social Media Icon" }
}
```

---

## Styling Controls

### COLOR

Color picker control.

| Property | Value |
|----------|-------|
| **Type** | `"COLOR"` |
| **defaultValue** | Hex color code (e.g., `"#000000"`) |
| **HTML** | `style="color: ${editor.textColor};"` |

**JSON Example:**
```json
{
  "name": "textColor",
  "type": "COLOR",
  "defaultValue": "#333333",
  "group": "Styles",
  "extra": { "label": "Text Color" }
}
```

### TEXT_STYLES

Complete text styling for rich text (multi-line).

| Property | Value |
|----------|-------|
| **Type** | `"TEXT_STYLES"` |
| **defaultValue** | Complex object (see below) |
| **HTML** | `<div style="${editor.paragraphStyles}">${editor.paragraphText}</div>` |

**defaultValue Structure:**
```json
{
  "font": "Arial",
  "fontSize": "16",
  "lineHeight": "1.5",
  "inscription": [],
  "color": "#000000",
  "fallbackFont": "Helvetica",
  "letterSpacing": "0"
}
```

**Allowed Values:**
* **font**: See [Fonts](#allowed-values-reference)
* **fontSize**: String number (e.g., `"16"`)
* **lineHeight**: `"1.0"`, `"1.15"`, `"1.5"`, or `"2.0"` ONLY
* **inscription**: `[]`, `["bold"]`, `["italic"]`, `["underlined"]`, `["crossed"]`
* **fallbackFont**: Same as font
* **letterSpacing**: String number (e.g., `"0"`)

**JSON Example:**
```json
{
  "name": "paragraphStyles",
  "type": "TEXT_STYLES",
  "defaultValue": {
    "font": "Arial",
    "fontSize": "16",
    "lineHeight": "1.5",
    "inscription": [],
    "color": "#000000",
    "fallbackFont": "Helvetica",
    "letterSpacing": "0"
  },
  "group": "Text Styles",
  "extra": { "label": "Paragraph Styles" }
}
```

### SIMPLE_TEXT_STYLES

Text styling for single-line text (includes color).

Same structure and allowed values as `TEXT_STYLES`.

**JSON Example:**
```json
{
  "name": "headingStyles",
  "type": "SIMPLE_TEXT_STYLES",
  "defaultValue": {
    "font": "Arial",
    "fontSize": "24",
    "lineHeight": "1.15",
    "inscription": ["bold"],
    "color": "#000000",
    "fallbackFont": "Helvetica",
    "letterSpacing": "0"
  },
  "group": "Text Styles",
  "extra": { "label": "Heading Styles" }
}
```

### BACKGROUND

Complex control for `<td>` background (color, transparent, or image).

| Property | Value |
|----------|-------|
| **Type** | `"BACKGROUND"` |
| **defaultValue** | **Standard:** `{ "type": "color", "color": "#39AA5D" }` |
| **HTML** | See special pattern below |

**HTML Pattern (THE TRIPLE METHOD):**
```html
<td 
  bgcolor="${editor.blockBg.color}"
  style="${editor.blockBg.formattedBackgroundStyles};"
  ${ if(editor.blockBg.type = "image", 'background="' & editor.blockBg.image & '"', "" ) }
>
  ...
</td>
```

**Allowed defaultValue Patterns:**

1. **Transparent:**
```json
{ "type": "transparent" }
```

2. **Color:**
```json
{ "type": "color", "color": "#39AA5D" }
```

3. **Image:**
```json
{ 
  "type": "image", 
  "url": "https://via.placeholder.com/600x400", 
  "color": "#39AA5D", 
  "mode": "cover" 
}
```
* **mode**: `"contain"`, `"cover"`, `"repeat"`, or `"stretch"`

**JSON Example:**
```json
{
  "name": "blockBg",
  "type": "BACKGROUND",
  "defaultValue": { "type": "color", "color": "#39AA5D" },
  "group": "Block Styles",
  "extra": { "label": "Block Background" }
}
```

### BORDER

Border style control.

| Property | Value |
|----------|-------|
| **Type** | `"BORDER"` |
| **defaultValue** | `"none"` or `"solid black 2"` (style color width) |
| **HTML** | `style="border: ${editor.imageBorder};"` |

**JSON Example:**
```json
{
  "name": "imageBorder",
  "type": "BORDER",
  "defaultValue": "none",
  "group": "Styles",
  "extra": { "label": "Image Border" }
}
```

### ALIGN

Horizontal alignment for table cell content.

| Property | Value |
|----------|-------|
| **Type** | `"ALIGN"` |
| **defaultValue** | `"left"`, `"center"`, or `"right"` |
| **HTML** | `<td align="${editor.contentAlign}">...</td>` |

**JSON Example:**
```json
{
  "name": "contentAlign",
  "type": "ALIGN",
  "defaultValue": "center",
  "group": "Layout",
  "extra": { "label": "Content Alignment" }
}
```

### BORDER_RADIUS

Four-corner radius control.

| Property | Value |
|----------|-------|
| **Type** | `"BORDER_RADIUS"` |
| **defaultValue** | `"TL TR BR BL"` (e.g., `"10 10 10 10"`) |
| **HTML** | `style="border-radius: ${editor.buttonRadius};"` |

**JSON Example:**
```json
{
  "name": "buttonBorderRadius",
  "type": "BORDER_RADIUS",
  "defaultValue": "10 10 10 10",
  "group": "Styles",
  "extra": { "label": "Button Corner Radius" }
}
```

---

## Sizing & Spacing Controls

### NUMBER

Simple numeric input.

| Property | Value |
|----------|-------|
| **Type** | `"NUMBER"` |
| **defaultValue** | String number (e.g., `"20"`) |
| **HTML** | `style="padding-top: ${editor.spacerHeight}px;"` |

**JSON Example:**
```json
{
  "name": "spacerHeight",
  "type": "NUMBER",
  "defaultValue": "20",
  "group": "Layout",
  "extra": { "label": "Spacer Height (px)" }
}
```

### SIZE

Width control (responsive, with attribute + style).

| Property | Value |
|----------|-------|
| **Type** | `"SIZE"` |
| **defaultValue** | **Standard:** `"manual 100 *"` |
| **HTML** | See pattern below |

**HTML Pattern:**
```html
<img 
  width="${editor.logoSize.formattedWidthAttribute}" 
  style="display:block; ${editor.logoSize.formattedWidthStyle};"
>
```

**JSON Example:**
```json
{
  "name": "logoSize",
  "type": "SIZE",
  "defaultValue": "manual 100 *",
  "extra": {
    "defaultMaxWidth": "600px",
    "allowedTypes": ["inherit", "manual"]
  },
  "group": "Layout",
  "extra": { "label": "Logo Width" }
}
```

### HEIGHTV2

Height control (desktop/mobile responsive).

| Property | Value |
|----------|-------|
| **Type** | `"HEIGHTV2"` |
| **defaultValue** | `"desktop mobile"` (e.g., `"50 50"`) |
| **HTML** | `height="${editor.blockHeight.formattedHeight}"` |

**JSON Example:**
```json
{
  "name": "blockHeight",
  "type": "HEIGHTV2",
  "defaultValue": "50 50",
  "group": "Layout",
  "extra": { "label": "Block Height" }
}
```

### TEXT_SIZE

Text container height (desktop/mobile).

| Property | Value |
|----------|-------|
| **Type** | `"TEXT_SIZE"` |
| **defaultValue** | `"desktop mobile"` (e.g., `"40 40"`) |
| **HTML** | See pattern below |

**HTML Pattern:**
```html
<div 
  style="${editor.titleSize.containerStyle};" 
  height="${editor.titleSize.containerHeightAttribute}"
>
  ${editor.titleText}
</div>
```

**JSON Example:**
```json
{
  "name": "textContainerHeight",
  "type": "TEXT_SIZE",
  "defaultValue": "40 40",
  "group": "Layout",
  "extra": { "label": "Text Container Height" }
}
```

### BUTTON_SIZE

Button dimensions (width + height).

| Property | Value |
|----------|-------|
| **Type** | `"BUTTON_SIZE"` |
| **defaultValue** | Object (see below) |
| **HTML** | **CRITICAL:** Use specific structure (see below) |

**defaultValue Structure:**
```json
{
  "width": "pixels 150 120",
  "height": "50 40"
}
```
* **width format**: `"type desktop mobile"` where type is `pixels` or `percent`
* **height format**: `"desktop mobile"`

**⚠️ CRITICAL HTML STRUCTURE (Required for % width):**
```html
<table 
  border="0" 
  cellpadding="0" 
  cellspacing="0" 
  width="${editor.buttonSize.width}" 
  style="width: ${editor.buttonSize.formattedWidth};" 
  class="${editor.buttonSize.class}" 
  role="presentation"
>
  <tbody>
    <tr>
      <td 
        align="center" 
        valign="middle" 
        height="${editor.buttonSize.height}" 
        style="height: ${editor.buttonSize.formattedHeight}; /* button styles */" 
        class="${editor.buttonSize.class}"
      >
        ${editor.buttonText}
      </td>
    </tr>
  </tbody>
</table>
```

**JSON Example:**
```json
{
  "name": "mainButtonSize",
  "type": "BUTTON_SIZE",
  "defaultValue": { "width": "pixels 150 120", "height": "50 40" },
  "group": "Layout",
  "extra": { "label": "Button Size" }
}
```

### INNER_SPACING

Internal padding (Top Right Bottom Left).

| Property | Value |
|----------|-------|
| **Type** | `"INNER_SPACING"` |
| **defaultValue** | `"T R B L"` (e.g., `"20 20 20 20"`) |
| **HTML** | `style="padding: ${editor.blockPadding};"` |

**JSON Example:**
```json
{
  "name": "blockPadding",
  "type": "INNER_SPACING",
  "defaultValue": "20 20 20 20",
  "group": "Layout",
  "extra": { "label": "Internal Padding" }
}
```

---

## Dynamic Content Controls

### PRODUCTS_IN_FOR_NODE

Dropdown to select product feed for dynamic content.

| Property | Value |
|----------|-------|
| **Type** | `"PRODUCTS_IN_FOR_NODE"` |
| **defaultValue** | One of the [Collection Types](#allowed-values-reference) |
| **HTML** | Use with `@{for}...@{end for}` loop |

**When to Use:**

1. **`Tablerows()` — Fixed Grid (Table-based)**
   * Fixed column count (e.g., 3 columns)
   * Same layout on desktop and mobile
   * Use for: product grids, catalogs

2. **`@{for item in collection}` — Adaptive Grid (Div-based)**
   * Flexible, responsive layout
   * Adapts to screen width
   * Use for: dynamic lists, recommendations

**HTML Pattern (Tablerows - Fixed Grid):**
```html
<table role="presentation">
  @{ for row in Tablerows(editor.productFeed, 3) }
    <tr>
      @{ for cell in row.Cells }
        <td>
          @{ if cell.Value != null }
            <img src="${editor.productImage}" alt="${editor.productTitle}">
            ${editor.productTitle}
          @{ end if }
        </td>
      @{ end for }
    </tr>
  @{ end for }
</table>
```

**HTML Pattern (Adaptive - Div-based):**
```html
<div>
  @{ for item in editor.productFeed }
    <a href="${editor.productUrl}">
      <img src="${editor.productImage}" alt="${editor.productTitle}">
    </a>
    ${editor.productTitle}
  @{ end for }
</div>
```

**JSON Example:**
```json
{
  "name": "productFeed",
  "type": "PRODUCTS_IN_FOR_NODE",
  "defaultValue": "RECIPIENT_RECOMMENDATIONS",
  "size": 6,
  "group": "Dynamic Content",
  "extra": { "label": "Product Source" }
}
```

**Important Notes:**
* `size` parameter: number of items to fetch
* Must use with `role` parameters for product data
* See [Dynamic Data Roles](#dynamic-data-roles) section

### Dynamic Data Roles

Connects JSON parameters to product fields within a COLLECTION loop.

**Usage:** Instead of `defaultValue`, use `"role": "ProductTitle"` etc.

| Role | Type | Description |
|------|------|-------------|
| `"ProductTitle"` | `SIMPLE_TEXT` | Product name |
| `"ProductPrice"` | `TEXT` | Current price |
| `"ProductOldPrice"` | `TEXT` | Original price (for discounts) |
| `"ProductUrl"` | `URL` | Product page link |
| `"ProductImageUrl"` | `IMAGE` | Product image |
| `"ProductDescription"` | `TEXT` | Product description |
| `"ProductBadge"` | `SIMPLE_TEXT` | Badge/label (e.g., "NEW") |

**⚠️ IMPORTANT:**
* Role parameters **MUST NOT** have `defaultValue`
* Role parameters **MUST** have `defaultValue` — use sample/placeholder data
* Role parameters are used **inside** `@{for}...@{end for}` loops
* For prices, use `TEXT` type (not SIMPLE_TEXT)

**JSON Example:**
```json
{
  "name": "productTitle",
  "type": "SIMPLE_TEXT",
  "role": "ProductTitle",
  "defaultValue": "Sample Product Name",
  "group": "Dynamic Product Card",
  "extra": { "label": "Product Title" }
},
{
  "name": "productImage",
  "type": "IMAGE",
  "role": "ProductImageUrl",
  "defaultValue": "https://via.placeholder.com/300x300",
  "group": "Dynamic Product Card",
  "extra": { "label": "Product Image" }
},
{
  "name": "productPrice",
  "type": "TEXT",
  "role": "ProductPrice",
  "defaultValue": "$99.99",
  "group": "Dynamic Product Card",
  "extra": { "label": "Product Price" }
}
```

---

## HTML Structure Rules

### Rule 1: EDITOR_BLOCK_TEMPLATE (First Line)

**MANDATORY — NO EXCEPTIONS:**

```html
<!-- EDITOR_BLOCK_TEMPLATE: unique_block_name -->
```

This **MUST** be the very first line of any HTML block.

### Rule 2: Block Structure (Outlook Compatibility)

Each independent block MUST be wrapped with:

```html
<!-- EDITOR_BLOCK_TEMPLATE: block_name -->
<!--[if mso | IE]>
<table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="width: 600px;" role="presentation">
  <tr>
    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
<![endif]-->

<!-- Your main block table here -->

<!--[if mso | IE]>
    </td>
  </tr>
</table>
<![endif]-->
```

### Rule 3: Centering Method

**ALWAYS center blocks using this method:**

```html
<td align="center">
  <table 
    width="${editor.blockWidth.formattedWidthAttribute}" 
    style="${editor.blockWidth.formattedWidthStyle}; max-width: 600px;"
  >
    <!-- Block content -->
  </table>
</td>
```

### Rule 4: Image Requirements

**Every `<img>` MUST have:**
* `alt` attribute (use ALT type variable)
* `style="display: block;"` (prevents spacing issues)
* Width control via SIZE variable

```html
<img 
  width="${editor.imageSize.formattedWidthAttribute}"
  src="${editor.imageSrc}"
  alt="${editor.imageAlt}"
  style="display: block; ${editor.imageSize.formattedWidthStyle};"
>
```

### Rule 5: Text in Conditional Blocks

Text inside `@{if}` blocks MUST have font-size and line-height:

```html
@{if editor.shouldShowText}
  <div style="font-size: 16px; line-height: 1.5; ${editor.textStyles}">
    ${editor.textContent}
  </div>
@{end if}
```

### Rule 6: Spacer/Gap Elements

For gaps between blocks:

```html
<tr>
  <td>
    <div style="height:${editor.gapPx}px; line-height:10px; font-size:8px; background:transparent;">
      &nbsp;
    </div>
  </td>
</tr>
```

### Rule 7: Table Accessibility

Tables used for layout (not data) should have:

```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
```

---

## Advanced Patterns

### Pattern 0: Gap/Spacer Between Blocks

Use spacer elements to create vertical gaps between email blocks.

**HTML:**
```html
<!-- EDITOR_BLOCK_TEMPLATE: spacer_gap -->
<table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
  <tr>
    <td>
      <div style="height: ${editor.gapHeight}px; line-height: ${editor.gapHeight}px; font-size: 8px;">&nbsp;</div>
    </td>
  </tr>
</table>
```

**JSON:**
```json
[
  {
    "name": "gapHeight",
    "type": "NUMBER",
    "defaultValue": "20",
    "group": "Spacer",
    "extra": { "label": "Gap Height (px)" }
  }
]
```

**Best Practices:**
* Use `font-size: 8px` to prevent line-height expansion
* Always use `&nbsp;` for invisible spacing
* Set `line-height` equal to `height` for consistency

---

### Pattern 0.1: Static vs Dynamic Product Grids

Choose the right approach based on your requirements:

#### **Static Product Grid**

**When to use:**
* Fixed number of products (e.g., always 4 products)
* Each product needs unique settings
* Simple, straightforward implementation

**Characteristics:**
* Each product has individual variables (e.g., `product_1_title`, `product_2_title`)
* No loops — each product is hardcoded
* More JSON parameters but simpler HTML

**Example HTML:**
```html
<!-- EDITOR_BLOCK_TEMPLATE: static_grid_4 -->
<table width="100%" role="presentation">
  <tr>
    <td width="25%">
      <img src="${editor.product1Image}" alt="${editor.product1Alt}">
      <div>${editor.product1Title}</div>
      <div>${editor.product1Price}</div>
    </td>
    <td width="25%">
      <img src="${editor.product2Image}" alt="${editor.product2Alt}">
      <div>${editor.product2Title}</div>
      <div>${editor.product2Price}</div>
    </td>
    <!-- products 3 and 4 ... -->
  </tr>
</table>
```

#### **Dynamic Product Grid**

**When to use:**
* Variable number of products (e.g., 3-12 products)
* Products populated from database/recommendations
* Need for personalization

**Characteristics:**
* Uses `PRODUCTS_IN_FOR_NODE` type with `role` parameters
* Loops through data: `@{for}...@{end for}` or `Tablerows()`
* Fewer JSON parameters, more complex HTML

**Two Approaches:**

**1. Tablerows() — Fixed Column Grid:**
* **Use when:** You need exact column count (e.g., always 3 columns)
* **Layout:** Table-based, fixed structure
* **Responsive:** No (same layout on all devices)

```html
@{for row in Tablerows(editor.productCollection, 3)}
  <tr>
    @{for cell in row.Cells}
      <td>@{if cell.Value != null}...@{end if}</td>
    @{end for}
  </tr>
@{end for}
```

**2. @{for} Loop — Adaptive Grid:**
* **Use when:** You want flexible, responsive layout
* **Layout:** Div-based or hybrid
* **Responsive:** Yes (adapts to screen width)

```html
@{for item in editor.productCollection}
  <div>
    <img src="${editor.productImage}">
    <div>${editor.productTitle}</div>
  </div>
@{end for}
```

**Comparison Table:**

| Feature | Static Grid | Dynamic (Tablerows) | Dynamic (@{for}) |
|---------|-------------|---------------------|------------------|
| **Product Count** | Fixed | Fixed columns, variable rows | Fully variable |
| **Data Source** | Manual entry | Database/API | Database/API |
| **Personalization** | No | Yes | Yes |
| **Complexity** | Low | Medium | Medium-High |
| **JSON Params** | Many | Few | Few |
| **Mobile Layout** | Same as desktop | Same as desktop | Adapts |
| **Best For** | Curated selections | Product catalogs | Recommendations |

---

### Pattern 0.2: Adaptive vs Fixed Layout

Understanding the difference between adaptive and fixed layouts:

#### **Fixed Layout (TABLE-based)**

**Characteristics:**
* Uses `<table>` with fixed `width` attributes or percentages
* Displays identically on desktop and mobile
* Outlook/MSO compatible
* Column structure doesn't change

**When to use:**
* Email clients with poor CSS support
* Need consistent appearance everywhere
* Product grids with fixed columns

**Example:**
```html
<table width="100%" role="presentation">
  <tr>
    <td width="50%">Column 1</td>
    <td width="50%">Column 2</td>
  </tr>
</table>
```

**Result:** Always 2 columns side-by-side, even on mobile (may require horizontal scrolling).

#### **Adaptive Layout (DIV-based or Hybrid)**

**Characteristics:**
* Uses `<div>` with `display: inline-block` or similar CSS
* Columns stack vertically on narrow screens
* Better mobile experience
* May not work in Outlook

**When to use:**
* Mobile-first design
* Modern email clients (Gmail, Apple Mail, etc.)
* Content that benefits from vertical stacking

**Example:**
```html
<div>
  @{for item in editor.products}
    <div style="display: inline-block; width: 48%; vertical-align: top;">
      <img src="${editor.productImage}">
    </div>
  @{end for}
</div>
```

**Result:** 2 columns on desktop, 1 column on mobile (adapts automatically).

**Recommendation:**
* **Use Fixed** for maximum compatibility and predictable layout
* **Use Adaptive** when mobile experience is priority and Outlook support isn't critical
* **Hybrid Approach:** Use fixed table structure with media queries for adaptive behavior

---

### Pattern 0.3: Advanced Customization (Logic in Templates)

Mindbox templates support complex logic for advanced use cases.

#### **Conditional Display Based on Product Data**

Show discount badge only if product has old price:

```html
@{if editor.productOldPrice != null && editor.productOldPrice != ""}
  <div style="background: #FF0000; color: #FFFFFF; padding: 5px;">
    SALE
  </div>
@{end if}
```

#### **Calculated Values**

Calculate discount percentage:

```html
@{if editor.productOldPrice != null}
  <div>
    Save ${FormatDecimal((editor.productOldPrice - editor.productPrice) / editor.productOldPrice * 100, 0)}%
  </div>
@{end if}
```

#### **Conditional Styling**

Change button color based on product status:

```html
<td style="background-color: ${if(editor.productInStock = true, '#00AA00', '#CCCCCC')};">
  ${if(editor.productInStock = true, 'Add to Cart', 'Out of Stock')}
</td>
```

#### **Available Functions**

Common Mindbox template functions:

* `FormatDecimal(value, decimals)` — Format number with specific decimal places
* `FormatDate(date, format)` — Format date/time
* `Substring(text, start, length)` — Extract substring
* `Contains(text, searchText)` — Check if text contains substring
* `Replace(text, oldValue, newValue)` — Replace text
* `Upper(text)` / `Lower(text)` — Change case

**Example: Format Price**
```html
<div>$${FormatDecimal(editor.productPrice, 2)}</div>
```
Output: `$99.99`

**Best Practices:**
* Keep logic simple and readable
* Test thoroughly across email clients
* Document complex expressions with HTML comments
* Consider performance with large loops

---

### Pattern 1: Dynamic Product Grid (3 Columns, Fixed)

**HTML:**
```html
<!-- EDITOR_BLOCK_TEMPLATE: product_grid_3col -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
  @{for row in Tablerows(editor.productCollection, 3)}
  <tr>
    @{for cell in row.Cells}
      @{if cell.Value != null}
      <td align="center" style="padding: 10px;" width="33.33%">
        <a href="${editor.productUrl}">
          <img 
            src="${editor.productImage}" 
            alt="${editor.productTitle}" 
            width="180" 
            style="width: 180px; display: block;"
          >
        </a>
        <div style="height: 10px;"></div>
        <div style="${editor.titleStyles}">${editor.productTitle}</div>
        <div style="height: 5px;"></div>
        <div style="${editor.priceStyles}">${editor.productPrice}</div>
      </td>
      @{else}
      <td width="33.33%">&nbsp;</td>
      @{end if}
    @{end for}
  </tr>
  @{end for}
</table>
```

**JSON:**
```json
[
  {
    "name": "productCollection",
    "type": "PRODUCTS_IN_FOR_NODE",
    "defaultValue": "RECIPIENT_RECOMMENDATIONS",
    "size": 6,
    "group": "Product Grid",
    "extra": { "label": "Product Source" }
  },
  {
    "name": "productUrl",
    "type": "URL",
    "role": "ProductUrl",
    "defaultValue": "https://example.com/product",
    "group": "Product Grid",
    "extra": { "label": "Product URL" }
  },
  {
    "name": "productImage",
    "type": "IMAGE",
    "role": "ProductImageUrl",
    "defaultValue": "https://via.placeholder.com/180x180",
    "group": "Product Grid",
    "extra": { "label": "Product Image" }
  },
  {
    "name": "productTitle",
    "type": "SIMPLE_TEXT",
    "role": "ProductTitle",
    "defaultValue": "Product Name",
    "group": "Product Grid",
    "extra": { "label": "Product Title" }
  },
  {
    "name": "productPrice",
    "type": "TEXT",
    "role": "ProductPrice",
    "defaultValue": "$99.99",
    "group": "Product Grid",
    "extra": { "label": "Product Price" }
  },
  {
    "name": "titleStyles",
    "type": "SIMPLE_TEXT_STYLES",
    "defaultValue": {
      "font": "Arial",
      "fontSize": "16",
      "lineHeight": "1.5",
      "inscription": ["bold"],
      "color": "#000000",
      "fallbackFont": "Helvetica",
      "letterSpacing": "0"
    },
    "group": "Product Grid >> Styles",
    "extra": { "label": "Title Styles" }
  },
  {
    "name": "priceStyles",
    "type": "SIMPLE_TEXT_STYLES",
    "defaultValue": {
      "font": "Arial",
      "fontSize": "18",
      "lineHeight": "1.15",
      "inscription": ["bold"],
      "color": "#39AA5D",
      "fallbackFont": "Helvetica",
      "letterSpacing": "0"
    },
    "group": "Product Grid >> Styles",
    "extra": { "label": "Price Styles" }
  }
]
```

### Pattern 2: Button with Icon

**HTML:**
```html
<!-- EDITOR_BLOCK_TEMPLATE: icon_button -->
@{if editor.shouldShowButton}
<table border="0" cellpadding="0" cellspacing="0" role="presentation">
  <tr>
    <td align="center" bgcolor="${editor.buttonBgColor}" style="border-radius: ${editor.buttonRadius};">
      <a href="${editor.buttonUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding: 10px 5px 10px 15px;">
              <img 
                src="${editor.buttonIcon}" 
                width="20" 
                height="20" 
                alt="icon" 
                style="display: block;"
              >
            </td>
            <td style="padding: 10px 15px 10px 5px; ${editor.buttonTextStyles};">
              ${editor.buttonText}
            </td>
          </tr>
        </table>
      </a>
    </td>
  </tr>
</table>
@{end if}
```

**JSON:**
```json
[
  {
    "name": "shouldShowButton",
    "type": "DISPLAY_TOGGLE",
    "defaultValue": "true",
    "group": "Button",
    "extra": { "label": "Show Button" }
  },
  {
    "name": "buttonUrl",
    "type": "URL",
    "defaultValue": "https://mindbox.ru",
    "group": "Button",
    "extra": { "label": "Button Link" }
  },
  {
    "name": "buttonIcon",
    "type": "IMAGE",
    "defaultValue": "https://via.placeholder.com/20",
    "group": "Button",
    "extra": { "label": "Button Icon" }
  },
  {
    "name": "buttonText",
    "type": "SIMPLE_TEXT",
    "defaultValue": "Click Here",
    "group": "Button",
    "extra": { "label": "Button Text" }
  },
  {
    "name": "buttonTextStyles",
    "type": "SIMPLE_TEXT_STYLES",
    "defaultValue": {
      "font": "Arial",
      "fontSize": "16",
      "lineHeight": "1.15",
      "inscription": ["bold"],
      "color": "#FFFFFF",
      "fallbackFont": "Helvetica",
      "letterSpacing": "0"
    },
    "group": "Button",
    "extra": { "label": "Button Text Styles" }
  },
  {
    "name": "buttonBgColor",
    "type": "COLOR",
    "defaultValue": "#007bff",
    "group": "Button",
    "extra": { "label": "Button Background" }
  },
  {
    "name": "buttonRadius",
    "type": "BORDER_RADIUS",
    "defaultValue": "5 5 5 5",
    "group": "Button",
    "extra": { "label": "Button Radius" }
  }
]
```

### Pattern 3: Custom CSS with SIMPLE_TEXT

For complex CSS properties not covered by standard controls:

**HTML:**
```html
<td style="padding: 20px; border-radius: 10px; box-shadow: ${editor.cardShadow};">
  ...
</td>
```

**JSON:**
```json
{
  "name": "cardShadow",
  "type": "SIMPLE_TEXT",
  "defaultValue": "0px 4px 10px rgba(0,0,0,0.1)",
  "group": "Card Styles",
  "extra": { "label": "Card Shadow (CSS)" }
}
```

---

## Complete Examples

### Example 1: Text Block with Button

**HTML:**
```html
<!-- EDITOR_BLOCK_TEMPLATE: text_with_button -->
<!--[if mso | IE]>
<table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="width:600px;" role="presentation">
  <tr>
    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
<![endif]-->

<table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
  <tbody>
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; min-width: 320px;" role="presentation">
          <tbody>
            <tr>
              <td
                bgcolor="${editor.blockBg.color}"
                style="${editor.blockBg.formattedBackgroundStyles}; padding: ${editor.blockPadding}; border: ${editor.blockBorder}; border-radius: ${editor.blockRadius};"
                ${ if(editor.blockBg.type = "image", 'background="' & editor.blockBg.image & '"', "" ) }
              >
                <!-- Top spacer -->
                <div style="height: ${editor.topGap}px; line-height: 10px; font-size: 8px;">&nbsp;</div>

                <!-- Text Content -->
                @{if editor.shouldShowText}
                <div style="${editor.textStyles}">${editor.textContent}</div>
                <div style="height: 20px; line-height: 10px; font-size: 8px;">&nbsp;</div>
                @{end if}

                <!-- Button -->
                @{if editor.shouldShowButton}
                <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                  <tr>
                    <td align="${editor.buttonAlign}">
                      <a href="${editor.buttonUrl}" target="_blank" style="display: inline-block; text-decoration: none;">
                        <table
                          border="0"
                          cellpadding="0"
                          cellspacing="0"
                          width="${editor.buttonSize.width}"
                          style="width: ${editor.buttonSize.formattedWidth};"
                          class="${editor.buttonSize.class}"
                          role="presentation"
                        >
                          <tbody>
                            <tr>
                              <td
                                align="center"
                                valign="middle"
                                height="${editor.buttonSize.height}"
                                style="height: ${editor.buttonSize.formattedHeight}; background-color: ${editor.buttonBgColor}; border-radius: ${editor.buttonRadius}; border: ${editor.buttonBorder}; ${editor.buttonTextStyles};"
                                class="${editor.buttonSize.class}"
                              >
                                ${editor.buttonText}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </a>
                    </td>
                  </tr>
                </table>
                @{end if}

                <!-- Bottom spacer -->
                <div style="height: ${editor.bottomGap}px; line-height: 10px; font-size: 8px;">&nbsp;</div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Gap after block -->
        <div style="height:${editor.gapPx}px; line-height: 10px; font-size: 8px; background: transparent;">&nbsp;</div>
      </td>
    </tr>
  </tbody>
</table>

<!--[if mso | IE]>
    </td>
  </tr>
</table>
<![endif]-->
```

**JSON:**
```json
[
  {
    "name": "blockBg",
    "type": "BACKGROUND",
    "defaultValue": { "type": "color", "color": "#39AA5D" },
    "group": "Block Settings",
    "extra": { "label": "Block Background" }
  },
  {
    "name": "blockPadding",
    "type": "INNER_SPACING",
    "defaultValue": "30 20 30 20",
    "group": "Block Settings",
    "extra": { "label": "Block Padding" }
  },
  {
    "name": "blockBorder",
    "type": "BORDER",
    "defaultValue": "none",
    "group": "Block Settings",
    "extra": { "label": "Block Border" }
  },
  {
    "name": "blockRadius",
    "type": "BORDER_RADIUS",
    "defaultValue": "12 12 12 12",
    "group": "Block Settings",
    "extra": { "label": "Block Radius" }
  },
  {
    "name": "topGap",
    "type": "NUMBER",
    "defaultValue": "0",
    "group": "Block Settings >> Spacing",
    "extra": { "label": "Top Internal Gap (px)" }
  },
  {
    "name": "bottomGap",
    "type": "NUMBER",
    "defaultValue": "0",
    "group": "Block Settings >> Spacing",
    "extra": { "label": "Bottom Internal Gap (px)" }
  },
  {
    "name": "gapPx",
    "type": "NUMBER",
    "defaultValue": "20",
    "group": "Block Settings >> Spacing",
    "extra": { "label": "Gap After Block (px)" }
  },
  {
    "name": "shouldShowText",
    "type": "DISPLAY_TOGGLE",
    "defaultValue": "true",
    "group": "Text Content",
    "extra": { "label": "Show Text" }
  },
  {
    "name": "textContent",
    "type": "TEXT",
    "defaultValue": "Your message goes here...",
    "group": "Text Content",
    "extra": { "label": "Text Content" }
  },
  {
    "name": "textStyles",
    "type": "TEXT_STYLES",
    "defaultValue": {
      "font": "Arial",
      "fontSize": "16",
      "lineHeight": "1.5",
      "inscription": [],
      "color": "#FFFFFF",
      "fallbackFont": "Helvetica",
      "letterSpacing": "0"
    },
    "group": "Text Content",
    "extra": { "label": "Text Styles" }
  },
  {
    "name": "shouldShowButton",
    "type": "DISPLAY_TOGGLE",
    "defaultValue": "true",
    "group": "Button",
    "extra": { "label": "Show Button" }
  },
  {
    "name": "buttonAlign",
    "type": "ALIGN",
    "defaultValue": "center",
    "group": "Button",
    "extra": { "label": "Button Alignment" }
  },
  {
    "name": "buttonUrl",
    "type": "URL",
    "defaultValue": "https://mindbox.ru",
    "group": "Button",
    "extra": { "label": "Button Link" }
  },
  {
    "name": "buttonText",
    "type": "SIMPLE_TEXT",
    "defaultValue": "Learn More",
    "group": "Button",
    "extra": { "label": "Button Text" }
  },
  {
    "name": "buttonTextStyles",
    "type": "SIMPLE_TEXT_STYLES",
    "defaultValue": {
      "font": "Arial",
      "fontSize": "16",
      "lineHeight": "1.15",
      "inscription": ["bold"],
      "color": "#FFFFFF",
      "fallbackFont": "Helvetica",
      "letterSpacing": "0"
    },
    "group": "Button >> Styles",
    "extra": { "label": "Button Text Styles" }
  },
  {
    "name": "buttonSize",
    "type": "BUTTON_SIZE",
    "defaultValue": { "width": "pixels 200 180", "height": "50 45" },
    "group": "Button >> Styles",
    "extra": { "label": "Button Size" }
  },
  {
    "name": "buttonBgColor",
    "type": "COLOR",
    "defaultValue": "#FFFFFF",
    "group": "Button >> Styles",
    "extra": { "label": "Button Background" }
  },
  {
    "name": "buttonBorder",
    "type": "BORDER",
    "defaultValue": "solid #FFFFFF 2",
    "group": "Button >> Styles",
    "extra": { "label": "Button Border" }
  },
  {
    "name": "buttonRadius",
    "type": "BORDER_RADIUS",
    "defaultValue": "8 8 8 8",
    "group": "Button >> Styles",
    "extra": { "label": "Button Radius" }
  }
]
```

---

## Developer Checklist

Use this checklist before uploading any custom block:

### ✅ HTML Checklist

- [ ] First line is `<!-- EDITOR_BLOCK_TEMPLATE: unique_name -->`
- [ ] Block has Outlook ghost table wrappers (`<!--[if mso | IE]>`)
- [ ] All tables used for layout have `role="presentation"`
- [ ] All images have `alt` attribute with ALT variable
- [ ] All images have `style="display: block;"`
- [ ] Block centering uses `<td align="center">` method
- [ ] All editable elements wrapped in `@{if editor.shouldShow*}`
- [ ] Text in `@{if}` blocks has font-size and line-height
- [ ] Variable names use only Latin letters, numbers, underscore
- [ ] All `${editor.*}` variables are unique within block

### ✅ JSON Checklist

- [ ] Every HTML variable has corresponding JSON object
- [ ] No unused JSON variables (all are used in HTML)
- [ ] Variable names match exactly (case-insensitive)
- [ ] All JSON objects have `name`, `type`, `defaultValue`, `group`, `extra.label`
- [ ] `DISPLAY_TOGGLE` defaultValue is string (`"true"` not `true`)
- [ ] `SIZE` controls have defaultValue `"manual 100 *"`
- [ ] `BACKGROUND` controls have defaultValue `{ "type": "color", "color": "#39AA5D" }`
- [ ] `IMAGE` controls use placeholder URL `"https://via.placeholder.com/600x400"`
- [ ] `TEXT_STYLES`/`SIMPLE_TEXT_STYLES` include `"fallbackFont": "Helvetica"`
- [ ] lineHeight values are ONLY: `"1.0"`, `"1.15"`, `"1.5"`, `"2.0"`
- [ ] Font names match allowed values exactly
- [ ] Dynamic grid has `COLLECTION` + role parameters
- [ ] Role parameters have `"role"` key AND `defaultValue` with sample data
- [ ] Controls organized in nested groups (e.g., `"Settings >> Button"`)

### ✅ Synchronization Checklist

- [ ] Every logical element has DISPLAY_TOGGLE
- [ ] Every element has SIZE (width control)
- [ ] Every element has INNER_SPACING (padding control)
- [ ] Images/buttons have BORDER and BORDER_RADIUS where appropriate
- [ ] Complex variables map correctly:
  - [ ] `.formattedWidthAttribute` → SIZE
  - [ ] `.formattedWidthStyle` → SIZE
  - [ ] `.formattedHeight` → HEIGHTV2
  - [ ] `.containerStyle` → TEXT_SIZE
  - [ ] `.formattedBackgroundStyles` → BACKGROUND

### ✅ Best Practices Checklist

- [ ] Block has semantic HTML comments describing sections
- [ ] Gap/spacer elements use invisible text (`&nbsp;`) with small font-size
- [ ] Button structure follows BUTTON_SIZE pattern (for % width support)
- [ ] BACKGROUND uses all three elements (bgcolor, style, conditional)
- [ ] Dynamic grids use appropriate loop (`Tablerows` for fixed, `@{for}` for adaptive)
- [ ] No hardcoded values — everything is controlled via variables
- [ ] Group names are clear and logical for end users
- [ ] Label names are user-friendly (not technical)

---

## AI Generation Prompts

# [B] ПРОМПТ №1: ГЕНЕРАЦИЯ HTML-КАРКАС

## ROLE AND OBJECTIVE
You are an expert email development specialist for the **Mindbox templating engine**. Your task is to generate a complete, valid, and ready-to-use HTML code for a custom block based on a user-provided structural description.

## INPUT DATA
You will receive a structured request describing the blocks to create and their required editable settings.

**Example Input:**
> "Create an email template with two sections:
> 1. A header with an editable logo image and customizable text.
> 2. A call-to-action button with editable text, link, and styles."

## EXECUTION ALGORITHM
Follow this algorithm step-by-step, using the **Enhanced Mindbox Knowledge Base** (Section [A]) as your single source of truth.

### Step 0: CRITICAL FIRST LINE
**BEFORE ANY OTHER CODE**, you MUST add as the VERY FIRST LINE:
```html
<!-- EDITOR_BLOCK_TEMPLATE: block_name -->
```
Replace `block_name` with a descriptive, unique name using only Latin letters, numbers, and underscores.

### Step 1: Analyze User Request
- Deconstruct the user's request into a list of logical blocks (e.g., Header, Image, Text, Button).
- For each block, identify the elements that need to be editable (e.g., image source, text content, button color).

### Step 2: Generate HTML Structure with Strict Rules
For each logical block identified in Step 1, generate the HTML code adhering to these **NON-NEGOTIABLE** rules:

1. **Block Header Comment**: The FIRST line MUST be `<!-- EDITOR_BLOCK_TEMPLATE: block_N -->` where N is the block's sequential number or descriptive name.
2. **Outlook Ghost Tables**: Each block MUST be wrapped in "ghost tables" using conditional comments for Outlook compatibility: `<!--[if mso | IE]>...<![endif]-->`.
3. **Independent Table Wrapper**: Each block MUST be wrapped in its own independent `<table>`.
4. **Centering Method**: All main block containers MUST be centered by applying `align="center"` to the parent `<td>`. The width of the inner content `<table>` MUST be controlled by a `SIZE` variable.
    ```html
    <td align="center">
      <table width="${editor.blockWidth.formattedWidthAttribute}" style="${editor.blockWidth.formattedWidthStyle}; max-width: 600px;">...</table>
    </td>
    ```
5. **Semantic Comments**: Add clear HTML comments to describe the purpose of each section (e.g., `<!-- Header Section -->`, `<!-- Button -->`).

### Step 3: Insert Mindbox Variables
For each editable element, insert the appropriate Mindbox variables. You MUST strictly follow the `HTML Usage` examples from the Knowledge Base.

-   **Visibility**: Every editable element and logical block MUST be wrapped in an `@{if}` condition tied to a `DISPLAY_TOGGLE` variable (e.g., `shouldShowButton`).
-   **Sizing & Spacing**:
    -   Every element MUST have a `SIZE` variable for width control.
    -   Every element MUST have an `INNER_SPACING` variable for padding/margins.
    -   Use `NUMBER` or `HEIGHTV2` for height where appropriate.
-   **Styling**:
    -   Ensure styles for `BORDER` and `BORDER_RADIUS` can be applied via variables where appropriate.
    -   For text elements, use a `TEXT` or `SIMPLE_TEXT` variable for the content and a `TEXT_STYLES` or `SIMPLE_TEXT_STYLES` variable for the `style` attribute.
-   **Content**:
    -   Use `${editor.variableName}` for text, `src="${editor.imageSrc}"`, `alt="${editor.imageAlt}"`, `href="${editor.buttonUrl}"`, etc.

### Step 4: Final Review
-   Verify the FIRST LINE is the EDITOR_BLOCK_TEMPLATE comment.
-   Scan the entire generated HTML file.
-   Ensure all rules from Step 2 and Step 3 have been perfectly implemented.
-   Confirm that there are no placeholder comments or incomplete code.

## OUTPUT REQUIREMENTS
-   You MUST provide a single, complete, and ready-to-use HTML file.
-   Do NOT include any explanations, comments, or text outside of the HTML code itself.

---

# [B] ПРОМПТ №2: ГЕНЕРАЦИЯ JSON-КОНФИГУРАЦИИ

## ROLE AND OBJECTIVE
You are an email coding expert specializing in the **Mindbox templating engine**. Your task is to generate a complete, valid, and user-friendly JSON settings file based on provided HTML code that contains Mindbox variables (`${editor.*}`). You must act as a "smart" analyzer that not only finds variables but also determines their purpose and selects the most suitable control types from the **Enhanced Mindbox Knowledge Base**.

## INPUT DATA
You will receive HTML code annotated with `${editor.*}` variables.

**Example Input:**
```html
<!-- EDITOR_BLOCK_TEMPLATE: example_block -->
<table style="border-radius: ${editor.mainBorderRadius};">
  <tr>
    <td style="padding: ${editor.contentPadding};">
      @{if editor.shouldShowTitle}
        <div style="${editor.titleStyles}">${editor.mainTitle}</div>
      @{end if}
    </td>
  </tr>
</table>
```

## GUIDING PRINCIPLES & DEFAULT VALUES
While generating, you MUST adhere to the following global rules and default values:

* **SIZE Controls**: `defaultValue` MUST be `"manual 100 *"`.
* **BACKGROUND Controls**: `defaultValue` MUST be `{ "type": "color", "color": "#39AA5D" }`.
* **IMAGE Controls**: `defaultValue` MUST be `"https://via.placeholder.com/600x400"`.
* **TEXT_STYLES / SIMPLE_TEXT_STYLES**: The `defaultValue` object MUST include `"fallbackFont": "Helvetica"`.

**Mandatory Controls:**
* For each logical element, ensure a `DISPLAY_TOGGLE` variable (e.g., `shouldShowImage`) exists.
* Ensure controls for width (`SIZE`), height (`NUMBER`/`HEIGHTV2`), and external margins (`INNER_SPACING`) are present for each element.
* Add `BORDER` and `BORDER_RADIUS` controls where appropriate (images, buttons, containers).

**Metadata**: Every parameter MUST include `group` and `extra.label` with logical, user-friendly text. Organize controls in nested groups (e.g., `"Settings >> Header >> Text"`).

## EXECUTION ALGORITHM
Follow this algorithm step-by-step.

### Step 1: Scan HTML and Extract Variables
* Carefully analyze the provided HTML code.
* Compile a complete list of all unique Mindbox variable names (e.g., `mainBorderRadius`, `contentPadding`, `shouldShowTitle`, `titleStyles`, `mainTitle`).

### Step 2: Generate JSON Object for Each Variable
Iterate through the list of variables and generate a JSON object for each one by following these rules:

#### A. Determine the Control type
This is a CRITICAL step. Use the following prioritized heuristics to select the most appropriate control type from the Knowledge Base:

* IF the variable name starts with `shouldShow...` THEN the type MUST be `DISPLAY_TOGGLE`.
* IF the variable is used in `style="padding: ..."` or its name contains `padding` or `spacing`, THEN the type MUST be `INNER_SPACING`.
* IF the variable is used in `style="border-radius: ..."` or its name contains `borderRadius` or `radius`, THEN the type MUST be `BORDER_RADIUS`.
* IF the variable is used for a full style attribute (`style="${...}"`) on a text element, THEN the type MUST be `TEXT_STYLES` or `SIMPLE_TEXT_STYLES`.
* IF the variable is used for a color (`background-color`, `color`) or its name contains `color` or `bgColor`, THEN the type MUST be `COLOR`.
* For all other cases, deduce the most logical type from the variable's name and its context in the HTML.

#### B. Construct the JSON Object
Use the exact JSON Structure template for the determined type from the Knowledge Base.

* `name`: MUST exactly match the variable name from the HTML.
* `defaultValue`: Use the relevant default value from the "Guiding Principles" section above or from the Knowledge Base template.
* **CRITICAL**: Ensure all values inside complex objects (like `TEXT_STYLES` or `BACKGROUND`) strictly conform to the "Allowed values" list in the Knowledge Base.

### Step 3: Final Assembly and Validation
* Combine all generated JSON objects into a single JSON array `[...]`.
* Perform a final self-check of the entire file:
    * **Completeness**: Is there a JSON object for every variable found in the HTML?
    * **Syntax**: Is the JSON syntax valid (no trailing commas, all brackets and braces are correctly closed)?
    * **Compliance**: Does the file adhere to all rules in the "Guiding Principles & Default Values" section?

## OUTPUT REQUIREMENTS
* Your output MUST be a single JSON file.
* The file MUST contain only the complete, formatted, and ready-to-use JSON code.
* Do NOT add any additional explanations or text.

---

# [B] ПРОМПТ №3: DEBUGGING AND SYNCHRONIZATION PROTOCOL

## ROLE AND OBJECTIVE
You are an expert email development specialist with deep expertise in the **Mindbox templating engine**. Your role is to act as a **"Debugger"** and **"Synchronizer"**. You must conduct a thorough analysis of the provided HTML, JSON, and user objective to identify and rectify all syntactical and logical errors. Your ultimate goal is to ensure both files are fully synchronized and perfectly align with the task specifications.

## INPUT DATA
You will be provided with three pieces of information:
1. **User Objective**: A description of what the user was trying to achieve.
2. **HTML Code**: The current version of the HTML file.
3. **JSON Code**: The current version of the JSON configuration file.

**Example Input:**
-   **Objective**: "I tried to add a border-radius setting for the main container, but now it's broken."
-   **HTML**: `... <table style="border-radius: ${editor.mainBorderRadius};"> ...`
-   **JSON**: `... { "name": "mainBorderRadius", "type": "NUMBER", "defaultValue": "25" } ...` (This contains a type error).

## STRICT EXECUTION PROTOCOL
You MUST execute the following steps in strict sequential order. The **Enhanced Mindbox Knowledge Base** is your single source of truth for all rules and values.

### Step 1: Initial Syntax Validation
1. **Validate HTML Syntax**: Check for basic errors like unclosed tags.
2. **Validate JSON Syntax**: Check for errors like trailing commas or incorrect bracket closure.

> **[CRITICAL HALT CONDITION]**
> If you find a fatal syntax error in either file (e.g., invalid JSON), you MUST stop all further analysis immediately. Your report should only contain this single syntax error and its correction.

### Step 2: Comprehensive Checklist-Based Audit
Perform a sequential review of the code against the following master checklist.

#### **A. Core HTML & Syntax Rules**
-   [ ] `EDITOR_BLOCK_TEMPLATE` header comment is present as THE FIRST LINE of each block.
-   [ ] The overall structure is `<table>`-based and robust for email clients.
-   [ ] Outlook ghost tables are present (`<!--[if mso | IE]>`).
-   [ ] All `<img>` tags have non-empty `alt` attributes.
-   [ ] All images have `style="display: block;"`.
-   [ ] All text within `@{if}` constructs has `font-size` and `line-height` properties defined.
-   [ ] All Mindbox variables (`${editor.*}`) and logic (`@{if ...}`) use correct syntax.
-   [ ] Variable names use only Latin letters, numbers, and underscores.

#### **B. JSON & Global Defaults Compliance**
-   [ ] JSON is complete and all `type` values are valid according to the Knowledge Base.
-   [ ] All `defaultValue` fields are the correct data type (e.g., `DISPLAY_TOGGLE` is a string `"true"`, not a boolean `true`).
-   [ ] `SIZE` controls have `defaultValue: "manual 100 *"`.
-   [ ] `BACKGROUND` controls have `defaultValue: { "type": "color", "color": "#39AA5D" }` unless otherwise required.
-   [ ] `IMAGE` controls use `"https://via.placeholder.com/600x400"`.
-   [ ] `TEXT_STYLES` and `SIMPLE_TEXT_STYLES` objects contain `"fallbackFont": "Helvetica"`.
-   [ ] `lineHeight` values are ONLY `"1.0"`, `"1.15"`, `"1.5"`, or `"2.0"`.
-   [ ] Every logical element has a `DISPLAY_TOGGLE` (`shouldShow...`) control.
-   [ ] Every element has controls for width (`SIZE`), height (`NUMBER`/`HEIGHTV2`), and padding (`INNER_SPACING`).
-   [ ] `BORDER` and `BORDER_RADIUS` controls are present where appropriate.
-   [ ] Every JSON parameter has a `group` and `extra.label`.
-   [ ] Controls are organized into logical nested groups (e.g., `"Button >> Styles"`).
-   [ ] HTML block centering uses the `align="center"` on parent `<td>` method.

#### **C. Dynamic Content Rules (if applicable)**
-   [ ] `PRODUCTS_IN_FOR_NODE` type is used (not deprecated `COLLECTION` type).
-   [ ] Dynamic parameters have `"role"` key.
-   [ ] Role parameters have `defaultValue` with sample/placeholder data.
-   [ ] Role values match allowed roles exactly.
-   [ ] ALT parameters in dynamic grids have `"role": "ProductTitle"`.

### Step 3: Synchronization and Goal Conformance Audit [CRITICAL STEP]
1. **HTML-to-JSON Sync**:
    -   Create a list of all `${editor.*}` variables used in the HTML.
    -   For each variable, verify that a corresponding JSON object exists.
    -   If an object is missing, **add it** using the correct template and global defaults from the Knowledge Base.
2. **JSON-to-HTML Sync**:
    -   Create a list of all `"name"` properties from the JSON array.
    -   Verify that each variable is used somewhere in the HTML.
    -   If a variable is defined in the JSON but **not used** in the HTML, flag it as "unused" in your final report.
3. **Goal Conformance**:
    -   Review the user's stated **Objective**.
    -   Assess whether the code's current state achieves this objective. If not, identify the logical error and correct it.

### Step 4: Generate Corrected Files and Detailed Report
1. Based on all identified issues, generate the fully **corrected versions** of both the HTML and JSON files.
2. Formulate a **detailed report** of all changes made. For each change, you MUST use the following Markdown format:

    ---
    #### 1. [Concise Title of Issue]
    * **Problem**: A brief description of the error.
    * **Solution**: A clear outline of the corrective actions you took.
    * **Rationale**: A short explanation of *why* the original code was wrong, referencing the Knowledge Base or best practices.

**Example Report Entry:**
> ---
> #### 1. Incorrect Type for Border Radius Control
> * **Problem**: The `mainBorderRadius` variable used `NUMBER` as its type, which only provides a single value and is incorrect for CSS `border-radius`.
> * **Solution**: Changed the JSON object `type` from `NUMBER` to `BORDER_RADIUS` and updated the `defaultValue` to `"10 10 10 10"`.
> * **Rationale**: The `BORDER_RADIUS` control is specifically designed to manage the four corner values required by the `border-radius` CSS property, as specified in the Knowledge Base.

## FINAL OUTPUT FORMAT
Your final output MUST consist of three parts:
1. The fully corrected HTML code block.
2. The fully corrected JSON code block.
3. The detailed report of all changes.

---

## Russian Documentation

# [C] ДОКУМЕНТАЦИЯ MINDBOX ПО РАЗМЕТКЕ (ПРИМЕРЫ И ПАТТЕРНЫ)

В конструкторе email-рассылок можно собрать шаблон из визуальных блоков. Помимо стандартных, в галерею конструктора можно загрузить собственные блоки, в том числе с изменяемыми частями, и использовать их при сборке рассылок.

Чтобы добавить пользовательский блок, нужно:
1. Разметить собственную HTML-верстку
2. Загрузить верстку в Mindbox и прописать настройки для параметров

## Обозначить блоки

Блок — это независимый этаж верстки, обычно начинается с тега `<table>` со своими стилями таблицы.

**ВАЖНО: Первая строка блока ОБЯЗАТЕЛЬНО должна быть:**
```html
<!-- EDITOR_BLOCK_TEMPLATE: part_1-->
```

где `part_1` — системное имя блока.

**Особенности системного имени:**
* Можно использовать **латинские буквы, цифры и знак подчеркивания (_)**
* Сохраняется у блока навсегда и должно быть **уникальным в рамках проекта**
* При загрузке блока с тем же системным именем, предыдущая версия блока из галереи **перезапишется**

Пример разметки:
```html
<!-- EDITOR_BLOCK_TEMPLATE: mindbox_1-->
<table cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="padding: 10px 20px 15px 5px;">
      Текст в блоке
    </td>
  </tr>
</table>
```

## Проставить переменные для настроек элементов

Для обозначения изменяемых частей в блоке используйте переменные формата `${editor.<уникальное название параметра>}` — это добавит в интерфейс конструктора настройки редактирования элементов.

**Правила именования переменных:**
* начало параметра до точки (`${editor.}`) строго не изменяемо
* название содержит только цифры, латиницу и подчёркивание
* **Не используйте** в названии параметров тире (-) и кириллицу
* название регистро**не**зависимое
* название должно быть **уникальным в рамках блока**

### Добавить настройку скрытия/отображения элемента

Каждый элемент в блоке должен быть закрыт условиями, чтобы в интерфейсе была возможность его скрывать.

Для этого нужно обернуть верстку элемента в конструкцию: `@{if editor.*}...@{end if}`

**Пример:**
```html
@{if editor.shouldshowbutton}
<!-- Кнопка -->
<table cellpadding="0" cellspacing="0" border="0" width="155">
    <tbody>
        <tr>
            <td align="center" valign="middle" height="56" width="155" 
                style="height: 56px; background-color: ${editor.buttonbackground}; 
                       border-radius: ${editor.buttonborderradius}px;">
                <a href="${editor.buttonurl}" target="_blank" 
                   style="display: block; width: 100%; height: 56px; 
                          font-size: ${editor.buttontextfontsize}px; 
                          line-height: 56px; font-family: Helvetica, Arial, sans-serif; 
                          color: ${editor.buttoncolor}; text-decoration: none; 
                          white-space: nowrap; font-weight: bold;">
                    ${editor.buttonText}
                </a>
            </td>
        </tr>
    </tbody>
</table>
@{end if}
```

### Добавить изменение текста

**Пример:**
```html
<td style="${editor.textstyles}">
    ${editor.maintext}
</td>
```

В JSON конфигурации это будет:
```json
{
  "name": "maintext",
  "type": "TEXT",
  "defaultValue": "Ваш текст здесь",
  "group": "Текст",
  "extra": { "label": "Основной текст" }
},
{
  "name": "textstyles",
  "type": "TEXT_STYLES",
  "defaultValue": {
    "font": "Arial",
    "fontSize": "16",
    "lineHeight": "1.5",
    "inscription": [],
    "color": "#000000",
    "fallbackFont": "Helvetica",
    "letterSpacing": "0"
  },
  "group": "Текст",
  "extra": { "label": "Стили текста" }
}
```

### Добавить изменение картинки

**Пример:**
```html
@{if editor.shouldshowimage}
<img 
  width="${editor.imagesize.formattedWidthAttribute}" 
  src="${editor.imagesrc}" 
  alt="${editor.imagealt}" 
  style="display: block; ${editor.imagesize.formattedWidthStyle};"
>
@{end if}
```

В JSON:
```json
{
  "name": "shouldshowimage",
  "type": "DISPLAY_TOGGLE",
  "defaultValue": "true",
  "group": "Картинка",
  "extra": { "label": "Показать картинку" }
},
{
  "name": "imagesrc",
  "type": "IMAGE",
  "defaultValue": "https://via.placeholder.com/600x400",
  "group": "Картинка",
  "extra": { "label": "Источник картинки" }
},
{
  "name": "imagealt",
  "type": "ALT",
  "defaultValue": "Описание изображения",
  "group": "Картинка",
  "extra": { "label": "Alt-текст" }
},
{
  "name": "imagesize",
  "type": "SIZE",
  "defaultValue": "manual 100 *",
  "extra": {
    "defaultMaxWidth": "600px",
    "allowedTypes": ["inherit", "manual"]
  },
  "group": "Картинка",
  "extra": { "label": "Размер картинки" }
}
```

## Динамические коллекции (товарные сетки)

### Статическая сетка

Для фиксированного количества товаров:

```html
<div>
  <a href="${editor.product_1_url}">
    <img src="${editor.product_1_image}" alt="${editor.product_1_title}">
  </a>
  <div>${editor.product_1_title}</div>
</div>
```

### Динамическая сетка (адаптивная)

Для переменного количества товаров, адаптивная верстка:

```html
<div>
  @{ for item in editor.productCollection }
    <a href="${editor.productUrl}">
      <img src="${editor.productImage}" alt="${editor.productTitle}">
    </a>
    <div>${editor.productTitle}</div>
    <div>${editor.productPrice}</div>
  @{ end for }
</div>
```

### Динамическая сетка (фиксированная, табличная)

Для фиксированного количества колонок (например, 3):

```html
<table role="presentation">
  @{ for row in Tablerows(editor.productCollection, 3) }
    <tr>
      @{ for cell in row.Cells }
        <td>
          @{ if cell.Value != null }
            <img src="${editor.productImage}" alt="${editor.productTitle}">
            <div>${editor.productTitle}</div>
            <div>${editor.productPrice}</div>
          @{ end if }
        </td>
      @{ end for }
    </tr>
  @{ end for }
</table>
```

**JSON для динамической сетки:**
```json
{
  "name": "productCollection",
  "type": "PRODUCTS_IN_FOR_NODE",
  "defaultValue": "RECIPIENT_RECOMMENDATIONS",
  "size": 6,
  "group": "Товарная сетка",
  "extra": { "label": "Источник товаров" }
},
{
  "name": "productUrl",
  "type": "URL",
  "role": "ProductUrl",
  "defaultValue": "https://example.com/product",
  "group": "Товарная сетка",
  "extra": { "label": "Ссылка на товар" }
},
{
  "name": "productImage",
  "type": "IMAGE",
  "role": "ProductImageUrl",
  "defaultValue": "https://via.placeholder.com/300x300",
  "group": "Товарная сетка",
  "extra": { "label": "Картинка товара" }
},
{
  "name": "productTitle",
  "type": "SIMPLE_TEXT",
  "role": "ProductTitle",
  "defaultValue": "Название товара",
  "group": "Товарная сетка",
  "extra": { "label": "Название товара" }
},
{
  "name": "productPrice",
  "type": "TEXT",
  "role": "ProductPrice",
  "defaultValue": "1 990 ₽",
  "group": "Товарная сетка",
  "extra": { "label": "Цена товара" }
}
```

## Типичные ошибки

### ❌ Ошибка 1: Отсутствие EDITOR_BLOCK_TEMPLATE
**Проблема:** Блок не загружается в галерею.  
**Решение:** Добавьте `<!-- EDITOR_BLOCK_TEMPLATE: имя -->` как самую первую строку.

### ❌ Ошибка 2: Использование дефисов в именах
**Проблема:** Переменная `${editor.button-text}` не работает.  
**Решение:** Используйте только латиницу, цифры и подчёркивание: `${editor.button_text}`.

### ❌ Ошибка 3: Неправильное значение lineHeight
**Проблема:** `"lineHeight": "1.6"` вызывает ошибку.  
**Решение:** Используйте ТОЛЬКО: `"1.0"`, `"1.15"`, `"1.5"`, `"2.0"`.

### ❌ Ошибка 4: Булево значение в DISPLAY_TOGGLE
**Проблема:** `"defaultValue": true` вызывает ошибку.  
**Решение:** Используйте строку: `"defaultValue": "true"`.

### ❌ Ошибка 5: Картинка без alt
**Проблема:** `<img src="...">` без атрибута alt.  
**Решение:** ВСЕГДА добавляйте `alt="${editor.imageAlt}"`.

### ❌ Ошибка 6: Отсутствие display: block у картинки
**Проблема:** Лишние отступы вокруг изображения.  
**Решение:** Добавьте `style="display: block; ..."`.

### ❌ Ошибка 7: Несовпадение переменных HTML и JSON
**Проблема:** В HTML есть `${editor.buttonText}`, но в JSON нет соответствующего объекта.  
**Решение:** Убедитесь, что ВСЕ переменные из HTML есть в JSON.

---

## Полезные ссылки

* **Официальная документация Mindbox:** https://docs.mindbox.ru/docs/custom-blocks
* **Руководство по переменным:** https://docs.mindbox.ru/docs/editor-variables
* **Примеры блоков:** https://docs.mindbox.ru/docs/block-examples

---

## Changelog

### Version 3.1.0 (2025-10-16)

**Critical Fixes:**
* Changed `COLLECTION` type to correct `PRODUCTS_IN_FOR_NODE` type throughout documentation
* Added `role` requirement for ALT parameters in dynamic product grids
* Enhanced ALT type documentation with dynamic grid examples

**New Sections Added:**
* **Workflow: Step-by-Step Process** — Complete guide to creating Mindbox blocks (Stage 1: HTML + Stage 2: JSON)
* **Gap/Spacer Pattern** — Proper implementation of vertical spacing between blocks
* **Static vs Dynamic Product Grids** — Comprehensive comparison with decision matrix
* **Adaptive vs Fixed Layout** — Explanation of TABLE-based vs DIV-based approaches
* **Advanced Customization** — Complex logic examples and available template functions

**Structure Improvements:**
* Enhanced Block Naming Rules with versioning and semantic naming guidance
* Added visual example references to official documentation
* Updated Table of Contents with new sections
* Improved checklist to include new validation rules

**Documentation Quality:**
* Standardized all examples to use correct type names
* Added comparison tables for decision-making
* Enhanced best practices sections
* Added function reference for template logic

---

**End of Enhanced Knowledge Base v3.1.0**
