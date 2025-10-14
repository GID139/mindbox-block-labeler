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
    return `<td style="background-color: \${editor.${name}BgColor}; 
           padding: \${editor.${name}InnerSpacing}; 
           border-radius: \${editor.${name}BorderRadius}; 
           border: \${editor.${name}Border};">
  ${content}
</td>`;
  }

  /**
   * Generates outer wrapper with outer spacing (margin emulation)
   */
  generateWrapper(content: string, align: string = 'center'): string {
    const outerSpacing = this.ctx.settings.outerSpacing || '0';
    return `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
  <tbody>
    <tr>
      <td align="${align}" valign="top" style="padding: ${outerSpacing};">
        ${content}
      </td>
    </tr>
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
        name: `${name}BgColor`,
        type: 'COLOR',
        defaultValue: s.background || '#FFFFFF',
        group: `${groupName} >> Общие стили`,
        extra: { label: 'Цвет фона' }
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
        defaultValue: s.textSettings.textStyles,
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
        defaultValue: s.buttonSettings.textStyles,
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
