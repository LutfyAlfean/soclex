import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServerMetric {
  id: string;
  server_id: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_in: number;
  network_out: number;
  recorded_at: string;
}

export const useServerMetrics = (serverId: string, limit: number = 24) => {
  return useQuery({
    queryKey: ['server-metrics', serverId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('server_metrics')
        .select('*')
        .eq('server_id', serverId)
        .order('recorded_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return (data as ServerMetric[]).reverse();
    },
    enabled: !!serverId,
  });
};
