import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPickerInput({ label, value, onChange }: ColorPickerInputProps) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2 items-center">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm"
          placeholder="#000000"
        />
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-10 h-10 rounded border-2 border-border cursor-pointer hover:scale-105 transition-transform"
              style={{ backgroundColor: value }}
              title="Pick color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="end">
            <HexColorPicker color={value} onChange={onChange} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
