import { useRef } from "react";
import { Button } from "./ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { parseZipFile } from "@/lib/zip-parser";
import { logger } from "@/lib/logger";

interface ZipUploadProps {
  onZipParsed: (editorHtml: string, visualHtml: string, json: string) => void;
  isLoading?: boolean;
}

export function ZipUpload({ onZipParsed, isLoading }: ZipUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast.error("Пожалуйста, выберите ZIP файл");
      return;
    }

    try {
      const { editorHtml, visualHtml, json } = await parseZipFile(file);
      
      if (!editorHtml && !visualHtml && !json) {
        toast.error("В ZIP файле не найдены HTML или JSON файлы");
        return;
      }

      onZipParsed(editorHtml, visualHtml, json);
      toast.success("ZIP файл успешно загружен");
    } catch (error) {
      logger.error("Error parsing ZIP", "ZipUpload", { error: error instanceof Error ? error.message : error });
      toast.error("Ошибка при обработке ZIP файла");
    } finally {
      // Очищаем input для возможности повторной загрузки того же файла
      e.target.value = "";
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Обработка...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Загрузить ZIP с блоком
          </>
        )}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}
