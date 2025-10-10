import { toPng, toSvg } from 'html-to-image';
import { BlockInstance } from '@/types/visual-editor';
import { toast } from 'sonner';
import Konva from 'konva';

export const exportToPNG = async (element: HTMLElement, filename: string = 'canvas.png') => {
  try {
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
    });
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    
    toast.success('Exported to PNG');
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    toast.error('Failed to export PNG');
  }
};

export const exportToSVG = async (element: HTMLElement, filename: string = 'canvas.svg') => {
  try {
    const dataUrl = await toSvg(element);
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    
    toast.success('Exported to SVG');
  } catch (error) {
    console.error('Error exporting to SVG:', error);
    toast.error('Failed to export SVG');
  }
};

export const exportToJSON = (blocks: BlockInstance[], filename: string = 'canvas.json') => {
  try {
    const json = JSON.stringify(blocks, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Exported to JSON');
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    toast.error('Failed to export JSON');
  }
};

export const importFromJSON = (file: File): Promise<BlockInstance[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const blocks = JSON.parse(content) as BlockInstance[];
        toast.success('Imported from JSON');
        resolve(blocks);
      } catch (error) {
        console.error('Error importing JSON:', error);
        toast.error('Failed to import JSON - invalid format');
        reject(error);
      }
    };
    
    reader.onerror = () => {
      toast.error('Failed to read file');
      reject(reader.error);
    };
    
    reader.readAsText(file);
  });
};

export const importImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      toast.success('Image imported');
      resolve(dataUrl);
    };
    
    reader.onerror = () => {
      toast.error('Failed to read image');
      reject(reader.error);
    };
    
    reader.readAsDataURL(file);
  });
};

// Konva Stage Export Functions
export async function exportStageToPNG(stage: Konva.Stage, filename: string) {
  try {
    const dataURL = stage.toDataURL({
      mimeType: 'image/png',
      quality: 1,
      pixelRatio: 2, // HQ export (2x resolution)
    });

    downloadDataURL(dataURL, `${filename}.png`);
    toast.success('Exported to PNG');
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    toast.error('Failed to export PNG');
  }
}

export async function exportStageToJPEG(stage: Konva.Stage, filename: string) {
  try {
    const dataURL = stage.toDataURL({
      mimeType: 'image/jpeg',
      quality: 0.9,
      pixelRatio: 2,
    });

    downloadDataURL(dataURL, `${filename}.jpeg`);
    toast.success('Exported to JPEG');
  } catch (error) {
    console.error('Error exporting to JPEG:', error);
    toast.error('Failed to export JPEG');
  }
}

function downloadDataURL(dataURL: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
