import { BlockInstance } from '@/types/visual-editor';

export interface Preset {
  id: string;
  name: string;
  category: 'layout' | 'header' | 'footer' | 'content' | 'cta' | 'custom';
  thumbnail?: string;
  description?: string;
  blocks: BlockInstance[];
}

export const defaultPresets: Preset[] = [
  {
    id: 'hero-section',
    name: 'Hero Section',
    category: 'header',
    description: 'Header with title and button',
    blocks: [
      {
        id: 'hero-container',
        type: 'CONTAINER',
        name: 'hero',
        settings: {
          display: 'block',
          background: { type: 'color', value: '#4F46E5' },
          padding: { top: 40, right: 30, bottom: 40, left: 30 },
          width: '100%',
          autoLayout: true,
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20',
        },
        canContainChildren: true,
        maxNestingLevel: 3,
        children: [
          {
            id: 'hero-title',
            type: 'TEXT',
            name: 'title',
            settings: {
              text: 'Welcome to Our Product',
              textStyles: {
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
              },
            },
            children: [],
            canContainChildren: false,
            maxNestingLevel: 0,
          },
          {
            id: 'hero-subtitle',
            type: 'TEXT',
            name: 'subtitle',
            settings: {
              text: 'The best solution for your business needs',
              textStyles: {
                fontSize: '18px',
                color: '#E0E7FF',
                textAlign: 'center',
              },
            },
            children: [],
            canContainChildren: false,
            maxNestingLevel: 0,
          },
          {
            id: 'hero-button',
            type: 'BUTTON',
            name: 'cta-button',
            settings: {
              text: 'Get Started',
              link: '#',
              buttonStyles: {
                backgroundColor: '#ffffff',
                textColor: '#4F46E5',
                fontSize: '16px',
                fontWeight: 'bold',
                padding: '12px 32px',
                borderRadius: '8px',
              },
            },
            children: [],
            canContainChildren: false,
            maxNestingLevel: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'two-column',
    name: 'Two Column Layout',
    category: 'layout',
    description: 'Side-by-side content areas',
    blocks: [
      {
        id: 'two-col-container',
        type: 'CONTAINER',
        name: 'two-columns',
        settings: {
          display: 'block',
          background: { type: 'transparent' },
          padding: { top: 20, right: 20, bottom: 20, left: 20 },
          width: '100%',
          autoLayout: true,
          flexDirection: 'row',
          gap: '20',
        },
        canContainChildren: true,
        maxNestingLevel: 3,
        children: [
          {
            id: 'col1',
            type: 'CONTAINER',
            name: 'column1',
            settings: {
              display: 'block',
              background: { type: 'color', value: '#F3F4F6' },
              padding: { top: 20, right: 20, bottom: 20, left: 20 },
              width: '50%',
            },
            children: [
              {
                id: 'col1-text',
                type: 'TEXT',
                name: 'text1',
                settings: {
                  text: 'Column 1 Content',
                  textStyles: {
                    fontSize: '16px',
                    color: '#1F2937',
                  },
                },
                children: [],
                canContainChildren: false,
                maxNestingLevel: 0,
              },
            ],
            canContainChildren: true,
            maxNestingLevel: 2,
          },
          {
            id: 'col2',
            type: 'CONTAINER',
            name: 'column2',
            settings: {
              display: 'block',
              background: { type: 'color', value: '#F3F4F6' },
              padding: { top: 20, right: 20, bottom: 20, left: 20 },
              width: '50%',
            },
            children: [
              {
                id: 'col2-text',
                type: 'TEXT',
                name: 'text2',
                settings: {
                  text: 'Column 2 Content',
                  textStyles: {
                    fontSize: '16px',
                    color: '#1F2937',
                  },
                },
                children: [],
                canContainChildren: false,
                maxNestingLevel: 0,
              },
            ],
            canContainChildren: true,
            maxNestingLevel: 2,
          },
        ],
      },
    ],
  },
  {
    id: 'cta-box',
    name: 'Call to Action Box',
    category: 'cta',
    description: 'Centered CTA with background',
    blocks: [
      {
        id: 'cta-container',
        type: 'CONTAINER',
        name: 'cta-box',
        settings: {
          display: 'block',
          background: { type: 'color', value: '#10B981' },
          padding: { top: 30, right: 30, bottom: 30, left: 30 },
          width: '100%',
          autoLayout: true,
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15',
        },
        canContainChildren: true,
        maxNestingLevel: 3,
        children: [
          {
            id: 'cta-heading',
            type: 'TEXT',
            name: 'heading',
            settings: {
              text: 'Ready to Get Started?',
              textStyles: {
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
              },
            },
            children: [],
            canContainChildren: false,
            maxNestingLevel: 0,
          },
          {
            id: 'cta-text',
            type: 'TEXT',
            name: 'description',
            settings: {
              text: 'Join thousands of satisfied customers today',
              textStyles: {
                fontSize: '16px',
                color: '#D1FAE5',
                textAlign: 'center',
              },
            },
            children: [],
            canContainChildren: false,
            maxNestingLevel: 0,
          },
          {
            id: 'cta-btn',
            type: 'BUTTON',
            name: 'action-button',
            settings: {
              text: 'Sign Up Now',
              link: '#',
              buttonStyles: {
                backgroundColor: '#ffffff',
                textColor: '#10B981',
                fontSize: '16px',
                fontWeight: 'bold',
                padding: '12px 28px',
                borderRadius: '6px',
              },
            },
            children: [],
            canContainChildren: false,
            maxNestingLevel: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'footer-simple',
    name: 'Simple Footer',
    category: 'footer',
    description: 'Footer with copyright text',
    blocks: [
      {
        id: 'footer-container',
        type: 'CONTAINER',
        name: 'footer',
        settings: {
          display: 'block',
          background: { type: 'color', value: '#1F2937' },
          padding: { top: 20, right: 20, bottom: 20, left: 20 },
          width: '100%',
          autoLayout: true,
          flexDirection: 'column',
          alignItems: 'center',
        },
        canContainChildren: true,
        maxNestingLevel: 3,
        children: [
          {
            id: 'footer-text',
            type: 'TEXT',
            name: 'copyright',
            settings: {
              text: '© 2024 Your Company. All rights reserved.',
              textStyles: {
                fontSize: '14px',
                color: '#9CA3AF',
                textAlign: 'center',
              },
            },
            children: [],
            canContainChildren: false,
            maxNestingLevel: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'three-feature-cards',
    name: '3 Feature Cards',
    category: 'content',
    description: 'Three column feature showcase',
    blocks: [
      {
        id: 'features-container',
        type: 'CONTAINER',
        name: 'features',
        settings: {
          display: 'block',
          background: { type: 'transparent' },
          padding: { top: 30, right: 20, bottom: 30, left: 20 },
          width: '100%',
          autoLayout: true,
          flexDirection: 'row',
          gap: '20',
          justifyContent: 'space-between',
        },
        canContainChildren: true,
        maxNestingLevel: 3,
        children: [
          {
            id: 'feature1',
            type: 'CONTAINER',
            name: 'feature-1',
            settings: {
              display: 'block',
              background: { type: 'color', value: '#EFF6FF' },
              padding: { top: 20, right: 20, bottom: 20, left: 20 },
              width: '33%',
              autoLayout: true,
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10',
            },
            canContainChildren: true,
            maxNestingLevel: 2,
            children: [
              {
                id: 'feature1-title',
                type: 'TEXT',
                name: 'title1',
                settings: {
                  text: 'Feature 1',
                  textStyles: {
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1E40AF',
                    textAlign: 'center',
                  },
                },
                children: [],
                canContainChildren: false,
                maxNestingLevel: 0,
              },
              {
                id: 'feature1-desc',
                type: 'TEXT',
                name: 'desc1',
                settings: {
                  text: 'Description of feature 1',
                  textStyles: {
                    fontSize: '14px',
                    color: '#1F2937',
                    textAlign: 'center',
                  },
                },
                children: [],
                canContainChildren: false,
                maxNestingLevel: 0,
              },
            ],
          },
          {
            id: 'feature2',
            type: 'CONTAINER',
            name: 'feature-2',
            settings: {
              display: 'block',
              background: { type: 'color', value: '#F0FDF4' },
              padding: { top: 20, right: 20, bottom: 20, left: 20 },
              width: '33%',
              autoLayout: true,
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10',
            },
            canContainChildren: true,
            maxNestingLevel: 2,
            children: [
              {
                id: 'feature2-title',
                type: 'TEXT',
                name: 'title2',
                settings: {
                  text: 'Feature 2',
                  textStyles: {
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#15803D',
                    textAlign: 'center',
                  },
                },
                children: [],
                canContainChildren: false,
                maxNestingLevel: 0,
              },
              {
                id: 'feature2-desc',
                type: 'TEXT',
                name: 'desc2',
                settings: {
                  text: 'Description of feature 2',
                  textStyles: {
                    fontSize: '14px',
                    color: '#1F2937',
                    textAlign: 'center',
                  },
                },
                children: [],
                canContainChildren: false,
                maxNestingLevel: 0,
              },
            ],
          },
          {
            id: 'feature3',
            type: 'CONTAINER',
            name: 'feature-3',
            settings: {
              display: 'block',
              background: { type: 'color', value: '#FEF3C7' },
              padding: { top: 20, right: 20, bottom: 20, left: 20 },
              width: '33%',
              autoLayout: true,
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10',
            },
            canContainChildren: true,
            maxNestingLevel: 2,
            children: [
              {
                id: 'feature3-title',
                type: 'TEXT',
                name: 'title3',
                settings: {
                  text: 'Feature 3',
                  textStyles: {
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#92400E',
                    textAlign: 'center',
                  },
                },
                children: [],
                canContainChildren: false,
                maxNestingLevel: 0,
              },
              {
                id: 'feature3-desc',
                type: 'TEXT',
                name: 'desc3',
                settings: {
                  text: 'Description of feature 3',
                  textStyles: {
                    fontSize: '14px',
                    color: '#1F2937',
                    textAlign: 'center',
                  },
                },
                children: [],
                canContainChildren: false,
                maxNestingLevel: 0,
              },
            ],
          },
        ],
      },
    ],
  },
];

// Style presets for individual blocks
export const buttonPresets = {
  primary: {
    backgroundColor: '#39AA5D',
    textColor: '#FFFFFF',
    borderRadius: '4',
    fontSize: '16',
    fontWeight: 'bold',
  },
  secondary: {
    backgroundColor: '#6C757D',
    textColor: '#FFFFFF',
    borderRadius: '4',
    fontSize: '16',
    fontWeight: 'normal',
  },
  success: {
    backgroundColor: '#28A745',
    textColor: '#FFFFFF',
    borderRadius: '4',
    fontSize: '16',
    fontWeight: 'bold',
  },
  danger: {
    backgroundColor: '#DC3545',
    textColor: '#FFFFFF',
    borderRadius: '4',
    fontSize: '16',
    fontWeight: 'bold',
  },
};

export const textPresets = {
  heading: {
    fontSize: '32',
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'left',
  },
  subheading: {
    fontSize: '24',
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'left',
  },
  body: {
    fontSize: '16',
    fontWeight: 'normal',
    color: '#333333',
    textAlign: 'left',
  },
  caption: {
    fontSize: '12',
    fontWeight: 'normal',
    color: '#666666',
    textAlign: 'left',
  },
};
