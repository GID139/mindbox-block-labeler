import { BlockTemplate, BlockInstance, TableSettings } from '@/types/visual-editor';

export const tableTemplate: BlockTemplate = {
  type: 'TABLE',
  name: 'Table',
  category: 'LAYOUT',
  icon: '📊',
  canContainChildren: true,
  maxNestingLevel: 3,
  defaultSettings: {
    rows: 2,
    cols: 2,
    cells: {
      '0,0': { children: [], settings: { verticalAlign: 'top', padding: '8px' } },
      '0,1': { children: [], settings: { verticalAlign: 'top', padding: '8px' } },
      '1,0': { children: [], settings: { verticalAlign: 'top', padding: '8px' } },
      '1,1': { children: [], settings: { verticalAlign: 'top', padding: '8px' } },
    },
    borderCollapse: 'collapse',
    cellSpacing: 0,
    display: true,
  },
  availableSettings: ['display', 'tableStructure'],
  
  generateHTML: (block: BlockInstance): string => {
    const settings = block.settings as TableSettings;
    const { rows, cols, cells, borderCollapse, cellSpacing } = settings;
    
    let html = `<table border="0" cellpadding="0" cellspacing="${cellSpacing}" style="border-collapse: ${borderCollapse}; width: 100%;">`;
    
    for (let row = 0; row < rows; row++) {
      html += '<tr>';
      
      for (let col = 0; col < cols; col++) {
        const cellKey = `${row},${col}`;
        const cell = cells[cellKey] || { children: [], settings: {} };
        const cellSettings = cell.settings || {};
        
        const style = `
          vertical-align: ${cellSettings.verticalAlign || 'top'};
          padding: ${cellSettings.padding || '8px'};
          ${cellSettings.background ? `background-color: ${cellSettings.background};` : ''}
        `.trim();
        
        let cellContent = '';
        
        // Process cell children
        if (cell.children && cell.children.length > 0) {
          cellContent = cell.children.map(child => {
            const childTemplate = require('./index').getTemplate(child.type);
            return childTemplate.generateHTML(child);
          }).join('');
        }
        
        html += `<td style="${style}">${cellContent}</td>`;
      }
      
      html += '</tr>';
    }
    
    html += '</table>';
    
    return html;
  },
  
  generateJSON: (block: BlockInstance): any[] => {
    const params: any[] = [];
    const settings = block.settings as TableSettings;
    const { rows, cols, cells } = settings;
    
    params.push(
      {
        name: `${block.name}_rows`,
        type: 'number',
        value: rows,
      },
      {
        name: `${block.name}_cols`,
        type: 'number',
        value: cols,
      }
    );
    
    // Process all cell children
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellKey = `${row},${col}`;
        const cell = cells[cellKey];
        
        if (cell && cell.children && cell.children.length > 0) {
          cell.children.forEach(child => {
            const childTemplate = require('./index').getTemplate(child.type);
            params.push(...childTemplate.generateJSON(child));
          });
        }
      }
    }
    
    return params;
  },
};
