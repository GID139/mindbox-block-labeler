import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { FeedbackButton } from "@/components/FeedbackButton";
import { GoalSection } from "@/components/sections/GoalSection";
import { ControlPanel } from "@/components/sections/ControlPanel";
import { TabsSection } from "@/components/sections/TabsSection";
import { HistorySection } from "@/components/sections/HistorySection";
import { toast } from "sonner";
import type { MindboxState, HistoryItem } from "@/types/mindbox";
import { logger } from "@/lib/logger";

const AUTOSAVE_KEY = 'mindbox-autosave';

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
  const { loading } = useAuth();
  const [state, setState] = useState<MindboxState>(() => {
    // Загружаем сохраненное состояние при инициализации
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        return { ...initialState, ...JSON.parse(saved) };
      }
    } catch (error) {
      logger.error('Error loading autosaved state', 'Index', { error: error instanceof Error ? error.message : error });
    }
    return initialState;
  });
  const [activeTab, setActiveTab] = useState("n8n");
  const [showHistory, setShowHistory] = useState(false);
  const [showImproveGoal, setShowImproveGoal] = useState(false);

  // Автосохранение с debounce 500мс
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state));
      } catch (error) {
        logger.error('Error autosaving state', 'Index', { error: error instanceof Error ? error.message : error });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [state]);

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
        logger.error('Error loading shared data', 'Index', { error: error instanceof Error ? error.message : error });
        toast.error("Не удалось загрузить данные из ссылки");
      }
    }
  }, []);

  const updateState = (updates: Partial<MindboxState>) => {
    setState(prev => ({ ...prev, ...updates }));
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
  };

  const handleClearSession = () => {
    setState(initialState);
  };

  // Показываем загрузку во время проверки авторизации
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <GoalSection 
          state={state}
          onHistoryClick={() => setShowHistory(true)}
          onUploadState={handleUploadState}
        />

        <ControlPanel onClearSession={handleClearSession} />

        <TabsSection
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          state={state}
          updateState={updateState}
          onImproveGoalClick={() => setShowImproveGoal(true)}
        />

        <FeedbackButton />

        <HistorySection
          showHistory={showHistory}
          showImproveGoal={showImproveGoal}
          currentGoal={state.goal}
          onCloseHistory={() => setShowHistory(false)}
          onCloseImproveGoal={() => setShowImproveGoal(false)}
          onRestoreHistory={handleRestoreHistory}
          onAcceptImprovedGoal={handleAcceptImprovedGoal}
        />
      </div>
    </div>
  );
};

export default Index;
