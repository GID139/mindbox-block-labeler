import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { CreateTab } from "@/components/tabs/CreateTab";
import { FixedCodeTab } from "@/components/tabs/FixedCodeTab";
import { N8nChatTab } from "@/components/tabs/N8nChatTab";
import { HistoryModal } from "@/components/HistoryModal";
import { ImproveGoalModal } from "@/components/ImproveGoalModal";
import { FeedbackButton } from "@/components/FeedbackButton";
import { Sparkles, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { MindboxState, HistoryItem } from "@/types/mindbox";

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
  const [activeTab, setActiveTab] = useState("n8n");
  const [showHistory, setShowHistory] = useState(false);
  const [showImproveGoal, setShowImproveGoal] = useState(false);

  // Проверяем URL на наличие shared data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');
    
    if (sharedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedData))));
        setState(prev => ({ ...prev, ...decoded }));
        toast.success("Данные загружены из ссылки");
        // Очищаем URL
        window.history.replaceState({}, '', window.location.pathname);
      } catch (error) {
        console.error('Error loading shared data:', error);
        toast.error("Не удалось загрузить данные из ссылки");
      }
    }
  }, []);

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

  const handleRestoreHistory = (item: HistoryItem) => {
    setState(prev => ({ ...prev, ...item.data }));
  };

  const handleAcceptImprovedGoal = (improvedGoal: string) => {
    updateState({ goal: improvedGoal });
    toast.success("Цель обновлена");
  };

  const handleClearSession = () => {
    if (confirm("Вы уверены, что хотите очистить текущий сеанс? Все несохраненные данные будут потеряны.")) {
      setState(initialState);
      toast.success("Сеанс очищен");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Header
          onShareClick={handleShareClick}
          onHistoryClick={() => setShowHistory(true)}
          onDownloadState={handleDownloadState}
          onUploadState={handleUploadState}
        />

        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSession}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Очистить сеанс
          </Button>
        </div>

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
              onImproveGoalClick={() => setShowImproveGoal(true)}
            />
          </TabsContent>

          <TabsContent value="fixed" className="mt-0">
            <FixedCodeTab state={state} updateState={updateState} />
          </TabsContent>
        </Tabs>

        <FeedbackButton />

        <HistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          onRestore={handleRestoreHistory}
        />

        <ImproveGoalModal
          isOpen={showImproveGoal}
          onClose={() => setShowImproveGoal(false)}
          currentGoal={state.goal}
          onAccept={handleAcceptImprovedGoal}
        />
      </div>
    </div>
  );
};

export default Index;
