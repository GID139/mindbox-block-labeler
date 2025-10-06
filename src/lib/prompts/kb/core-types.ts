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

## Mandatory Default Values

Use these defaults for generation:

- **SIZE**: \`"manual 100 *"\`
- **BACKGROUND**: \`{ "type": "color", "color": "#39AA5D" }\`
- **IMAGE**: \`"https://mindbox.ru/build/assets/images/mb-fav_marketing_green-Ds-aOpBM.svg"\`
- **TEXT_STYLES/SIMPLE_TEXT_STYLES**: Must include \`"fallbackFont": "Helvetica"\`
- **DISPLAY_TOGGLE**: String \`"true"\` or \`"false"\` (NOT boolean)
- **BORDER**: \`"none"\` or \`"solid black 2"\`
- **BORDER_RADIUS**: \`"25 25 25 25"\`
- **INNER_SPACING**: \`"10 25 10 25"\`
- **HEIGHTV2**: \`"100 100"\`
- **TEXT_SIZE**: \`"30 30"\`
- **BUTTON_SIZE**: \`{ "width": "pixels 100 80", "height": "50 40" }\``;
