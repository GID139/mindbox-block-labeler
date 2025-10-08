import { BlockTemplate, BlockType } from '@/types/visual-editor';
import { textTemplate, headingTemplate } from './text';
import { buttonTemplate } from './button';
import { imageTemplate } from './image';
import { containerTemplate } from './container';
import { tableTemplate } from './table';
import { spacerTemplate } from './spacer';
import { rectangleTemplate } from './rectangle';
import { circleTemplate } from './circle';
import { lineTemplate } from './line';

export const blockTemplates: BlockTemplate[] = [
  textTemplate,
  headingTemplate,
  buttonTemplate,
  imageTemplate,
  containerTemplate,
  tableTemplate,
  spacerTemplate,
  rectangleTemplate,
  circleTemplate,
  lineTemplate,
];

export const getTemplate = (type: BlockType): BlockTemplate => {
  const template = blockTemplates.find(t => t.type === type);
  if (!template) {
    throw new Error(`Template not found for type: ${type}`);
  }
  return template;
};

export const getTemplateByName = (name: string): BlockTemplate | undefined => {
  return blockTemplates.find(t => t.name === name);
};
