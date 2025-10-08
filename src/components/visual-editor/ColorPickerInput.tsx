import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Pipette } from 'lucide-react';
import { toast } from 'sonner';

interface ColorPickerInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPickerInput({ label, value, onChange }: ColorPickerInputProps) {
  const handleEyedropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        onChange(result.sRGBHex);
      } catch (e) {
        // User cancelled
      }
    } else {
      toast.error('Eyedropper not supported in this browser');
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 mt-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          placeholder="#000000"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={handleEyedropper}
          title="Pick color from screen"
        >
          <Pipette className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-12 p-0"
              style={{ backgroundColor: value }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <HexColorPicker color={value} onChange={onChange} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
