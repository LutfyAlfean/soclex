import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  source: string | null;
  is_read: boolean;
  server_id: string | null;
  threat_id: string | null;
  created_at: string;
}

export const useAlerts = () => {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as Alert[];
    },
  });
};

export const useUnreadAlertCount = () => {
  return useQuery({
    queryKey: ['alerts', 'unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      
      if (error) throw error;
      return count || 0;
    },
  });
};

export const useMarkAlertAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
};

export const useRealtimeAlerts = () => {
  const queryClient = useQueryClient();
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
  
  useEffect(() => {
    const channel = supabase
      .channel('alerts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          const newAlert = payload.new as Alert;
          setLatestAlert(newAlert);
          
          // Show toast notification
          toast({
            title: newAlert.title,
            description: newAlert.message,
            variant: newAlert.severity === 'critical' || newAlert.severity === 'high' 
              ? 'destructive' 
              : 'default',
          });
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['alerts'] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  return latestAlert;
};
