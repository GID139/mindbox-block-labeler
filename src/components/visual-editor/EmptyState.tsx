import { ArrowLeft, Sparkles } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
        <Sparkles className="h-16 w-16 text-primary relative z-10" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Start Building Your Email</h3>
      <p className="text-muted-foreground text-sm max-w-md mb-6">
        Drag blocks from the library on the left to create your email template.
        You can nest blocks, customize styles, and preview in real-time.
      </p>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
        <ArrowLeft className="h-4 w-4" />
        <span>Choose a block to get started</span>
      </div>
      
      <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
            📝
          </div>
          <span>Text & Headings</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
            🔘
          </div>
          <span>Buttons & Links</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
            🎨
          </div>
          <span>Containers & Tables</span>
        </div>
      </div>
    </div>
  );
}
