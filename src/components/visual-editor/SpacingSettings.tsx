import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SpacingSettingsProps {
  margin?: { top: number; right: number; bottom: number; left: number };
  padding?: { top: number; right: number; bottom: number; left: number };
  onMarginChange?: (margin: any) => void;
  onPaddingChange?: (padding: any) => void;
  showPadding?: boolean;
}

export function SpacingSettings({ 
  margin, 
  padding, 
  onMarginChange, 
  onPaddingChange,
  showPadding = true
}: SpacingSettingsProps) {
  return (
    <Accordion type="multiple" className="border rounded-md">
      {/* Margin */}
      <AccordionItem value="margin" className="border-0">
        <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
          Margin (outer spacing)
        </AccordionTrigger>
        <AccordionContent className="px-3 pb-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Top</Label>
              <Input
                type="number"
                value={margin?.top || 0}
                onChange={(e) => onMarginChange?.({ ...margin, top: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Right</Label>
              <Input
                type="number"
                value={margin?.right || 0}
                onChange={(e) => onMarginChange?.({ ...margin, right: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Bottom</Label>
              <Input
                type="number"
                value={margin?.bottom || 0}
                onChange={(e) => onMarginChange?.({ ...margin, bottom: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Left</Label>
              <Input
                type="number"
                value={margin?.left || 0}
                onChange={(e) => onMarginChange?.({ ...margin, left: parseInt(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Padding */}
      {showPadding && (
        <AccordionItem value="padding" className="border-0">
          <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">
            Padding (inner spacing)
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Top</Label>
                <Input
                  type="number"
                  value={padding?.top || 0}
                  onChange={(e) => onPaddingChange?.({ ...padding, top: parseInt(e.target.value) || 0 })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Right</Label>
                <Input
                  type="number"
                  value={padding?.right || 0}
                  onChange={(e) => onPaddingChange?.({ ...padding, right: parseInt(e.target.value) || 0 })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Bottom</Label>
                <Input
                  type="number"
                  value={padding?.bottom || 0}
                  onChange={(e) => onPaddingChange?.({ ...padding, bottom: parseInt(e.target.value) || 0 })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Left</Label>
                <Input
                  type="number"
                  value={padding?.left || 0}
                  onChange={(e) => onPaddingChange?.({ ...padding, left: parseInt(e.target.value) || 0 })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
