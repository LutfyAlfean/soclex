-- Create tickets table for threat management
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  threat_id UUID REFERENCES public.threats(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  assigned_to TEXT,
  created_by TEXT NOT NULL DEFAULT 'admin',
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- RLS policies for tickets
CREATE POLICY "Allow public read tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Allow public insert tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tickets" ON public.tickets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tickets" ON public.tickets FOR DELETE USING (true);

-- Enable realtime for tickets
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;

-- Add trigger for updated_at
CREATE TRIGGER update_tickets_updated_at 
  BEFORE UPDATE ON public.tickets 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate ticket number
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket number
CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL OR NEW.ticket_number = '')
  EXECUTE FUNCTION public.generate_ticket_number();

-- Add delete policies for servers and agents
CREATE POLICY "Allow public delete servers" ON public.servers FOR DELETE USING (true);
CREATE POLICY "Allow public delete agents" ON public.agents FOR DELETE USING (true);