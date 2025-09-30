import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { CreateTab } from "@/components/tabs/CreateTab";
import { FixedCodeTab } from "@/components/tabs/FixedCodeTab";
import { toast } from "sonner";
import type { MindboxState } from "@/types/mindbox";

const HISTORY_KEY = 'mbx_history_v3';

const initialState: MindboxState = {
  goal: '',
  html: '',
  json: '',
  quickFix: false,
  isDynamicGrid: false,
  isEditable: false,
  settings: {},
  improvedGoal: '',
  fixedHtml: '',
  fixedJson: '',
  reportMarkdown: '',
  log: []
};

const Index = () => {
  const [state, setState] = useState<MindboxState>(initialState);
  const [activeTab, setActiveTab] = useState("create");

  const updateState = (updates: Partial<MindboxState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleShareClick = () => {
    try {
      const dataToShare = {
        goal: state.goal,
        html: state.html,
        json: state.json,
        isDynamicGrid: state.isDynamicGrid,
        isEditable: state.isEditable
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(dataToShare))));
      const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
      navigator.clipboard.writeText(url);
      toast.success("Ссылка скопирована в буфер обмена");
    } catch {
      toast.error("Не удалось создать ссылку");
    }
  };

  const handleHistoryClick = () => {
    toast.info("История будет доступна в следующей версии");
  };

  const handleDownloadState = () => {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `mindbox-state-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Состояние скачано");
    } catch {
      toast.error("Ошибка экспорта");
    }
  };

  const handleUploadState = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setState({ ...initialState, ...data });
        toast.success("Состояние загружено");
      } catch {
        toast.error("Некорректный файл JSON");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header
          onShareClick={handleShareClick}
          onHistoryClick={handleHistoryClick}
          onDownloadState={handleDownloadState}
          onUploadState={handleUploadState}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="create">Создание и Редактирование</TabsTrigger>
            <TabsTrigger value="fixed">Исправленный код</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-0">
            <CreateTab state={state} updateState={updateState} setActiveTab={setActiveTab} />
          </TabsContent>

          <TabsContent value="fixed" className="mt-0">
            <FixedCodeTab state={state} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
