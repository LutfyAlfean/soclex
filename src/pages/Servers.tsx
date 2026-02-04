import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { useServers } from '@/hooks/useServers';
import { useCreateServer, useUpdateServer, useDeleteServer, ServerInput } from '@/hooks/useServersCrud';
import { Server, Cpu, HardDrive, Wifi, WifiOff, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'proxmox': return <Server className="w-5 h-5 text-cyber-blue" />;
    case 'vm': return <Cpu className="w-5 h-5 text-cyber-purple" />;
    case 'container': return <HardDrive className="w-5 h-5 text-cyber-green" />;
    case 'physical': return <Server className="w-5 h-5 text-cyber-orange" />;
    default: return <Server className="w-5 h-5" />;
  }
};

const getStatusIndicator = (status: string) => {
  switch (status) {
    case 'online': return 'status-online';
    case 'warning': return 'status-warning';
    case 'critical': return 'status-danger';
    case 'offline': return 'status-offline';
    default: return 'status-offline';
  }
};

const UsageBar = ({ value, label }: { value: number; label: string }) => {
  const getColor = () => {
    if (value >= 90) return 'bg-red-500';
    if (value >= 75) return 'bg-orange-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className={value >= 90 ? 'text-primary' : 'text-foreground'}>{value}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${getColor()} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

const emptyServer: ServerInput = {
  name: '',
  ip_address: '',
  server_type: 'vm',
  status: 'online',
  cpu_usage: 0,
  memory_usage: 0,
  disk_usage: 0,
  os: '',
};

const Servers = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: servers, isLoading } = useServers();
  const createServer = useCreateServer();
  const updateServer = useUpdateServer();
  const deleteServer = useDeleteServer();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServerInput>(emptyServer);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleAdd = () => {
    setEditingId(null);
    setFormData(emptyServer);
    setIsDialogOpen(true);
  };

  const handleEdit = (server: typeof servers extends (infer T)[] ? T : never) => {
    setEditingId(server.id);
    setFormData({
      name: server.name,
      ip_address: server.ip_address,
      server_type: server.server_type as ServerInput['server_type'],
      status: server.status as ServerInput['status'],
      cpu_usage: Number(server.cpu_usage),
      memory_usage: Number(server.memory_usage),
      disk_usage: Number(server.disk_usage),
      os: server.os || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this server?')) {
      deleteServer.mutate(id);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.ip_address) {
      return;
    }

    if (editingId) {
      updateServer.mutate({ id: editingId, ...formData });
    } else {
      createServer.mutate(formData);
    }
    setIsDialogOpen(false);
  };

  return (
    <Sidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl tracking-wider text-foreground">
              SERVER MANAGEMENT
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage your infrastructure
            </p>
          </div>
          <button onClick={handleAdd} className="cyber-btn flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Server
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="cyber-card p-4">
            <div className="text-2xl font-display font-bold text-cyber-green">
              {servers?.filter(s => s.status === 'online').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Online</div>
          </div>
          <div className="cyber-card p-4">
            <div className="text-2xl font-display font-bold text-cyber-yellow">
              {servers?.filter(s => s.status === 'warning').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Warning</div>
          </div>
          <div className="cyber-card p-4">
            <div className="text-2xl font-display font-bold text-primary">
              {servers?.filter(s => s.status === 'critical').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </div>
          <div className="cyber-card p-4">
            <div className="text-2xl font-display font-bold text-muted-foreground">
              {servers?.filter(s => s.status === 'offline').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Offline</div>
          </div>
        </div>

        {/* Server List */}
        <div className="cyber-card p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : servers?.length === 0 ? (
            <div className="text-center py-12">
              <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-display">No Servers</h3>
              <p className="text-muted-foreground mt-1">Add your first server to start monitoring</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {servers?.map((server) => (
                <div
                  key={server.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${
                    server.status === 'critical' ? 'cyber-card-danger' : 
                    server.status === 'warning' ? 'border-cyber-yellow/30 bg-secondary/30' :
                    'bg-secondary/30 border-border'
                  }`}
                  onClick={() => navigate(`/servers/${server.id}`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(server.server_type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm tracking-wide">{server.name}</span>
                          <span className={getStatusIndicator(server.status)} />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">{server.ip_address}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEdit(server)}
                        className="p-1.5 rounded bg-secondary hover:bg-secondary/80"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(server.id)}
                        className="p-1.5 rounded bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {server.status !== 'offline' && (
                    <div className="space-y-2">
                      <UsageBar value={Number(server.cpu_usage)} label="CPU" />
                      <UsageBar value={Number(server.memory_usage)} label="Memory" />
                      <UsageBar value={Number(server.disk_usage)} label="Disk" />
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono">{server.os}</span>
                    {server.status === 'online' ? (
                      <Wifi className="w-4 h-4 text-cyber-green" />
                    ) : server.status === 'offline' ? (
                      <WifiOff className="w-4 h-4 text-muted-foreground" />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingId ? 'Edit Server' : 'Add New Server'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground uppercase tracking-wider">Server Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., web-server-01"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground uppercase tracking-wider">IP Address *</label>
              <Input
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                placeholder="e.g., 192.168.1.100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground uppercase tracking-wider">Type</label>
                <select
                  value={formData.server_type}
                  onChange={(e) => setFormData({ ...formData, server_type: e.target.value as ServerInput['server_type'] })}
                  className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-md text-foreground"
                >
                  <option value="proxmox">Proxmox</option>
                  <option value="vm">Virtual Machine</option>
                  <option value="container">Container</option>
                  <option value="physical">Physical</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground uppercase tracking-wider">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ServerInput['status'] })}
                  className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-md text-foreground"
                >
                  <option value="online">Online</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground uppercase tracking-wider">Operating System</label>
              <Input
                value={formData.os}
                onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                placeholder="e.g., Ubuntu 22.04"
              />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsDialogOpen(false)} className="cyber-btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="cyber-btn" disabled={!formData.name || !formData.ip_address}>
              {editingId ? 'Save Changes' : 'Add Server'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};

export default Servers;
