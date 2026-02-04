import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServerLog {
  id: string;
  server_id: string;
  log_type: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  metadata: Record<string, unknown>;
  created_at: string;
}

export const useServerLogs = (serverId: string, limit: number = 50) => {
  return useQuery({
    queryKey: ['server-logs', serverId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('server_logs')
        .select('*')
        .eq('server_id', serverId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as ServerLog[];
    },
    enabled: !!serverId,
  });
};
