import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Threat {
  id: string;
  ip_address: string;
  threat_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  is_resolved: boolean;
  detected_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useThreats = () => {
  return useQuery({
    queryKey: ['threats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('threats')
        .select('*')
        .order('detected_at', { ascending: false });
      
      if (error) throw error;
      return data as Threat[];
    },
  });
};

export const useResolveThread = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (threatId: string) => {
      const { error } = await supabase
        .from('threats')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', threatId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
    },
  });
};
