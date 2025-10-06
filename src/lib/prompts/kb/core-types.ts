// Core Mindbox control types definitions

export const CORE_TYPES_KB = `## Core Control Types

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
- Format: "manual X *" where X is number up to 100 (commonly 55)
- Usage: width="\${editor.var.formattedWidthAttribute}" style="\${editor.var.formattedWidthStyle}"
- Requires "extra" object with:
  - defaultMaxWidth: Max width of email (usually "600px")
  - allowedTypes: ["inherit", "manual"] or just ["manual"]
- Example JSON:
  {
    "name": "imageSize",
    "type": "SIZE",
    "defaultValue": "manual 55 *",
    "extra": {
      "defaultMaxWidth": "600px",
      "allowedTypes": ["inherit", "manual"]
    }
  }

### HEIGHTV2 (Height Control)  
- Format: "100 100" (desktop mobile)
- Usage: height="\${editor.var.formattedHeight}"

### TEXT_SIZE (Text Container Height)
- Format: "30 30" (desktop mobile)
- Usage: height="\${editor.var.containerHeightAttribute}" style="\${editor.var.containerStyle}"

### BUTTON_SIZE
- Format: { "width": "pixels 100 80", "height": "50 40" }
- Width types: "pixels" or "percent"

### NUMBER
- Type: Numeric value for single numeric settings
- Usage: For font size, spacing, gap, custom numeric values
- Default: "20"
- Format: String containing number
- Examples: 
  - Gap/Spacer: height: \\\${editor.gap}px
  - Font size: font-size: \\\${editor.customSize}px
  - Any single numeric value that needs adjustment

### BORDER_RADIUS
- Format: "25 25 25 25" (TL TR BR BL)

### INNER_SPACING (Padding)
- Format: "10 25 10 25" (T R B L)

### BORDER
- Format: "none" or "solid black 2" (style color width)

### BACKGROUND
- Transparent: { "type": "transparent" }
- Color: { "type": "color", "color": "#39AA5D" } (Example: Mindbox brand green. Common alternatives: "#FFFFFF" white, "#000000" black, "#F0F0F0" light gray)
- Image: { "type": "image", "url": "...", "color": "#39AA5D", "mode": "cover" }
- Modes: "contain", "cover", "repeat", "stretch"

### TEXT_STYLES & SIMPLE_TEXT_STYLES
Required fields:
- font: One of allowed fonts (Arial, Helvetica, Roboto, Open Sans, Montserrat, Inter, Geneva, Times New Roman, Verdana, Courier / Courier New, Tahoma, Georgia, Palatino, Trebuchet MS)
- fontSize: string number
- lineHeight: "1.0", "1.15", "1.5", "2.0" (ONLY these values)
- inscription: [] or ["bold"], ["italic"], ["underlined"], ["crossed"]
- color: "#RRGGBB" (SIMPLE_TEXT_STYLES only, TEXT_STYLES manages color separately)
- fallbackFont: One of allowed fonts (MANDATORY). Commonly "Helvetica" or "Arial"
- letterSpacing: string number

### COLOR
- Format: "#RRGGBB"

### ALIGN
- Values: "left", "center", "right"

### COLLECTION (Dynamic Content)
- Values: "RECIPIENT_RECOMMENDATIONS", "FROM_SEGMENT", "FROM_PRODUCT_LIST", "ORDER", "VIEWED_PRODUCTS_IN_SESSION", "PRODUCT_LIST_ITEM", "PRODUCT_VIEW", "FROM_CUSTOMER_COMPUTED_FIELD"
- Optional "size" parameter to limit number of items displayed: "size": 2
- Example:
  {
    "name": "productCollection",
    "type": "COLLECTION",
    "defaultValue": "RECIPIENT_RECOMMENDATIONS",
    "size": 3
  }

### Dynamic Roles
- ProductTitle, ProductPrice, ProductOldPrice, ProductUrl, ProductImageUrl, ProductDescription, ProductBadge
- Role parameters HAVE "defaultValue" (sample text/URL), but it gets replaced by dynamic data from collection
- Example:
  {
    "name": "productTitle",
    "type": "SIMPLE_TEXT",
    "role": "ProductTitle",
    "defaultValue": "Sample Product Name"
  }

## Mandatory Default Values

Use these defaults for generation:

- **NUMBER**: \`"20"\` (adjust based on context: gap, font size, etc.)
- **SIZE**: \`"manual 55 *"\` (X can be any number up to 100)
- **BACKGROUND**: \`{ "type": "color", "color": "#39AA5D" }\` (or "#FFFFFF" for white)
- **IMAGE**: \`"https://mindbox.ru/build/assets/images/mb-fav_marketing_green-Ds-aOpBM.svg"\`
- **TEXT_STYLES/SIMPLE_TEXT_STYLES**: Must include \`"fallbackFont": "Helvetica"\` or \`"Arial"\`
- **DISPLAY_TOGGLE**: String \`"true"\` or \`"false"\` (NOT boolean)
- **BORDER**: \`"none"\` or \`"solid black 2"\`
- **BORDER_RADIUS**: \`"25 25 25 25"\`
- **INNER_SPACING**: \`"10 25 10 25"\`
- **HEIGHTV2**: \`"100 100"\`
- **TEXT_SIZE**: \`"30 30"\`
- **BUTTON_SIZE**: \`{ "width": "pixels 100 80", "height": "50 40" }\``;
