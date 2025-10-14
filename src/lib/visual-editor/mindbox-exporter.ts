import { BlockInstance } from '@/types/visual-editor';
import { VisualLayout } from '@/stores/visual-editor-store';
import { getTemplate } from './block-templates';
import { buildBlockTree } from './hierarchy-detector';

/**
 * Exports blocks to Mindbox HTML format
 */
export function exportMindboxHTML(
  blocks: BlockInstance[],
  visualLayout: VisualLayout,
  templateName: string = 'my_template'
): string {
  // Build hierarchy tree (автоматическое определение вложенности)
  const tree = buildBlockTree(blocks, visualLayout);

  let html = `<!-- EDITOR_BLOCK_TEMPLATE: ${templateName} -->

<!--[if mso]>
<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600" align="center">
<tr><td>
<![endif]-->

<table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto;">
  <tbody>
    <tr>
      <td style="padding: 0;">
`;

  // Render root-level blocks (blocks without parents)
  tree.forEach(node => {
    html += renderBlockNode(node, visualLayout);
  });

  html += `
      </td>
    </tr>
  </tbody>
</table>

<!--[if mso]>
</td></tr>
</table>
<![endif]-->`;

  return html;
}

/**
 * Renders a single block node (with potential children)
 */
function renderBlockNode(
  node: { block: BlockInstance; children: any[]; relativeCoords?: { x: number; y: number } },
  visualLayout: VisualLayout
): string {
  const block = node.block;
  const template = getTemplate(block.type);

  // Render children recursively
  const childrenHTML = node.children.map(child => renderBlockNode(child, visualLayout)).join('\n');

  // Use Mindbox generator if available and enabled
  if (block.mindboxSettings?.enabled && template.generateMindboxHTML) {
    const blockHTML = template.generateMindboxHTML(block, childrenHTML);
    return blockHTML;
  }

  // Fallback to standard HTML
  return template.generateHTML(block);
}

/**
 * Exports blocks to Mindbox JSON format
 */
export function exportMindboxJSON(blocks: BlockInstance[]): any[] {
  const params: any[] = [];

  blocks.forEach(block => {
    if (block.mindboxSettings?.enabled) {
      const template = getTemplate(block.type);
      if (template.generateMindboxJSON) {
        params.push(...template.generateMindboxJSON(block));
      }
    }
  });

  return params;
}

/**
 * Downloads HTML file
 */
export function downloadMindboxHTML(html: string, filename: string = 'template.html') {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Downloads JSON file
 */
export function downloadMindboxJSON(json: any[], filename: string = 'template.json') {
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
