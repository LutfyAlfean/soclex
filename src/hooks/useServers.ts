import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Server {
  id: string;
  name: string;
  ip_address: string;
  server_type: 'proxmox' | 'vm' | 'container' | 'physical';
  status: 'online' | 'warning' | 'critical' | 'offline';
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  os: string | null;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export const useServers = () => {
  return useQuery({
    queryKey: ['servers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Server[];
    },
  });
};

export const useServer = (id: string) => {
  return useQuery({
    queryKey: ['server', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Server | null;
    },
    enabled: !!id,
  });
};
