import { Download, History, Share2, Upload, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface HeaderProps {
  onShareClick: () => void;
  onHistoryClick: () => void;
  onDownloadState: () => void;
  onUploadState: (file: File) => void;
}

export function Header({
  onShareClick,
  onHistoryClick,
  onDownloadState,
  onUploadState,
}: HeaderProps) {
  const { signOut, user } = useAuth();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadState(file);
      e.target.value = '';
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Ошибка выхода");
    } else {
      toast.success("Вы вышли из аккаунта");
    }
  };

  return (
    <header className="text-center mb-8">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Генератор блоков для <span className="text-primary">Mindbox</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Создавайте и редактируйте HTML-блоки для конструктора Mindbox
          </p>
          <div className="flex justify-center">
            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <a
                href="https://help.mindbox.ru/docs/email-editor-upload-blocks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Документация по разметке блоков →
              </a>
            </Button>
          </div>
        </div>
        
        <TooltipProvider>
          <div className="flex items-center gap-2 ml-4">
            {user && (
              <div className="flex items-center gap-2 mr-2 px-3 py-1 bg-muted rounded-md">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
              </div>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onShareClick}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Поделиться</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onHistoryClick}
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>История</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onDownloadState}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Скачать состояние</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Загрузить состояние</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Выйти</TooltipContent>
            </Tooltip>
            
            <input
              id="file-upload"
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </TooltipProvider>
      </div>
    </header>
  );
}
