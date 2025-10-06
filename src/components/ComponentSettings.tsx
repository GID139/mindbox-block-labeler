import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, RefreshCw } from "lucide-react";
import { components, friendlyNames } from "@/lib/component-settings";
import { analyzeCodeForSettings } from "@/lib/code-sync";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  // Автоматическая синхронизация при загрузке кода
  useEffect(() => {
    if ((html.trim() || json.trim()) && Object.keys(selectedSettings).length === 0) {
      handleSyncWithCode();
    }
  }, [html, json]);

  const handleSyncWithCode = () => {
    const detectedSettings = analyzeCodeForSettings(html, json);
    let syncCount = 0;
    
    Object.entries(detectedSettings).forEach(([settingId, shouldBeSelected]) => {
      if (shouldBeSelected && !selectedSettings[settingId]) {
        const [component, setting] = settingId.split('-');
        onSettingChange(component, setting, true);
        syncCount++;
      }
    });

    if (syncCount > 0) {
      toast.success(`Синхронизировано настроек: ${syncCount}`);
    } else {
      toast.info("Настройки уже синхронизированы");
    }
  };

  if (!html.trim() && !json.trim()) {
    return null;
  }

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
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Настройки компонентов</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncWithCode}
          disabled={!html.trim() && !json.trim()}
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Синхронизировать с кодом
        </Button>
      </div>
      
      <TooltipProvider>
      <Accordion type="multiple" className="w-full">
        {Object.entries(components).map(([componentKey, component]) => {
          const groupedSettings = groupSettingsByCategory(component.settings);
          
          return (
            <AccordionItem key={componentKey} value={componentKey}>
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    id={`${componentKey}-all`}
                    checked={Object.keys(component.settings).every(
                      (setting) => selectedSettings[`${componentKey}-${setting}`]
                    )}
                    onCheckedChange={(checked) => {
                      Object.keys(component.settings).forEach((setting) => {
                        onSettingChange(componentKey, setting, checked as boolean);
                      });
                    }}
                  />
                  <Label
                    htmlFor={`${componentKey}-all`}
                    className="font-semibold cursor-pointer"
                  >
                    {component.title}
                  </Label>
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
                  {Object.entries(groupedSettings).map(([group, settings]) => {
                    const groupSettingIds = settings.map(s => `${componentKey}-${s}`);
                    const allChecked = groupSettingIds.every(id => selectedSettings[id]);
                    const someChecked = groupSettingIds.some(id => selectedSettings[id]) && !allChecked;
                    
                    const handleGroupToggle = (checked: boolean) => {
                      settings.forEach(settingKey => {
                        onSettingChange(componentKey, settingKey, checked);
                      });
                    };
                    
                    return (
                    <div key={group}>
                      <div className="flex items-center gap-2 mb-2 pb-1 border-b">
                        <Checkbox
                          id={`${componentKey}-${group}-all`}
                          checked={someChecked ? "indeterminate" : allChecked}
                          onCheckedChange={handleGroupToggle}
                        />
                        <Label
                          htmlFor={`${componentKey}-${group}-all`}
                          className="text-sm font-semibold text-muted-foreground cursor-pointer"
                        >
                          {group}
                        </Label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {settings.map((settingKey) => {
                          const settingId = `${componentKey}-${settingKey}`;
                          const config = component.settings[settingKey];
                          
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
                              {config.tooltip && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
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
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </TooltipProvider>
    </Card>
  );
}
