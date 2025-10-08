-- Create visual_editor_projects table
CREATE TABLE IF NOT EXISTS public.visual_editor_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  canvas_state JSONB NOT NULL DEFAULT '[]'::jsonb,
  thumbnail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.visual_editor_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own projects" 
ON public.visual_editor_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.visual_editor_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.visual_editor_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.visual_editor_projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_visual_editor_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_visual_editor_projects_updated_at
BEFORE UPDATE ON public.visual_editor_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_visual_editor_projects_updated_at();

-- Create index for faster queries
CREATE INDEX idx_visual_editor_projects_user_id ON public.visual_editor_projects(user_id);
CREATE INDEX idx_visual_editor_projects_created_at ON public.visual_editor_projects(created_at DESC);