// Mindbox Knowledge Base
// Единообразные допуски и канонические шаблоны для валидаторов и промпт-генерации

export const allowedFonts = [
  "Roboto", "Open Sans", "Montserrat", "Inter", "Arial", "Geneva", "Helvetica",
  "Times New Roman", "Verdana", "Courier / Courier New", "Tahoma", "Georgia",
  "Palatino", "Trebuchet MS"
];

export const allowedLineHeights = ["1.0", "1.15", "1.5", "2.0"];

export const alignValues = ["left", "right", "center"];

export const bgModes = ["contain", "cover", "repeat", "stretch"];

export const widthTypes = ["pixels", "percent"];

export const allowedCollections = [
  "RECIPIENT_RECOMMENDATIONS",
  "FROM_SEGMENT",
  "FROM_PRODUCT_LIST",
  "ORDER",
  "VIEWED_PRODUCTS_IN_SESSION",
  "PRODUCT_LIST_ITEM",
  "PRODUCT_VIEW",
  "FROM_CUSTOMER_COMPUTED_FIELD"
];

// Канонические шаблоны defaultValue/extra
export const templates = {
  DISPLAY_TOGGLE: "true",
  
  SIZE: {
    defaultValue: "manual 55 *",
    extra: { defaultMaxWidth: "600px", allowedTypes: ["inherit", "manual"] },
    htmlUsage: {
      widthAttr: '${editor.var.formattedWidthAttribute}',
      widthStyle: '${editor.var.formattedWidthStyle}'
    }
  },

  HEIGHTV2: {
    defaultValue: "100 100",
    htmlUsage: { heightAttr: '${editor.var.formattedHeight}' }
  },

  TEXT_SIZE: {
    defaultValue: "30 30",
    htmlUsage: {
      containerStyle: '${editor.var.containerStyle}',
      containerHeightAttribute: '${editor.var.containerHeightAttribute}'
    }
  },

  BUTTON_SIZE: {
    defaultValue: { width: "pixels 100 80", height: "50 40" },
    htmlUsage: {
      widthAttr: '${editor.var.width}',
      widthStyle: '${editor.var.formattedWidth}',
      heightAttr: '${editor.var.height}',
      heightStyle: '${editor.var.formattedHeight}'
    }
  },

  BORDER_RADIUS: { defaultValue: "25 25 25 25" },

  INNER_SPACING: { defaultValue: "10 25 10 25" },

  BORDER: {
    examples: ["none", "solid black 2"]
  },

  BACKGROUND: {
    transparent: { defaultValue: { type: "transparent" } },
    color: { defaultValue: { type: "color", color: "#FFFFFF" } },
    image: { 
      defaultValue: { 
        type: "image", 
        url: "https://via.placeholder.com/600x200", 
        color: "#FFFFFF", 
        mode: "cover" 
      } 
    },
    htmlUsage: {
      tdBgColor: '${editor.var.color}',
      tdStyles: '${editor.var.formattedBackgroundStyles}',
      tdBackIf: '${ if(editor.var.type = "image", \'background="\' & editor.var.image & \'"\', "" ) }'
    }
  },

  TEXT_STYLES: {
    defaultValue: {
      font: "Arial",
      fontSize: "16",
      lineHeight: "1.5",
      inscription: [],
      color: "#000000",
      fallbackFont: "Arial",
      letterSpacing: "0"
    },
    allowed: {
      fonts: allowedFonts,
      lineHeights: allowedLineHeights
    }
  },

  SIMPLE_TEXT_STYLES: {
    defaultValue: {
      font: "Arial",
      fontSize: "16",
      lineHeight: "1.5",
      inscription: [],
      color: "#000000",
      fallbackFont: "Arial",
      letterSpacing: "0"
    },
    allowed: {
      fonts: allowedFonts,
      lineHeights: allowedLineHeights
    }
  }
};

export const KB = {
  version: '1.0.0',
  allowedFonts,
  allowedLineHeights,
  alignValues,
  bgModes,
  widthTypes,
  allowedCollections,
  templates
};
