// Практические примеры для Mindbox блоков
// Подробные HTML и JSON шаблоны для типовых сценариев

export const MINDBOX_EXAMPLES = {
  /**
   * Example 1: Gap/Spacer Element
   * Вертикальный отступ между блоками с регулируемой высотой
   */
  gapSpacer: {
    description: "Adjustable vertical spacing between blocks using NUMBER control",
    html: `<!-- EDITOR_BLOCK_TEMPLATE: spacer_block -->
@{if editor.shouldShowSpacer}
<table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
  <tr>
    <td>
      <div style="height: \${editor.spacerHeight}px; line-height: \${editor.spacerHeight}px; font-size: 8px;">
        &nbsp;
      </div>
    </td>
  </tr>
</table>
@{end if}`,
    json: [
      {
        name: "shouldShowSpacer",
        type: "DISPLAY_TOGGLE",
        defaultValue: "true",
        group: "Spacing",
        extra: { label: "Show Spacer" }
      },
      {
        name: "spacerHeight",
        type: "NUMBER",
        defaultValue: "20",
        group: "Spacing",
        extra: { label: "Spacer Height (px)" }
      }
    ],
    keyPoints: [
      "Use NUMBER type for height value",
      "Set font-size: 8px; to minimize the &nbsp; character",
      "Match height and line-height for consistency",
      "Always wrap in DISPLAY_TOGGLE for visibility control"
    ]
  },

  /**
   * Example 2: Static Product Grid (Before Conversion)
   * Исходная статическая сетка товаров
   */
  staticProductGrid: {
    description: "Static HTML product grid before conversion to dynamic block",
    htmlBefore: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td width="33%" align="center">
      <img src="product1.jpg" alt="Product 1" width="150">
      <div style="font-size: 16px; color: #000;">Product Name 1</div>
      <div style="font-size: 18px; font-weight: bold; color: #000;">$99.99</div>
    </td>
    <td width="33%" align="center">
      <img src="product2.jpg" alt="Product 2" width="150">
      <div style="font-size: 16px; color: #000;">Product Name 2</div>
      <div style="font-size: 18px; font-weight: bold; color: #000;">$129.99</div>
    </td>
    <td width="33%" align="center">
      <img src="product3.jpg" alt="Product 3" width="150">
      <div style="font-size: 16px; color: #000;">Product Name 3</div>
      <div style="font-size: 18px; font-weight: bold; color: #000;">$149.99</div>
    </td>
  </tr>
</table>`,
    conversionSteps: [
      "1. Identify the repeating pattern (single product card structure)",
      "2. Wrap product cells in @{for item in editor.collection}...@{end for}",
      "3. Replace static product data with role-based variables",
      "4. Add DISPLAY_TOGGLE conditions for optional elements",
      "5. Convert inline styles to editable TEXT_STYLES variables",
      "6. Create JSON configuration with COLLECTION and role parameters"
    ]
  },

  /**
   * Example 3: Dynamic Product Grid (After Conversion)
   * Полноценная динамическая сетка товаров
   */
  dynamicProductGrid: {
    description: "Complete dynamic product grid with COLLECTION and role-based parameters",
    html: `<!-- EDITOR_BLOCK_TEMPLATE: product_recommendations -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
  <tr>
    @{for item in editor.productCollection}
    <td width="33%" align="center" valign="top" style="padding: \${editor.productPadding};">
      
      <!-- Product Card Container -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="\${editor.cardBackground.color}">
        <tr>
          <td style="padding: \${editor.cardInnerPadding};">
            
            <!-- Product Image -->
            @{if editor.shouldShowImage}
            <a href="\${editor.productUrl}" target="_blank">
              <img src="\${editor.productImage}" 
                   alt="\${editor.productTitle}"
                   width="\${editor.imageSize.formattedWidthAttribute}"
                   style="display: block; \${editor.imageSize.formattedWidthStyle}; border: \${editor.imageBorder}; border-radius: \${editor.imageBorderRadius};">
            </a>
            @{end if}
            
            <!-- Spacer -->
            <div style="height: 10px; line-height: 10px; font-size: 8px;">&nbsp;</div>
            
            <!-- Product Title -->
            @{if editor.shouldShowTitle}
            <div style="\${editor.titleTextStyles}">
              <a href="\${editor.productUrl}" style="color: inherit; text-decoration: none;">
                \${editor.productTitle}
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
                  <div style="\${editor.oldPriceStyles}">
                    \${editor.productOldPrice}
                  </div>
                </td>
                @{end if}
                <td width="\${if(editor.shouldShowOldPrice, '50', '100')}%">
                  <div style="\${editor.priceStyles}">
                    \${editor.productPrice}
                  </div>
                </td>
              </tr>
            </table>
            @{end if}
            
            <!-- CTA Button -->
            @{if editor.shouldShowButton}
            <div style="height: 12px; line-height: 12px; font-size: 8px;">&nbsp;</div>
            <table border="0" cellpadding="0" cellspacing="0" width="\${editor.buttonSize.width}">
              <tr>
                <td align="center" 
                    height="\${editor.buttonSize.height}"
                    bgcolor="\${editor.buttonBackground}"
                    style="border-radius: \${editor.buttonBorderRadius};">
                  <a href="\${editor.productUrl}" 
                     target="_blank"
                     style="display: block; \${editor.buttonTextStyles}; 
                            height: \${editor.buttonSize.formattedHeight}; 
                            line-height: \${editor.buttonSize.height}px;
                            text-decoration: none;">
                    \${editor.buttonText}
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
</table>`,
    json: [
      {
        name: "productCollection",
        type: "COLLECTION",
        defaultValue: "RECIPIENT_RECOMMENDATIONS",
        group: "Product Grid >> Data Source",
        extra: { label: "Product Collection" }
      },
      {
        name: "shouldShowImage",
        type: "DISPLAY_TOGGLE",
        defaultValue: "true",
        group: "Product Grid >> Visibility",
        extra: { label: "Show Product Image" }
      },
      {
        name: "shouldShowTitle",
        type: "DISPLAY_TOGGLE",
        defaultValue: "true",
        group: "Product Grid >> Visibility",
        extra: { label: "Show Product Title" }
      },
      {
        name: "shouldShowPrice",
        type: "DISPLAY_TOGGLE",
        defaultValue: "true",
        group: "Product Grid >> Visibility",
        extra: { label: "Show Product Price" }
      },
      {
        name: "shouldShowOldPrice",
        type: "DISPLAY_TOGGLE",
        defaultValue: "false",
        group: "Product Grid >> Visibility",
        extra: { label: "Show Old Price (Strikethrough)" }
      },
      {
        name: "shouldShowButton",
        type: "DISPLAY_TOGGLE",
        defaultValue: "true",
        group: "Product Grid >> Visibility",
        extra: { label: "Show CTA Button" }
      },
      {
        name: "productImage",
        type: "IMAGE",
        role: "ProductImageUrl",
        group: "Product Grid >> Content",
        extra: { label: "Product Image" }
      },
      {
        name: "productTitle",
        type: "SIMPLE_TEXT",
        role: "ProductTitle",
        group: "Product Grid >> Content",
        extra: { label: "Product Title" }
      },
      {
        name: "productUrl",
        type: "URL",
        role: "ProductUrl",
        group: "Product Grid >> Content",
        extra: { label: "Product Link" }
      },
      {
        name: "productPrice",
        type: "TEXT",
        role: "ProductPrice",
        group: "Product Grid >> Content",
        extra: { label: "Product Price" }
      },
      {
        name: "productOldPrice",
        type: "TEXT",
        role: "ProductOldPrice",
        group: "Product Grid >> Content",
        extra: { label: "Product Old Price" }
      },
      {
        name: "imageSize",
        type: "SIZE",
        defaultValue: "manual 150 *",
        group: "Product Grid >> Image Settings",
        extra: { 
          label: "Image Width",
          defaultMaxWidth: "200px", 
          allowedTypes: ["inherit", "manual"] 
        }
      },
      {
        name: "imageBorder",
        type: "BORDER",
        defaultValue: "none",
        group: "Product Grid >> Image Settings",
        extra: { label: "Image Border" }
      },
      {
        name: "imageBorderRadius",
        type: "BORDER_RADIUS",
        defaultValue: "0 0 0 0",
        group: "Product Grid >> Image Settings",
        extra: { label: "Image Corner Radius" }
      },
      {
        name: "cardBackground",
        type: "BACKGROUND",
        defaultValue: { type: "color", color: "#FFFFFF" },
        group: "Product Grid >> Card Styling",
        extra: { label: "Card Background" }
      },
      {
        name: "productPadding",
        type: "INNER_SPACING",
        defaultValue: "10 10 10 10",
        group: "Product Grid >> Card Styling",
        extra: { label: "Padding Between Cards" }
      },
      {
        name: "cardInnerPadding",
        type: "INNER_SPACING",
        defaultValue: "15 15 15 15",
        group: "Product Grid >> Card Styling",
        extra: { label: "Card Inner Padding" }
      },
      {
        name: "titleTextStyles",
        type: "TEXT_STYLES",
        defaultValue: {
          font: "Arial",
          fontSize: "16",
          lineHeight: "1.5",
          inscription: [],
          color: "#000000",
          fallbackFont: "Helvetica",
          letterSpacing: "0"
        },
        group: "Product Grid >> Text Styles",
        extra: { label: "Title Text Style" }
      },
      {
        name: "priceStyles",
        type: "TEXT_STYLES",
        defaultValue: {
          font: "Arial",
          fontSize: "18",
          lineHeight: "1.5",
          inscription: ["bold"],
          color: "#000000",
          fallbackFont: "Helvetica",
          letterSpacing: "0"
        },
        group: "Product Grid >> Text Styles",
        extra: { label: "Price Text Style" }
      },
      {
        name: "oldPriceStyles",
        type: "TEXT_STYLES",
        defaultValue: {
          font: "Arial",
          fontSize: "14",
          lineHeight: "1.5",
          inscription: ["crossed"],
          color: "#999999",
          fallbackFont: "Helvetica",
          letterSpacing: "0"
        },
        group: "Product Grid >> Text Styles",
        extra: { label: "Old Price Text Style" }
      },
      {
        name: "buttonText",
        type: "SIMPLE_TEXT",
        defaultValue: "Shop Now",
        group: "Product Grid >> Button",
        extra: { label: "Button Text" }
      },
      {
        name: "buttonSize",
        type: "BUTTON_SIZE",
        defaultValue: { width: "percent 100 100", height: "44 44" },
        group: "Product Grid >> Button",
        extra: { label: "Button Size" }
      },
      {
        name: "buttonBackground",
        type: "COLOR",
        defaultValue: "#39AA5D",
        group: "Product Grid >> Button",
        extra: { label: "Button Background Color" }
      },
      {
        name: "buttonBorderRadius",
        type: "BORDER_RADIUS",
        defaultValue: "4 4 4 4",
        group: "Product Grid >> Button",
        extra: { label: "Button Corner Radius" }
      },
      {
        name: "buttonTextStyles",
        type: "SIMPLE_TEXT_STYLES",
        defaultValue: {
          font: "Arial",
          fontSize: "14",
          lineHeight: "1.5",
          inscription: ["bold"],
          color: "#FFFFFF",
          fallbackFont: "Helvetica",
          letterSpacing: "0"
        },
        group: "Product Grid >> Button",
        extra: { label: "Button Text Style" }
      }
    ],
    keyRules: [
      "Loop Structure: @{for item in editor.collection} must wrap <td> elements inside a single <tr>",
      "Role Parameters: Use 'role' property in JSON for all product-specific data (ProductTitle, ProductUrl, etc.)",
      "Table Layout: Maintain table-based structure for email client compatibility",
      "Responsive Width: Use percentage widths on <td> elements for multi-column layouts",
      "Spacers: Use invisible <div> elements with font-size: 8px; for vertical spacing",
      "Conditional Elements: Wrap optional elements in @{if} conditions",
      "Nested Tables: Use nested tables for complex layouts within each product card",
      "COLLECTION variable must be defined in JSON with type 'COLLECTION'",
      "All role-based parameters automatically populate from collection data"
    ]
  },

  /**
   * Example 4: Hero Block with Background Image
   * Героический блок с фоновым изображением и текстом
   */
  heroBlock: {
    description: "Hero section with background image, heading, and CTA button",
    html: `<!-- EDITOR_BLOCK_TEMPLATE: hero_section -->
@{if editor.shouldShowHero}
<!--[if mso | IE]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600">
<tr><td>
<![endif]-->

<table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
  <tr>
    <td align="center">
      <table width="\${editor.heroWidth.formattedWidthAttribute}" 
             style="\${editor.heroWidth.formattedWidthStyle};"
             cellpadding="0" cellspacing="0" border="0"
             bgcolor="\${editor.heroBackground.color}"
             style="\${editor.heroBackground.formattedBackgroundStyles};"
             \${if(editor.heroBackground.type == "image", 'background="' + editor.heroBackground.image + '"', "")}>
        <tr>
          <td align="center" style="padding: \${editor.heroPadding};">
            
            <!-- Hero Content Container -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  
                  <!-- Hero Heading -->
                  @{if editor.shouldShowHeading}
                  <div style="\${editor.headingStyles}">
                    \${editor.heroHeading}
                  </div>
                  <div style="height: 20px; line-height: 20px; font-size: 8px;">&nbsp;</div>
                  @{end if}
                  
                  <!-- Hero Subheading -->
                  @{if editor.shouldShowSubheading}
                  <div style="\${editor.subheadingStyles}">
                    \${editor.heroSubheading}
                  </div>
                  <div style="height: 30px; line-height: 30px; font-size: 8px;">&nbsp;</div>
                  @{end if}
                  
                  <!-- Hero CTA Button -->
                  @{if editor.shouldShowButton}
                  <table border="0" cellpadding="0" cellspacing="0" 
                         width="\${editor.ctaButtonSize.width}"
                         style="width: \${editor.ctaButtonSize.formattedWidth};">
                    <tr>
                      <td align="center" 
                          height="\${editor.ctaButtonSize.height}"
                          style="height: \${editor.ctaButtonSize.formattedHeight};"
                          bgcolor="\${editor.buttonBackground}"
                          style="border: \${editor.buttonBorder}; border-radius: \${editor.buttonBorderRadius};">
                        <a href="\${editor.buttonUrl}" 
                           target="_blank"
                           style="display: block; \${editor.buttonTextStyles}; 
                                  height: \${editor.ctaButtonSize.height}px; 
                                  line-height: \${editor.ctaButtonSize.height}px;
                                  text-decoration: none;">
                          \${editor.buttonText}
                        </a>
                      </td>
                    </tr>
                  </table>
                  @{end if}
                  
                </td>
              </tr>
            </table>
            
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!--[if mso | IE]>
</td></tr></table>
<![endif]-->
@{end if}`,
    json: [
      {
        name: "shouldShowHero",
        type: "DISPLAY_TOGGLE",
        defaultValue: "true",
        group: "Hero Section >> Visibility",
        extra: { label: "Show Hero Section" }
      },
      {
        name: "shouldShowHeading",
        type: "DISPLAY_TOGGLE",
        defaultValue: "true",
        group: "Hero Section >> Visibility",
        extra: { label: "Show Heading" }
      },
      {
        name: "shouldShowSubheading",
        type: "DISPLAY_TOGGLE",
        defaultValue: "true",
        group: "Hero Section >> Visibility",
        extra: { label: "Show Subheading" }
      },
      {
        name: "shouldShowButton",
        type: "DISPLAY_TOGGLE",
        defaultValue: "true",
        group: "Hero Section >> Visibility",
        extra: { label: "Show CTA Button" }
      },
      {
        name: "heroHeading",
        type: "TEXT",
        defaultValue: "Welcome to Our Store",
        group: "Hero Section >> Content",
        extra: { label: "Hero Heading" }
      },
      {
        name: "heroSubheading",
        type: "TEXT",
        defaultValue: "Discover amazing products and exclusive deals",
        group: "Hero Section >> Content",
        extra: { label: "Hero Subheading" }
      },
      {
        name: "buttonText",
        type: "SIMPLE_TEXT",
        defaultValue: "Shop Now",
        group: "Hero Section >> Content",
        extra: { label: "Button Text" }
      },
      {
        name: "buttonUrl",
        type: "URL",
        defaultValue: "https://mindbox.ru",
        group: "Hero Section >> Content",
        extra: { label: "Button Link" }
      },
      {
        name: "heroWidth",
        type: "SIZE",
        defaultValue: "manual 600 *",
        group: "Hero Section >> Layout",
        extra: { 
          label: "Hero Width",
          defaultMaxWidth: "600px", 
          allowedTypes: ["inherit", "manual"] 
        }
      },
      {
        name: "heroPadding",
        type: "INNER_SPACING",
        defaultValue: "60 40 60 40",
        group: "Hero Section >> Layout",
        extra: { label: "Hero Padding" }
      },
      {
        name: "heroBackground",
        type: "BACKGROUND",
        defaultValue: {
          type: "image",
          url: "https://via.placeholder.com/600x400",
          color: "#39AA5D",
          mode: "cover"
        },
        group: "Hero Section >> Styling",
        extra: { label: "Hero Background" }
      },
      {
        name: "headingStyles",
        type: "TEXT_STYLES",
        defaultValue: {
          font: "Arial",
          fontSize: "32",
          lineHeight: "1.5",
          inscription: ["bold"],
          color: "#FFFFFF",
          fallbackFont: "Helvetica",
          letterSpacing: "0"
        },
        group: "Hero Section >> Text Styles",
        extra: { label: "Heading Style" }
      },
      {
        name: "subheadingStyles",
        type: "TEXT_STYLES",
        defaultValue: {
          font: "Arial",
          fontSize: "18",
          lineHeight: "1.5",
          inscription: [],
          color: "#FFFFFF",
          fallbackFont: "Helvetica",
          letterSpacing: "0"
        },
        group: "Hero Section >> Text Styles",
        extra: { label: "Subheading Style" }
      },
      {
        name: "ctaButtonSize",
        type: "BUTTON_SIZE",
        defaultValue: { width: "pixels 200 160", height: "50 44" },
        group: "Hero Section >> Button",
        extra: { label: "Button Size" }
      },
      {
        name: "buttonBackground",
        type: "COLOR",
        defaultValue: "#FFFFFF",
        group: "Hero Section >> Button",
        extra: { label: "Button Background" }
      },
      {
        name: "buttonBorder",
        type: "BORDER",
        defaultValue: "none",
        group: "Hero Section >> Button",
        extra: { label: "Button Border" }
      },
      {
        name: "buttonBorderRadius",
        type: "BORDER_RADIUS",
        defaultValue: "25 25 25 25",
        group: "Hero Section >> Button",
        extra: { label: "Button Corner Radius" }
      },
      {
        name: "buttonTextStyles",
        type: "SIMPLE_TEXT_STYLES",
        defaultValue: {
          font: "Arial",
          fontSize: "16",
          lineHeight: "1.5",
          inscription: ["bold"],
          color: "#39AA5D",
          fallbackFont: "Helvetica",
          letterSpacing: "0"
        },
        group: "Hero Section >> Button",
        extra: { label: "Button Text Style" }
      }
    ]
  }
};

export type ExampleKey = keyof typeof MINDBOX_EXAMPLES;
