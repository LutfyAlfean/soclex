import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface NotificationSettings {
  id: string;
  telegram_bot_token: string | null;
  telegram_chat_id: string | null;
  telegram_enabled: boolean;
  email_enabled: boolean;
  email_address: string | null;
  created_at: string;
  updated_at: string;
}

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data as NotificationSettings | null;
    },
  });
};

export const useSaveNotificationSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>) => {
      const { data: existing } = await supabase
        .from('notification_settings')
        .select('id')
        .maybeSingle();
      
      if (existing) {
        const { error } = await supabase
          .from('notification_settings')
          .update(settings)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_settings')
          .insert(settings);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast({
        title: 'Settings saved',
        description: 'Notification settings have been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save settings: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};
