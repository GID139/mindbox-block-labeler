import { useState, useEffect } from "react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Card } from "./ui/card";
import { components, friendlyNames } from "@/lib/component-settings";
import { extractHtmlVariables, extractJsonVariables } from "@/lib/code-validators";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Info } from "lucide-react";

interface ComponentSettingsProps {
  html: string;
  json: string;
  selectedSettings: Record<string, boolean>;
  onSettingChange: (component: string, setting: string, checked: boolean) => void;
}

export function ComponentSettings({
  html,
  json,
  selectedSettings,
  onSettingChange,
}: ComponentSettingsProps) {
  const [activeVars, setActiveVars] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Синхронизируем с кодом
    const htmlVars = extractHtmlVariables(html);
    const jsonVars = extractJsonVariables(json);
    setActiveVars(new Set([...htmlVars, ...jsonVars]));
  }, [html, json]);

  const groupSettingsByCategory = (settings: Record<string, any>) => {
    const grouped: Record<string, string[]> = {};
    
    Object.entries(settings).forEach(([key, config]) => {
      const group = config.group || "Прочее";
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(key);
    });
    
    return grouped;
  };

  return (
    <TooltipProvider>
      <Card className="p-4">
        <h3 className="font-semibold text-lg mb-4">Настройки компонентов</h3>
        
        <Accordion type="multiple" className="w-full">
          {Object.entries(components).map(([componentKey, component]) => {
            const groupedSettings = groupSettingsByCategory(component.settings);
            
            return (
              <AccordionItem key={componentKey} value={componentKey}>
                <AccordionTrigger className="text-left hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{component.title}</span>
                    {Object.keys(component.settings).some(
                      (setting) =>
                        selectedSettings[`${componentKey}-${setting}`]
                    ) && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                        Активно
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {Object.entries(groupedSettings).map(([group, settings]) => (
                      <div key={group}>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2 pb-1 border-b">
                          {group}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {settings.map((settingKey) => {
                            const settingId = `${componentKey}-${settingKey}`;
                            const config = component.settings[settingKey];
                            const isActive = activeVars.has(settingKey);
                            
                            return (
                              <div
                                key={settingId}
                                className="flex items-center gap-2 p-2 rounded hover:bg-muted/50"
                              >
                                <Checkbox
                                  id={settingId}
                                  checked={selectedSettings[settingId] || false}
                                  onCheckedChange={(checked) =>
                                    onSettingChange(
                                      componentKey,
                                      settingKey,
                                      checked as boolean
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={settingId}
                                  className="flex-1 text-sm cursor-pointer"
                                >
                                  {friendlyNames[settingKey] || settingKey}
                                </Label>
                                {isActive && (
                                  <span className="text-xs text-primary">●</span>
                                )}
                                {config.tooltip && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">{config.tooltip}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Card>
    </TooltipProvider>
  );
}
