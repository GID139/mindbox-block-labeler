import { BlockInstance } from '@/types/visual-editor';
import { getTemplate } from './block-templates';

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

  // Render all blocks in zIndex order
  blocks.forEach(block => {
    html += generateBlockHTML(block);
  });

  html += `
      </td>
    </tr>
  </table>
</body>
</html>`;

  return html;
}

function generateBlockHTML(block: BlockInstance): string {
  try {
    const template = getTemplate(block.type);
    return template.generateHTML(block);
  } catch (error) {
    console.error('Error generating HTML for block:', block, error);
    return `<!-- Error generating block ${block.name} -->`;
  }
}

export function generateJSON(blocks: BlockInstance[]): string {
  const params: any[] = [];

  blocks.forEach(block => {
    params.push(...generateBlockJSON(block));
  });

  return JSON.stringify(params, null, 2);
}

function generateBlockJSON(block: BlockInstance): any[] {
  try {
    const template = getTemplate(block.type);
    return template.generateJSON(block);
  } catch (error) {
    console.error('Error generating JSON for block:', block, error);
    return [];
  }
}
