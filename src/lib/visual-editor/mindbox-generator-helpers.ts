import { BlockInstance, MindboxSettings } from '@/types/visual-editor';

interface MindboxGeneratorContext {
  blockName: string;
  settings: MindboxSettings;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * HTML Generator for Mindbox templates
 */
export class MindboxHTMLGenerator {
  constructor(private ctx: MindboxGeneratorContext) {}

  /**
   * Generates a TD element with background, spacing, border, and border-radius
   */
  generateBackgroundTD(content: string): string {
    const name = this.ctx.blockName;
    return `<table width="\${editor.${name}Width.formattedWidthAttribute}" 
           style="\${editor.${name}Width.formattedWidthStyle}; 
                  background-color: \${editor.${name}BgColor}; 
                  border-radius: \${editor.${name}BorderRadius}; 
                  border: \${editor.${name}Border};" 
           border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td style="padding: \${editor.${name}InnerSpacing};">
      ${content}
    </td>
  </tr>
</table>`;
  }

  /**
   * Generates Ghost Table wrapper for Outlook compatibility
   */
  generateGhostTable(content: string, width: string = '600'): string {
    return `<!--[if mso | IE]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="${width}">
<tr><td>
<![endif]-->
${content}
<!--[if mso | IE]>
</td></tr></table>
<![endif]-->`;
  }

  /**
   * Generates outer wrapper with outer spacing via vertical spacers
   */
  generateWrapper(content: string, align: string = 'center'): string {
    const name = this.ctx.blockName;
    const outerSpacing = this.ctx.settings.outerSpacing || '0';
    
    // Верхний spacer
    const topSpacer = outerSpacing !== '0' && outerSpacing !== '0 0 0 0'
      ? `<tr><td><div style="height: \${editor.${name}OuterSpacing}; line-height: \${editor.${name}OuterSpacing}; font-size: 8px;">&nbsp;</div></td></tr>`
      : '';
    
    // Нижний spacer
    const bottomSpacer = outerSpacing !== '0' && outerSpacing !== '0 0 0 0'
      ? `<tr><td><div style="height: \${editor.${name}OuterSpacing}; line-height: \${editor.${name}OuterSpacing}; font-size: 8px;">&nbsp;</div></td></tr>`
      : '';
    
    return `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
  <tbody>
    ${topSpacer}
    <tr>
      <td align="${align}" valign="top">
        ${content}
      </td>
    </tr>
    ${bottomSpacer}
  </tbody>
</table>`;
  }

  /**
   * Generates display toggle wrapper
   */
  generateDisplayToggle(content: string): string {
    const name = this.ctx.blockName;
    return `@{if editor.shouldShow${capitalize(name)}}
${content}
@{end if}`;
  }
}

/**
 * JSON Generator for Mindbox parameters
 */
export class MindboxJSONGenerator {
  constructor(private ctx: MindboxGeneratorContext) {}

  /**
   * Generates base settings common to all blocks
   */
  generateBaseSettings(): any[] {
    const name = this.ctx.blockName;
    const groupName = capitalize(name);
    const s = this.ctx.settings;

    return [
      {
        name: `shouldShow${groupName}`,
        type: 'DISPLAY_TOGGLE',
        defaultValue: String(s.displayToggle),
        group: groupName,
        extra: { label: `Показывать ${name}` }
      },
      {
        name: `${name}Width`,
        type: 'SIZE',
        defaultValue: 'manual 100 600',
        group: `${groupName} >> Общие стили`,
        extra: { 
          label: 'Ширина блока',
          defaultMaxWidth: '600px',
          allowedTypes: ['inherit', 'manual']
        }
      },
      {
        name: `${name}BgColor`,
        type: 'COLOR',
        defaultValue: s.background || '#FFFFFF',
        group: `${groupName} >> Общие стили`,
        extra: { label: 'Цвет фона' }
      },
      {
        name: `${name}OuterSpacing`,
        type: 'OUTER_SPACING',
        defaultValue: s.outerSpacing || '0 0 0 0',
        group: `${groupName} >> Общие стили`,
        extra: { label: 'Внешние отступы (px)' }
      },
      {
        name: `${name}InnerSpacing`,
        type: 'INNER_SPACING',
        defaultValue: s.innerSpacing,
        group: `${groupName} >> Общие стили`,
        extra: { label: 'Внутренние отступы (px)' }
      },
      {
        name: `${name}Border`,
        type: 'BORDER',
        defaultValue: s.border,
        group: `${groupName} >> Общие стили`,
        extra: { label: 'Обводка' }
      },
      {
        name: `${name}BorderRadius`,
        type: 'BORDER_RADIUS',
        defaultValue: s.borderRadius,
        group: `${groupName} >> Общие стили`,
        extra: { label: 'Скругление углов (px)' }
      }
    ];
  }

  /**
   * Generates TEXT-specific settings
   */
  generateTextSettings(): any[] {
    const name = this.ctx.blockName;
    const s = this.ctx.settings;
    
    if (!s.textSettings) return [];

    // Ensure fallbackFont is present
    const textStyles: any = s.textSettings.textStyles || {};
    if (!textStyles.fallbackFont && textStyles.font) {
      textStyles.fallbackFont = 'Arial, sans-serif';
    }

    return [
      {
        name: `${name}Text`,
        type: 'TEXT',
        defaultValue: s.textSettings.text,
        group: capitalize(name),
        extra: { label: 'Текст' }
      },
      {
        name: `${name}Styles`,
        type: 'TEXT_STYLES',
        defaultValue: textStyles,
        group: capitalize(name),
        extra: { label: 'Стили текста' }
      }
    ];
  }

  /**
   * Generates BUTTON-specific settings
   */
  generateButtonSettings(): any[] {
    const name = this.ctx.blockName;
    const s = this.ctx.settings;
    
    if (!s.buttonSettings) return [];

    // Ensure fallbackFont is present
    const textStyles: any = s.buttonSettings.textStyles || {};
    if (!textStyles.fallbackFont && textStyles.font) {
      textStyles.fallbackFont = 'Arial, sans-serif';
    }

    return [
      {
        name: `${name}Url`,
        type: 'URL',
        defaultValue: s.buttonSettings.url,
        group: capitalize(name),
        extra: { label: 'Ссылка кнопки' }
      },
      {
        name: `${name}ButtonText`,
        type: 'SIMPLE_TEXT',
        defaultValue: s.buttonSettings.buttonText,
        group: capitalize(name),
        extra: { label: 'Текст кнопки' }
      },
      {
        name: `${name}ButtonStyles`,
        type: 'SIMPLE_TEXT_STYLES',
        defaultValue: textStyles,
        group: capitalize(name),
        extra: { label: 'Стили текста кнопки' }
      }
    ];
  }

  /**
   * Generates IMAGE-specific settings
   */
  generateImageSettings(): any[] {
    const name = this.ctx.blockName;
    const s = this.ctx.settings;
    
    if (!s.imageSettings) return [];

    return [
      {
        name: `${name}Url`,
        type: 'URL',
        defaultValue: s.imageSettings.url,
        group: capitalize(name),
        extra: { label: 'Ссылка' }
      },
      {
        name: `${name}Image`,
        type: 'IMAGE',
        defaultValue: s.imageSettings.image,
        group: capitalize(name),
        extra: { label: 'Картинка' }
      },
      {
        name: `${name}Alt`,
        type: 'ALT',
        defaultValue: s.imageSettings.alt,
        group: capitalize(name),
        extra: { label: 'Alt-текст' }
      }
    ];
  }
}
