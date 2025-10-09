import { BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './block-templates';
import { getChildren, getRootBlocks } from './coordinate-utils';

export function generateHTML(blocks: BlockInstance[]): string {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mindbox Template</title>
</head>
<body>
  <table width="600" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
    <tr>
      <td>
`;

  // Only render root blocks
  getRootBlocks(blocks).forEach(block => {
    html += generateBlockHTML(block, blocks, 0);
  });

  html += `
      </td>
    </tr>
  </table>
</body>
</html>`;

  return html;
}

function generateBlockHTML(block: BlockInstance, allBlocks: BlockInstance[], level: number): string {
  try {
    const template = getTemplate(block.type);
    let html = template.generateHTML(block);
    
    // If this block can contain children, inject children HTML
    if (block.canContainChildren) {
      const children = getChildren(allBlocks, block.id);
      
      if (children.length > 0) {
        const childrenHTML = children
          .map(child => generateBlockHTML(child, allBlocks, level + 1))
          .join('');
        
        // Inject children before closing tag
        html = html.replace(/<\/div>(?![\s\S]*<\/div>)/, `${childrenHTML}</div>`);
      }
    }
    
    return html;
  } catch (error) {
    console.error('Error generating HTML for block:', block, error);
    return `<!-- Error generating block ${block.name} -->`;
  }
}

export function generateJSON(blocks: BlockInstance[]): string {
  const params: any[] = [];

  getRootBlocks(blocks).forEach(block => {
    params.push(...generateBlockJSON(block, blocks));
  });

  return JSON.stringify(params, null, 2);
}

function generateBlockJSON(block: BlockInstance, allBlocks: BlockInstance[]): any[] {
  try {
    const template = getTemplate(block.type);
    let params = template.generateJSON(block);
    
    // Recursively add children JSON
    const children = getChildren(allBlocks, block.id);
    children.forEach(child => {
      params.push(...generateBlockJSON(child, allBlocks));
    });
    
    return params;
  } catch (error) {
    console.error('Error generating JSON for block:', block, error);
    return [];
  }
}
