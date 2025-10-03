import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTab } from "@/components/tabs/CreateTab";
import { FixedCodeTab } from "@/components/tabs/FixedCodeTab";
import { N8nChatTab } from "@/components/tabs/N8nChatTab";
import type { MindboxState } from "@/types/mindbox";

interface TabsSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  state: MindboxState;
  updateState: (updates: Partial<MindboxState>) => void;
  onImproveGoalClick: () => void;
}

export function TabsSection({
  activeTab,
  setActiveTab,
  state,
  updateState,
  onImproveGoalClick
}: TabsSectionProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="n8n">n8n Chat</TabsTrigger>
        <TabsTrigger value="create">Создание и Редактирование</TabsTrigger>
        <TabsTrigger value="fixed">Исправленный код</TabsTrigger>
      </TabsList>

      <TabsContent value="n8n" className="mt-0">
        <N8nChatTab />
      </TabsContent>

      <TabsContent value="create" className="mt-0">
        <CreateTab 
          state={state} 
          updateState={updateState} 
          setActiveTab={setActiveTab}
          onImproveGoalClick={onImproveGoalClick}
        />
      </TabsContent>

      <TabsContent value="fixed" className="mt-0">
        <FixedCodeTab state={state} updateState={updateState} />
      </TabsContent>
    </Tabs>
  );
}
