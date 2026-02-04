import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ServerInput {
  name: string;
  ip_address: string;
  server_type: 'proxmox' | 'vm' | 'container' | 'physical';
  status: 'online' | 'warning' | 'critical' | 'offline';
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
  os?: string;
}

export const useCreateServer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (server: ServerInput) => {
      const { data, error } = await supabase
        .from('servers')
        .insert({
          ...server,
          cpu_usage: server.cpu_usage || 0,
          memory_usage: server.memory_usage || 0,
          disk_usage: server.disk_usage || 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast({ title: 'Server Added', description: 'New server has been added successfully.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateServer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServerInput> & { id: string }) => {
      const { error } = await supabase
        .from('servers')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast({ title: 'Server Updated', description: 'Server has been updated successfully.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteServer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('servers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      toast({ title: 'Server Deleted', description: 'Server has been removed.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
