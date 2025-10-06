# MINDBOX EMAIL BLOCKS - COMPLETE KNOWLEDGE BASE

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

This document is the master reference for all valid JSON configurations used in Mindbox custom email blocks. Use these definitions and allowed values to ensure compatibility and prevent errors.

---

## Content & Display Controls

### **DISPLAY_TOGGLE**
Adds a checkbox in the editor to show or hide an HTML element.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `DISPLAY_TOGGLE` |
| **Description** | A simple boolean toggle, represented as a string. |
| **Default Value** | `"true"` or `"false"` |
| **HTML Usage** | `@{if editor.uniqueVariableName} ... HTML to show/hide ... @{end if}` |
| **JSON Structure** | `{ "name": "shouldShowElement", "type": "DISPLAY_TOGGLE", "defaultValue": "true", "group": "Visibility", "extra": { "label": "Show Element" } }` |

### **TEXT**
A rich text editor for paragraphs, supporting basic formatting (bold, italic, links).

| Property | Description |
| :--- | :--- |
| **JSON Type** | `TEXT` |
| **Description** | Used for multi-line text blocks that require formatting. |
| **Default Value** | `"Your rich text content here..."` |
| **HTML Usage** | `<div>${editor.uniqueVariableName}</div>` |
| **JSON Structure** | `{ "name": "mainText", "type": "TEXT", "defaultValue": "Your rich text...", "group": "Content", "extra": { "label": "Main Text Block" } }` |

### **SIMPLE_TEXT**
A simple input field for short, unformatted text.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `SIMPLE_TEXT` |
| **Description** | Ideal for button labels, menu items, or table cells. No rich text formatting. |
| **Default Value** | `"Your simple text here"` |
| **HTML Usage** | `<a>${editor.uniqueVariableName}</a>` |
| **JSON Structure** | `{ "name": "buttonText", "type": "SIMPLE_TEXT", "defaultValue": "Click Here", "group": "Content", "extra": { "label": "Button Text" } }` |

### **URL**
An input field specifically for URLs.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `URL` |
| **Description** | Validates input for URL format. |
| **Default Value** | `"https://mindbox.ru"` |
| **HTML Usage** | `<a href="${editor.uniqueVariableName}">...</a>` |
| **JSON Structure** | `{ "name": "buttonLink", "type": "URL", "defaultValue": "https://mindbox.ru", "group": "Content", "extra": { "label": "Button Link" } }` |

### **IMAGE**
An interface to upload an image or provide a URL.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `IMAGE` |
| **Description** | Standard image upload control. |
| **Default Value** | `"https://mindbox.ru/build/assets/images/mb-fav_marketing_green-Ds-aOpBM.svg"` |
| **HTML Usage** | `<img src="${editor.uniqueVariableName}" ... >` |
| **JSON Structure** | `{ "name": "headerImage", "type": "IMAGE", "defaultValue": "...", "group": "Media", "extra": { "label": "Header Image" } }` |

### **ALT**
An input field for the image's alternative text.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `ALT` |
| **Description** | Provides accessibility text for images. |
| **Default Value** | `"Descriptive alt text"` |
| **HTML Usage** | `<img ... alt="${editor.uniqueVariableName}">` |
| **JSON Structure** | `{ "name": "imageAltText", "type": "ALT", "defaultValue": "Company Logo", "group": "Media", "extra": { "label": "Image Alt Text" } }` |

### **ICON**
An interface to upload a small image or icon.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `ICON` |
| **Description** | Functionally similar to IMAGE, but intended for smaller graphics. |
| **Default Value** | `"https://via.placeholder.com/24"` |
| **HTML Usage** | `<img src="${editor.uniqueVariableName}" ... >` |
| **JSON Structure** | `{ "name": "socialIcon", "type": "ICON", "defaultValue": "...", "group": "Media", "extra": { "label": "Social Media Icon" } }` |

---

## Styling Controls

### **COLOR**
A standard color picker.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `COLOR` |
| **Description** | Provides a UI for selecting a hex color value. |
| **Default Value** | `"#000000"` |
| **HTML Usage** | `style="color: ${editor.uniqueVariableName};"` |
| **JSON Structure** | `{ "name": "textColor", "type": "COLOR", "defaultValue": "#333333", "group": "Styles", "extra": { "label": "Text Color" } }` |

### **TEXT_STYLES**
A full suite of text styling options for multi-line, rich text.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `TEXT_STYLES` |
| **Description** | A complex object for controlling font, size, color, spacing, etc. |
| **Default Value** | See JSON Structure. |
| **HTML Usage** | `<div style="${editor.uniqueName}">${editor.textVariableName}</div>` |
| **JSON Structure** | `{ "name": "uniqueTextStylesName", "type": "TEXT_STYLES", "defaultValue": { "font": "Arial", "fontSize": "16", "lineHeight": "1.5", "inscription": [], "color": "#000000", "fallbackFont": "Helvetica", "letterSpacing": "0" }, "group": "Text Styles", "extra": { "label": "Paragraph Styles" } }` |
| **Allowed Values**| **font**: "Roboto", "Open Sans", "Montserrat", "Inter", "Arial", "Geneva", "Helvetica", "Times New Roman", "Verdana", "Courier / Courier New", "Tahoma", "Georgia", "Palatino", "Trebuchet MS" <br> **fontSize**: `<number as string>` <br> **lineHeight**: "1.0", "1.15", "1.5", "2.0" <br> **inscription**: `[]` (regular), `["bold"]`, `["italic"]`, `["underlined"]`, `["crossed"]` <br> **fallbackFont**: (see font) <br> **letterSpacing**: `<number as string>`|

### **SIMPLE_TEXT_STYLES**
Text styling options for single-line text, including a color picker.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `SIMPLE_TEXT_STYLES` |
| **Description** | Similar to `TEXT_STYLES` but for text without rich formatting. |
| **Default Value** | See JSON Structure. |
| **HTML Usage** | `<span style="${editor.uniqueName}">${editor.textVariableName}</span>` |
| **JSON Structure** | `{ "name": "uniqueSimpleStylesName", "type": "SIMPLE_TEXT_STYLES", "defaultValue": { "font": "Arial", "fontSize": "16", "lineHeight": "1.5", "inscription": [], "color": "#000000", "fallbackFont": "Helvetica", "letterSpacing": "0" }, "group": "Text Styles", "extra": { "label": "Heading Styles" } }` |
| **Allowed Values**| See `TEXT_STYLES`.|

### **BACKGROUND**
A complex control for managing the background of a `<td>` element.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `BACKGROUND` |
| **Description** | Can be set to transparent, a solid color, or an image with fallback color. |
| **Default Value** | `{ "type": "color", "color": "#39AA5D" }` |
| **HTML Usage** | `<td bgcolor="${editor.uniqueName.color}" style="${editor.uniqueName.formattedBackgroundStyles};" ${if(editor.uniqueName.type == "image", 'background="' + editor.uniqueName.image + '"', "" )}>...</td>` |
| **JSON Structure** | `{ "name": "uniqueBackgroundName", "type": "BACKGROUND", "defaultValue": { "type": "color", "color": "#39AA5D" }, "group": "Block Styles", "extra": { "label": "Block Background" } }` |
| **Allowed Values**| **Transparent**: `{ "type": "transparent" }` <br> **Color**: `{ "type": "color", "color": "#RRGGBB" }` <br> **Image**: `{ "type": "image", "url": "URL", "color": "#RRGGBB", "mode": "contain / cover / repeat / stretch" }` (color is a fallback) |

### **BORDER**
Control for the border style of an element.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `BORDER` |
| **Description** | Defines border style, color, and width. |
| **Default Value** | `"solid black 2"` (style, color, width in px) or `"none"` |
| **HTML Usage** | `style="border: ${editor.uniqueVariableName};"` |
| **JSON Structure** | `{ "name": "imageBorder", "type": "BORDER", "defaultValue": "none", "group": "Styles", "extra": { "label": "Image Border" } }` |

### **ALIGN**
Sets the horizontal alignment of content within a `<td>`.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `ALIGN` |
| **Description** | Controls `align` attribute for table cells. |
| **Default Value** | `"left"`, `"right"`, or `"center"` |
| **HTML Usage** | `<td align="${editor.uniqueVariableName}">...</td>` |
| **JSON Structure** | `{ "name": "contentAlign", "type": "ALIGN", "defaultValue": "center", "group": "Layout", "extra": { "label": "Content Alignment" } }` |

---

## Sizing & Spacing Controls

### **NUMBER**
A field for any numerical value.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `NUMBER` |
| **Description** | Used for custom spacing, font sizes, or heights where `HEIGHTV2` is not applicable. |
| **Default Value** | `"10"` |
| **HTML Usage** | `style="padding-top: ${editor.uniqueVariableName}px;"` |
| **JSON Structure** | `{ "name": "spacerHeight", "type": "NUMBER", "defaultValue": "20", "group": "Layout", "extra": { "label": "Spacer Height (px)" } }` |

### **SIZE**
Controls the width of an element, typically an image or table.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `SIZE` |
| **Description** | Manages `width` attribute and `width` style property for responsive behavior. |
| **Default Value** | `"manual 100 *"` |
| **HTML Usage** | `<img width="${editor.uniqueName.formattedWidthAttribute}" style="${editor.uniqueName.formattedWidthStyle};">` |
| **JSON Structure** | `{ "name": "logo_size", "type": "SIZE", "defaultValue": "manual 100 *", "extra": { "defaultMaxWidth": "600px", "allowedTypes": ["inherit", "manual"] }, "group": "Layout", "extra": { "label": "Element Width" } }` |

### **HEIGHTV2**
Controls the height of a block-level element.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `HEIGHTV2` |
| **Description** | Sets desktop and mobile height values. |
| **Default Value** | `"100 100"` (desktop mobile) |
| **HTML Usage** | `<td height="${editor.uniqueName.formattedHeight}">` |
| **JSON Structure** | `{ "name": "blockHeight", "type": "HEIGHTV2", "defaultValue": "50 50", "group": "Layout", "extra": { "label": "Block Height" } }` |

### **TEXT_SIZE**
Controls the height of a text container.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `TEXT_SIZE` |
| **Description** | Sets desktop and mobile height for a text container. |
| **Default Value** | `"30 30"` (desktop mobile) |
| **HTML Usage** | `<div style="${editor.uniqueName.containerStyle};" height="${editor.uniqueName.containerHeightAttribute}">...</div>` |
| **JSON Structure** | `{ "name": "textContainerHeight", "type": "TEXT_SIZE", "defaultValue": "40 40", "group": "Layout", "extra": { "label": "Text Container Height" } }` |

### **BUTTON_SIZE**
Controls the width and height of a button.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `BUTTON_SIZE` |
| **Description** | A complex object for responsive button dimensions. |
| **Default Value** | `{ "width": "pixels 100 80", "height": "50 40" }` |
| **HTML Usage** | `<table width="${editor.uniqueName.width}" style="width:${editor.uniqueName.formattedWidth};"><td height="${editor.uniqueName.height}" style="height: ${editor.uniqueName.formattedHeight};">...</td></table>` |
| **JSON Structure** | `{ "name": "mainButtonSize", "type": "BUTTON_SIZE", "defaultValue": { "width": "pixels 150 120", "height": "50 40" }, "group": "Layout", "extra": { "label": "Button Size" } }` |
| **Allowed Values**| **width types**: `pixels`, `percent` |

### **BORDER_RADIUS**
Four input fields to control corner rounding for an element.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `BORDER_RADIUS` |
| **Description** | Sets Top-Left, Top-Right, Bottom-Right, Bottom-Left radii. |
| **Default Value** | `"25 25 25 25"` |
| **HTML Usage** | `style="border-radius: ${editor.uniqueName};"` |
| **JSON Structure** | `{ "name": "buttonBorderRadius", "type": "BORDER_RADIUS", "defaultValue": "10 10 10 10", "group": "Styles", "extra": { "label": "Button Corner Radius" } }` |

### **INNER_SPACING**
Four input fields to control internal padding.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `INNER_SPACING` |
| **Description** | Sets Top, Right, Bottom, Left padding. |
| **Default Value** | `"10 25 10 25"` |
| **HTML Usage** | `style="padding: ${editor.uniqueName};"` |
| **JSON Structure** | `{ "name": "blockPadding", "type": "INNER_SPACING", "defaultValue": "20 20 20 20", "group": "Layout", "extra": { "label": "Internal Padding" } }` |

---

## Dynamic Content Controls

### **COLLECTION**
A dropdown to select a product feed for dynamic content.

| Property | Description |
| :--- | :--- |
| **JSON Type** | `COLLECTION` |
| **Description** | Links the block to a dynamic data source. Used to generate dynamic product grids. |
| **Default Value** | `"RECIPIENT_RECOMMENDATIONS"` |
| **HTML Usage** | `@{for item in editor.uniqueVariableName} ... <tr><td>...product card...</td></tr> ... @{end for}` |
| **JSON Structure** | `{ "name": "productFeed", "type": "COLLECTION", "defaultValue": "RECIPIENT_RECOMMENDATIONS", "group": "Dynamic Content", "extra": { "label": "Product Source" } }` |
| **Allowed Values**| "RECIPIENT_RECOMMENDATIONS", "FROM_SEGMENT", "FROM_PRODUCT_LIST", "ORDER", "VIEWED_PRODUCTS_IN_SESSION", "PRODUCT_LIST_ITEM", "PRODUCT_VIEW", "FROM_CUSTOMER_COMPUTED_FIELD" |
| **Important Notes**| - Must be used with `@{for}...@{end for}` loop syntax<br>- Loop must iterate table rows: `@{for item in editor.collection}<tr>...</tr>@{end for}`<br>- Product data accessed via `role` parameters (see below)<br>- Commonly used for: recommendations, order items, viewed products |

### **Dynamic Data Roles (`role`)**
Connects a JSON parameter to a specific product field within a dynamic grid.

| Property | Description |
| :--- | :--- |
| **JSON Key** | `role` |
| **Description** | This key is used **instead of** `defaultValue` to map a control to a product data field from the COLLECTION. Used exclusively in dynamic blocks. |
| **Allowed Values**| `ProductTitle`, `ProductPrice`, `ProductOldPrice`, `ProductUrl`, `ProductImageUrl`, `ProductDescription`, `ProductBadge` |
| **JSON Example**| `{ "name": "product_name", "type": "SIMPLE_TEXT", "role": "ProductTitle", "group": "Dynamic Product Card" }` |
| **Note**| For `ProductOldPrice` and `ProductPrice`, the recommended JSON type is `TEXT`.|
| **Usage Pattern**| 1. Define COLLECTION control<br>2. Wrap product card in `@{for item in editor.collection}`<br>3. Use role-based parameters inside loop: `${editor.product_title}`, `${editor.product_image}`, etc.<br>4. Each role parameter automatically populates from collection data |

---

## Global Defaults & Best Practices

* **Universal Controls**:
    * Every logical element (image, text block, button) **MUST** have a corresponding `DISPLAY_TOGGLE` control (e.g., `shouldShowImage`).
    * Every element **MUST** have controls for `SIZE` (width) and `INNER_SPACING` (external margins/padding). Use `NUMBER` or `HEIGHTV2` for height where applicable.
    * Where visually appropriate (images, containers, buttons), add `BORDER` and `BORDER_RADIUS` controls.

* **Default Values**:
    * **SIZE**: The `defaultValue` **MUST** be `"manual 100 *"`.
    * **BACKGROUND**: The `defaultValue` **MUST** be `{ "type": "color", "color": "#39AA5D" }` unless specified otherwise.
    * **IMAGE**: The `defaultValue` **MUST** be `"https://mindbox.ru/build/assets/images/mb-fav_marketing_green-Ds-aOpBM.svg"`.
    * **TEXT_STYLES / SIMPLE_TEXT_STYLES**: The `defaultValue` object **MUST** include `"fallbackFont": "Helvetica"`.
    * **NUMBER** (for gap/spacer): Typically `"20"` with `font-size: 8px;` for invisible content.

* **JSON Structure**:
    * Every parameter **MUST** have both a `group` and an `extra.label` key with clear, user-friendly values.
    * Organize controls into **nested groups**. For example, all controls for an image (visibility, source, size, border) should be in a group like `"Settings >> Image"`, not just `"Settings"`.

* **HTML Structure**:
    * To center a block, apply `align="center"` to the parent `<td>` and control the inner `<table>`'s width with a `SIZE` variable.
      ```html
      <td align="center">
        <table width="${editor.block_width.formattedWidthAttribute}" style="${editor.block_width.formattedWidthStyle};">...</table>
      </td>
      ```

* **Block Naming Rules**:
    * Block names (in `<!-- EDITOR_BLOCK_TEMPLATE: name -->`) must use only **Latin letters, digits, and underscores**
    * Block names must be **unique across the entire project**
    * Block names are **permanent** - re-uploading with the same name overwrites the previous version

* **Variable Naming Rules**:
    * Format: `${editor.descriptiveName}`
    * Use only: **Latin letters, digits, underscore (_)**
    * **NO dashes (-)**, **NO Cyrillic characters**
    * Variable names are **case-insensitive** but use camelCase for consistency
    * Must be **unique within each block**

---

## Block Upload Process

### Stage I: HTML Markup Preparation

**Step 1: Define Block Boundaries**
Each independent section of your email layout should be marked as a separate block:

```html
<!-- EDITOR_BLOCK_TEMPLATE: header_block -->
<table cellspacing="0" cellpadding="0" border="0" width="100%">
  <!-- Block content -->
</table>

<!-- EDITOR_BLOCK_TEMPLATE: product_grid -->
<table cellspacing="0" cellpadding="0" border="0" width="100%">
  <!-- Block content -->
</table>
```

**Step 2: Insert Mindbox Variables**
Replace editable content with `${editor.*}` variables:

```html
<!-- Before: Static content -->
<td style="padding: 20px;">
  <img src="logo.png" alt="Company Logo" width="150">
</td>

<!-- After: Editable with Mindbox variables -->
<td style="padding: ${editor.logoPadding};">
  @{if editor.shouldShowLogo}
    <img src="${editor.logoImage}" 
         alt="${editor.logoAlt}" 
         width="${editor.logoSize.formattedWidthAttribute}"
         style="${editor.logoSize.formattedWidthStyle};">
  @{end if}
</td>
```

**Step 3: Add Display Toggles**
Wrap each editable element in conditional logic:

```html
@{if editor.shouldShowButton}
  <table><!-- Button markup --></table>
@{end if}
```

### Stage II: JSON Configuration

After uploading HTML to Mindbox, define settings in the JSON configuration file:

```json
[
  {
    "name": "shouldShowLogo",
    "type": "DISPLAY_TOGGLE",
    "defaultValue": "true",
    "group": "Header >> Logo",
    "extra": { "label": "Show Logo" }
  },
  {
    "name": "logoImage",
    "type": "IMAGE",
    "defaultValue": "https://mindbox.ru/build/assets/images/mb-fav_marketing_green-Ds-aOpBM.svg",
    "group": "Header >> Logo",
    "extra": { "label": "Logo Image" }
  }
]
```

---

## Practical Examples & Patterns

### Example 1: Gap/Spacer Element

**Use Case**: Add adjustable vertical spacing between blocks.

**HTML Pattern**:
```html
<!-- EDITOR_BLOCK_TEMPLATE: spacer_block -->
@{if editor.shouldShowSpacer}
<table cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td>
      <div style="height: ${editor.spacerHeight}px; line-height: ${editor.spacerHeight}px; font-size: 8px;">
        &nbsp;
      </div>
    </td>
  </tr>
</table>
@{end if}
```

**JSON Configuration**:
```json
[
  {
    "name": "shouldShowSpacer",
    "type": "DISPLAY_TOGGLE",
    "defaultValue": "true",
    "group": "Spacing",
    "extra": { "label": "Show Spacer" }
  },
  {
    "name": "spacerHeight",
    "type": "NUMBER",
    "defaultValue": "20",
    "group": "Spacing",
    "extra": { "label": "Spacer Height (px)" }
  }
]
```

**Key Points**:
- Use `NUMBER` type for height value
- Set `font-size: 8px;` to make the `&nbsp;` character minimal
- Match `height` and `line-height` for consistency

---

### Example 2: Static to Dynamic Product Grid Conversion

**Original Static HTML** (3 hardcoded products):
```html
<table width="100%">
  <tr>
    <td width="33%">
      <img src="product1.jpg" alt="Product 1">
      <div>Product Name 1</div>
      <div>$99.99</div>
    </td>
    <td width="33%">
      <img src="product2.jpg" alt="Product 2">
      <div>Product Name 2</div>
      <div>$129.99</div>
    </td>
    <td width="33%">
      <img src="product3.jpg" alt="Product 3">
      <div>Product Name 3</div>
      <div>$149.99</div>
    </td>
  </tr>
</table>
```

**Converted to Dynamic Grid**:
```html
<!-- EDITOR_BLOCK_TEMPLATE: product_recommendations -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    @{for item in editor.productCollection}
    <td width="33%" align="center" style="padding: ${editor.productPadding};">
      @{if editor.shouldShowProductImage}
        <a href="${editor.productUrl}">
          <img src="${editor.productImage}" 
               alt="${editor.productTitle}"
               width="${editor.productImageSize.formattedWidthAttribute}"
               style="display: block; ${editor.productImageSize.formattedWidthStyle};">
        </a>
      @{end if}
      
      @{if editor.shouldShowProductTitle}
        <div style="${editor.titleStyles}">
          <a href="${editor.productUrl}">${editor.productTitle}</a>
        </div>
      @{end if}
      
      @{if editor.shouldShowProductPrice}
        <div style="${editor.priceStyles}">
          ${editor.productPrice}
        </div>
      @{end if}
    </td>
    @{end for}
  </tr>
</table>
```

**JSON Configuration with Roles**:
```json
[
  {
    "name": "productCollection",
    "type": "COLLECTION",
    "defaultValue": "RECIPIENT_RECOMMENDATIONS",
    "group": "Product Grid >> Data Source",
    "extra": { "label": "Product Collection" }
  },
  {
    "name": "productTitle",
    "type": "SIMPLE_TEXT",
    "role": "ProductTitle",
    "group": "Product Grid >> Content",
    "extra": { "label": "Product Title" }
  },
  {
    "name": "productImage",
    "type": "IMAGE",
    "role": "ProductImageUrl",
    "group": "Product Grid >> Content",
    "extra": { "label": "Product Image" }
  },
  {
    "name": "productUrl",
    "type": "URL",
    "role": "ProductUrl",
    "group": "Product Grid >> Content",
    "extra": { "label": "Product Link" }
  },
  {
    "name": "productPrice",
    "type": "TEXT",
    "role": "ProductPrice",
    "group": "Product Grid >> Content",
    "extra": { "label": "Product Price" }
  }
]
```

**Conversion Steps**:
1. **Identify the repeating pattern** (single product card)
2. **Wrap in `@{for}...@{end for}` loop** using COLLECTION variable
3. **Replace static values** with role-based parameters
4. **Use `role` instead of `defaultValue`** in JSON for product data
5. **Keep the table row structure** - loop must iterate `<td>` cells within a single `<tr>`

---

### Example 3: Dynamic Product Grid Best Practices

**Complete Dynamic Grid with All Features**:
```html
<!-- EDITOR_BLOCK_TEMPLATE: dynamic_products -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
  <tr>
    @{for item in editor.productCollection}
    <td width="${editor.productCardWidth}%" 
        align="center" 
        valign="top"
        style="padding: ${editor.cardPadding};">
      
      <!-- Product Card Container -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${editor.cardBackground.color}">
        <tr>
          <td style="padding: ${editor.cardInnerPadding};">
            
            <!-- Product Image -->
            @{if editor.shouldShowImage}
            <a href="${editor.productUrl}" target="_blank">
              <img src="${editor.productImage}" 
                   alt="${editor.productTitle}"
                   width="${editor.imageSize.formattedWidthAttribute}"
                   style="display: block; ${editor.imageSize.formattedWidthStyle}; border-radius: ${editor.imageBorderRadius};">
            </a>
            @{end if}
            
            <!-- Spacer -->
            <div style="height: 10px; line-height: 10px; font-size: 8px;">&nbsp;</div>
            
            <!-- Product Title -->
            @{if editor.shouldShowTitle}
            <div style="${editor.titleTextStyles}">
              <a href="${editor.productUrl}" 
                 style="color: inherit; text-decoration: none;">
                ${editor.productTitle}
              </a>
            </div>
            @{end if}
            
            <!-- Spacer -->
            <div style="height: 8px; line-height: 8px; font-size: 8px;">&nbsp;</div>
            
            <!-- Price Section -->
            @{if editor.shouldShowPrice}
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                @{if editor.shouldShowOldPrice}
                <td width="50%">
                  <div style="${editor.oldPriceStyles}">
                    ${editor.productOldPrice}
                  </div>
                </td>
                @{end if}
                <td width="${if(editor.shouldShowOldPrice, '50', '100')}%">
                  <div style="${editor.priceStyles}">
                    ${editor.productPrice}
                  </div>
                </td>
              </tr>
            </table>
            @{end if}
            
            <!-- CTA Button -->
            @{if editor.shouldShowButton}
            <div style="height: 12px; line-height: 12px; font-size: 8px;">&nbsp;</div>
            <table border="0" cellpadding="0" cellspacing="0" width="${editor.buttonSize.width}">
              <tr>
                <td align="center" 
                    height="${editor.buttonSize.height}"
                    bgcolor="${editor.buttonBackground}"
                    style="border-radius: ${editor.buttonBorderRadius};">
                  <a href="${editor.productUrl}" 
                     target="_blank"
                     style="display: block; ${editor.buttonTextStyles}; 
                            height: ${editor.buttonSize.formattedHeight}; 
                            line-height: ${editor.buttonSize.height}px;
                            text-decoration: none;">
                    ${editor.buttonText}
                  </a>
                </td>
              </tr>
            </table>
            @{end if}
            
          </td>
        </tr>
      </table>
    </td>
    @{end for}
  </tr>
</table>
```

**Key Dynamic Grid Rules**:
1. **Loop Structure**: `@{for item in editor.collection}` must wrap `<td>` elements inside a single `<tr>`
2. **Role Parameters**: Use `role` property in JSON for all product-specific data
3. **Table Layout**: Maintain table-based structure for email client compatibility
4. **Responsive Width**: Use percentage widths on `<td>` elements for multi-column layouts
5. **Spacers**: Use invisible `<div>` elements with `font-size: 8px;` for vertical spacing
6. **Conditional Elements**: Wrap optional elements (images, buttons) in `@{if}` conditions
7. **Nested Tables**: Use nested tables for complex layouts within each product card

---

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
Follow this algorithm step-by-step, using the **"Mindbox JSON Knowledge Base"** (Section [A]) as your single source of truth.

### Step 1: Analyze User Request
- Deconstruct the user's request into a list of logical blocks (e.g., Header, Image, Text, Button).
- For each block, identify the elements that need to be editable (e.g., image source, text content, button color).

### Step 2: Generate HTML Structure with Strict Rules
For each logical block identified in Step 1, generate the HTML code adhering to these **NON-NEGOTIABLE** rules:

1.  **Independent Table Wrapper**: Each block **MUST** be wrapped in its own independent `<table>`.
2.  **Block Header Comment**: Before each block's `<table>`, you **MUST** add a header comment: `<!-- EDITOR_BLOCK_TEMPLATE: block_N -->`, where N is the block's sequential number.
3.  **Outlook Ghost Tables**: Each block **MUST** be wrapped in "ghost tables" using conditional comments for Outlook compatibility: `<!--[if mso | IE]>...<![endif]-->`.
4.  **Semantic Comments**: Add clear HTML comments to describe the purpose of each block (e.g., `<!-- Header Section -->`).
5.  **Centering Method**: All main block containers **MUST** be centered by applying `align="center"` to the parent `<td>`. The width of the inner content `<table>` **MUST** be controlled by a `SIZE` variable.
    ```html
    <td align="center">
      <table width="${editor.block_width.formattedWidthAttribute}" style="${editor.block_width.formattedWidthStyle};">...</table>
    </td>
    ```

### Step 3: Insert Mindbox Variables
For each editable element, insert the appropriate Mindbox variables. You **MUST** strictly follow the `HTML Usage` examples from the **[A] Mindbox JSON Knowledge Base**.

-   **Visibility**: Every editable element and logical block **MUST** be wrapped in an `@{if}` condition tied to a `DISPLAY_TOGGLE` variable (e.g., `shouldShowButton`).
-   **Sizing & Spacing**:
    -   Every element **MUST** have a `SIZE` variable for width control (e.g., `${editor.imageWidth}`).
    -   Every element **MUST** have an `INNER_SPACING` variable for padding/margins (e.g., `style="padding: ${editor.buttonPadding};"`).
    -   Use `NUMBER` or `HEIGHTV2` for height where appropriate.
-   **Styling**:
    -   Where appropriate, ensure styles for `BORDER` and `BORDER_RADIUS` can be applied via variables.
    -   For text elements, use a `TEXT` or `SIMPLE_TEXT` variable for the content and a `TEXT_STYLES` or `SIMPLE_TEXT_STYLES` variable for the `style` attribute.
-   **Content**:
    -   Use `${editor.variableName}` for text, `src="${editor.imageSrc}"`, `alt="${editor.imageAlt}"`, `href="${editor.buttonUrl}"`, etc.

### Step 4: Final Review
-   Scan the entire generated HTML file.
-   Ensure all rules from Step 2 and Step 3 have been perfectly implemented.
-   Confirm that there are no placeholder comments or incomplete code.

## OUTPUT REQUIREMENTS
-   You **MUST** provide a single, complete, and ready-to-use HTML file.
-   Do **NOT** include any explanations, comments, or text outside of the HTML code itself.

---

# [B] ПРОМПТ №2: ГЕНЕРАЦИЯ JSON-КОНФИГУРАЦИИ

## ROLE AND OBJECTIVE
You are an email coding expert specializing in the **Mindbox templating engine**. Your task is to generate a complete, valid, and user-friendly JSON settings file based on provided HTML code that contains Mindbox variables (`${editor.*}`). You must act as a "smart" analyzer that not only finds variables but also determines their purpose and selects the most suitable control types from the **[A] Mindbox JSON Knowledge Base**.

## INPUT DATA
You will receive HTML code annotated with `${editor.*}` variables.

**Example Input:**
```html
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
While generating, you MUST adhere to the following global rules and default values as defined in the **[A] Mindbox JSON Knowledge Base**:

* **SIZE Controls**: `defaultValue` MUST be `"manual 100 *"`.
* **BACKGROUND Controls**: `defaultValue` MUST be `{ "type": "color", "color": "#39AA5D" }`.
* **IMAGE Controls**: `defaultValue` MUST be the standard Mindbox logo URL.
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
* IF the variable is used in `style="border-radius: ..."` or its name contains `borderRadius`, THEN the type MUST be `BORDER_RADIUS`.
* IF the variable is used for a full style attribute (`style="${...}"`) on a text element, THEN the type MUST be `TEXT_STYLES` or `SIMPLE_TEXT_STYLES`.
* IF the variable is used for a color (`background-color`, `color`) or its name contains `color` or `bgColor`, THEN the type MUST be `COLOR`.
* For all other cases, deduce the most logical type from the variable's name and its context in the HTML (e.g., a variable in an `<img>` src attribute is `IMAGE`).

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
1.  **User Objective**: A description of what the user was trying to achieve.
2.  **HTML Code**: The current version of the HTML file.
3.  **JSON Code**: The current version of the JSON configuration file.

**Example Input:**
-   **Objective**: "I tried to add a border-radius setting for the main container, but now it's broken."
-   **HTML**: `... <table style="border-radius: ${editor.mainBorderRadius};"> ...`
-   **JSON**: `... { "name": "mainBorderRadius", "type": "NUMBER", "defaultValue": "25" } ...` (This contains a type error).

## STRICT EXECUTION PROTOCOL
You **MUST** execute the following steps in strict sequential order. The **[A] Mindbox JSON Knowledge Base** is your single source of truth for all rules and values.

### Step 1: Initial Syntax Validation
1.  **Validate HTML Syntax**: Check for basic errors like unclosed tags.
2.  **Validate JSON Syntax**: Check for errors like trailing commas or incorrect bracket closure.

> **[CRITICAL HALT CONDITION]**
> If you find a fatal syntax error in either file (e.g., invalid JSON), you **MUST** stop all further analysis immediately. Your report should only contain this single syntax error and its correction.

### Step 2: Comprehensive Checklist-Based Audit
Perform a sequential review of the code against the following master checklist.

#### **A. Core HTML & Syntax Rules**
-   [ ] `EDITOR_BLOCK_TEMPLATE` header comment is present for each block.
-   [ ] The overall structure is `<table>`-based and robust for email clients.
-   [ ] All `<img>` tags have non-empty `alt` attributes.
-   [ ] All text within `@{if}` constructs has `font-size` and `line-height` properties defined to prevent rendering issues.
-   [ ] All Mindbox variables (`${editor.*}`) and logic (`@{if ...}`) use correct syntax.

#### **B. JSON & Global Defaults Compliance**
-   [ ] JSON is complete and all `type` values are valid according to the Knowledge Base.
-   [ ] All `defaultValue` fields are the correct data type (e.g., `DISPLAY_TOGGLE` is a string `"true"`, not a boolean `true`).
-   [ ] `SIZE` controls have `defaultValue: "manual 100 *"`.
-   [ ] `BACKGROUND` controls have `defaultValue: { "type": "color", "color": "#39AA5D" }` unless otherwise required.
-   [ ] `IMAGE` controls use the standard Mindbox default URL.
-   [ ] `TEXT_STYLES` and `SIMPLE_TEXT_STYLES` objects contain `"fallbackFont": "Helvetica"`.
-   [ ] Every logical element has a `DISPLAY_TOGGLE` (`shouldShow...`) control.
-   [ ] Every element has controls for width (`SIZE`), height (`NUMBER`/`HEIGHTV2`), and external margins (`INNER_SPACING`).
-   [ ] `BORDER` and `BORDER_RADIUS` controls are present where appropriate.
-   [ ] Every JSON parameter has a `group` and `extra.label`.
-   [ ] Controls are organized into logical nested groups.
-   [ ] HTML block centering uses the `align="center"` on parent `<td>` method.

### Step 3: Synchronization and Goal Conformance Audit [CRITICAL STEP]
1.  **HTML-to-JSON Sync**:
    -   Create a list of all `${editor.*}` variables used in the HTML.
    -   For each variable, verify that a corresponding JSON object exists.
    -   If an object is missing, **add it** using the correct template and global defaults from the Knowledge Base.
2.  **JSON-to-HTML Sync**:
    -   Create a list of all `"name"` properties from the JSON array.
    -   Verify that each variable is used somewhere in the HTML.
    -   If a variable is defined in the JSON but **not used** in the HTML, flag it as "unused" in your final report.
3.  **Goal Conformance**:
    -   Review the user's stated **Objective**.
    -   Assess whether the code's current state achieves this objective. If not, identify the logical error and correct it.

### Step 4: Generate Corrected Files and Detailed Report
1.  Based on all identified issues, generate the fully **corrected versions** of both the HTML and JSON files.
2.  Formulate a **detailed report** of all changes made. For each change, you **MUST** use the following Markdown format:

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
Your final output **MUST** consist of three parts:
1.  The fully corrected HTML code block.
2.  The fully corrected JSON code block.
3.  The detailed report of all changes.

---

# [C] ДОКУМЕНТАЦИЯ MINDBOX ПО РАЗМЕТКЕ (ПРИМЕРЫ И ПАТТЕРНЫ)

В конструкторе email-рассылок можно собрать шаблон из визуальных блоков. Помимо стандартных, в галерею конструктора можно загрузить собственные блоки, в том числе с изменяемыми частями, и использовать их при сборке рассылок.

Чтобы добавить пользовательский блок, нужно:
1. Разметить собственную HTML-верстку
2. Загрузить верстку в Mindbox и прописать настройки для параметров

## Обозначить блоки

Блок — это независимый этаж верстки, обычно начинается с тега `<table>` со своими стилями таблицы.

Чтобы выделить его в верстке, добавьте перед ним комментарий формата:
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
* название содержит только цифры, латиницу и подчеркивание
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
                          line-height: 56px; font-family: Helvetiva, Arial, sans-serif; 
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
@{if editor.shouldshowmessagetext}
<div style="height: 8px; line-height: 8px; font-size: 8px;">&nbsp;</div>
<div style="font-family: Helvetica, Arial, sans-serif; font-size: 16px; line-height: 20px; color: #FFFFFF;">
    ${editor.messagetext}
</div>
@{end if}
```

### Добавить изменение настроек текста

**Пример:**
```html
@{if editor.shouldshowmessagetext}
<div style="height: 8px; line-height: 8px; font-size: 8px;">&nbsp;</div>
<div style="${editor.textstyles}">${editor.messagetext}</div>
@{end if}
```

### Добавить настройки картинки

**Пример:**
```html
@{if editor.shouldshowimage}
<a href="${editor.imageurl}">
    <img src="${editor.image}" alt="${editor.imagealt}">
</a>
@{end if}
```

### Добавить настройку ширины картинки

**Пример:**
```html
<td width="100%" style="padding: 10px">
    <img width="${editor.picture_logo.formattedWidthAttribute}"
         src="${editor.image}" 
         alt="${editor.imagealt}" 
         style="display: block; ${editor.picture_logo.formattedWidthStyle};"/>
</td>
```

### Добавить настройку высоты картинки

**Пример:**
```html
<td>
    <img height="${editor.logo.formattedHeight}"
         src="${editor.image}" 
         alt="${editor.imagealt}" 
         style="display: block; height: ${editor.logo.formattedHeight};"/>
</td>
```

### Добавить настройку высоты контейнера текста

**Пример:**
```html
<div style="${editor.name_text_size.containerStyle};" 
     height="${editor.name_text_size.containerHeightAttribute}">
    <a href="${editor.Url}">${editor.name}</a>
</div>
```

### Добавить настройку размера кнопки

**Пример (полная верстка):**
```html
<table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
        <td align="${editor.buttonAlign}">
            <a href="${editor.buttonUrl}" style="display: inline-block;">
                <table border="0" cellpadding="0" cellspacing="0"
                       width="${editor.buttonSize.width}"
                       style="width: ${editor.buttonSize.formattedWidth};"
                       class="${editor.buttonSize.class}">
                    <tbody>
                        <tr>
                            <td align="center" valign="middle" 
                                height="${editor.buttonSize.height}" 
                                style="height: ${editor.buttonSize.formattedHeight}; 
                                       background-color: ${editor.buttonBackground}; 
                                       border-radius: ${editor.buttonBorderRadius};
                                       border: ${editor.buttonBorder};
                                       ${editor.buttonTextStyles};" 
                                class="${editor.buttonSize.class}">
                                ${editor.buttonText}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </a>
        </td>
    </tr>
</table>
```

### Добавить настройку отступов (padding)

**Пример:**
```html
<td align="center" valign="middle" height="56" width="155" 
    style="padding: ${editor.padding};">
    <a href="${editor.buttonurl}">${editor.buttonText}</a>
</td>
```

---

**End of Knowledge Base**
