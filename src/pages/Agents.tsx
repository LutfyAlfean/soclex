import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { useAgents } from '@/hooks/useAgents';
import { useServers } from '@/hooks/useServers';
import { useCreateAgent, useUpdateAgent, useDeleteAgentMutation, AgentInput } from '@/hooks/useAgentsCrud';
import { Shield, Plus, Edit, Trash2, RefreshCw, Terminal, Copy, Check, Wifi, WifiOff, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'connected': return { color: 'text-cyber-green', bg: 'bg-cyber-green/20', label: 'Connected', icon: Wifi };
    case 'disconnected': return { color: 'text-primary', bg: 'bg-primary/20', label: 'Disconnected', icon: WifiOff };
    case 'pending': return { color: 'text-cyber-yellow', bg: 'bg-cyber-yellow/20', label: 'Pending', icon: Clock };
    default: return { color: 'text-muted-foreground', bg: 'bg-secondary', label: 'Unknown', icon: Shield };
  }
};

const emptyAgent: AgentInput = { hostname: '', ip_address: '', os: '', version: '1.0.0', status: 'pending', server_id: null };

const Agents = () => {
  const { isAuthenticated } = useAuth();
  const { data: agents, isLoading } = useAgents();
  const { data: servers } = useServers();
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgentMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AgentInput>(emptyAgent);
  const [copied, setCopied] = useState(false);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const serverIp = window.location.hostname || 'YOUR_SOCLEX_SERVER_IP';
  const installCommand = `curl -sSL https://${serverIp}/install-agent.sh | sudo bash -s -- --server=${serverIp} --port=9200 --key=YOUR_API_KEY`;
  const handleCopy = () => { navigator.clipboard.writeText(installCommand); setCopied(true); toast({ title: 'Copied!', description: 'Install command copied to clipboard' }); setTimeout(() => setCopied(false), 2000); };
  const handleAdd = () => { setEditingId(null); setFormData(emptyAgent); setIsDialogOpen(true); };
  const handleEdit = (agent: NonNullable<typeof agents>[0]) => { setEditingId(agent.id); setFormData({ hostname: agent.hostname, ip_address: agent.ip_address, os: agent.os || '', version: agent.version || '1.0.0', status: agent.status as AgentInput['status'], server_id: agent.server_id }); setIsDialogOpen(true); };
  const handleDelete = (id: string) => { if (confirm('Delete this agent?')) deleteAgent.mutate(id); };
  const handleSave = () => { if (!formData.hostname || !formData.ip_address) return; editingId ? updateAgent.mutate({ id: editingId, ...formData }) : createAgent.mutate(formData); setIsDialogOpen(false); };

  const stats = { connected: agents?.filter(a => a.status === 'connected').length || 0, disconnected: agents?.filter(a => a.status === 'disconnected').length || 0, pending: agents?.filter(a => a.status === 'pending').length || 0 };

  return (
    <Sidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="font-display text-2xl lg:text-3xl tracking-wider text-foreground">AGENT MANAGEMENT</h1><p className="text-muted-foreground mt-1">Deploy and manage SOCLEX agents</p></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsInstallOpen(true)} className="cyber-btn-secondary flex items-center gap-2"><Terminal className="w-4 h-4" />Install Guide</button>
            <button onClick={handleAdd} className="cyber-btn flex items-center gap-2"><Plus className="w-4 h-4" />Add Agent</button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="cyber-card p-4 cyber-card-safe"><div className="flex items-center gap-3"><Wifi className="w-8 h-8 text-cyber-green" /><div><div className="text-2xl font-display font-bold">{stats.connected}</div><div className="text-sm text-muted-foreground">Connected</div></div></div></div>
          <div className="cyber-card p-4 cyber-card-danger"><div className="flex items-center gap-3"><WifiOff className="w-8 h-8 text-primary" /><div><div className="text-2xl font-display font-bold">{stats.disconnected}</div><div className="text-sm text-muted-foreground">Disconnected</div></div></div></div>
          <div className="cyber-card p-4"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-cyber-yellow" /><div><div className="text-2xl font-display font-bold">{stats.pending}</div><div className="text-sm text-muted-foreground">Pending</div></div></div></div>
        </div>
        <div className="cyber-card p-6">
          <h3 className="font-display text-lg tracking-wider text-foreground mb-4">REGISTERED AGENTS</h3>
          {isLoading ? <div className="flex items-center justify-center h-48"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div> : agents?.length === 0 ? (
            <div className="text-center py-12"><Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-display">No Agents Registered</h3><button onClick={() => setIsInstallOpen(true)} className="cyber-btn mt-4">View Installation Guide</button></div>
          ) : (
            <div className="space-y-3">{agents?.map((agent) => { const cfg = getStatusConfig(agent.status); const Icon = cfg.icon; return (
              <div key={agent.id} className={`p-4 rounded-lg border ${agent.status === 'connected' ? 'border-cyber-green/30 bg-cyber-green/5' : agent.status === 'disconnected' ? 'border-primary/30 bg-primary/5' : 'border-border bg-secondary/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4"><div className={`p-2 rounded-lg ${cfg.bg}`}><Icon className={`w-5 h-5 ${cfg.color}`} /></div>
                    <div><div className="flex items-center gap-2 mb-1"><span className="font-display">{agent.hostname}</span><span className={`px-2 py-0.5 rounded text-xs font-mono ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></div>
                      <div className="text-xs text-muted-foreground font-mono">IP: {agent.ip_address} • OS: {agent.os || 'Unknown'} • v{agent.version || '1.0.0'}</div>
                      {agent.last_heartbeat && <div className="text-xs text-muted-foreground mt-1">Last: {format(new Date(agent.last_heartbeat), 'MMM d, HH:mm')}</div>}</div></div>
                  <div className="flex items-center gap-2"><button onClick={() => handleEdit(agent)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80"><Edit className="w-4 h-4" /></button><button onClick={() => handleDelete(agent.id)} className="p-2 rounded-lg bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary"><Trash2 className="w-4 h-4" /></button></div>
                </div></div>); })}</div>
          )}
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogContent><DialogHeader><DialogTitle className="font-display">{editingId ? 'Edit Agent' : 'Add Agent'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4"><div><label className="text-sm text-muted-foreground uppercase">Hostname *</label><Input value={formData.hostname} onChange={(e) => setFormData({ ...formData, hostname: e.target.value })} /></div>
          <div><label className="text-sm text-muted-foreground uppercase">IP Address *</label><Input value={formData.ip_address} onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="text-sm text-muted-foreground uppercase">OS</label><Input value={formData.os} onChange={(e) => setFormData({ ...formData, os: e.target.value })} /></div>
            <div><label className="text-sm text-muted-foreground uppercase">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as AgentInput['status'] })} className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-md"><option value="pending">Pending</option><option value="connected">Connected</option><option value="disconnected">Disconnected</option></select></div></div></div>
        <DialogFooter><button onClick={() => setIsDialogOpen(false)} className="cyber-btn-secondary">Cancel</button><button onClick={handleSave} className="cyber-btn">Save</button></DialogFooter></DialogContent></Dialog>
      <Dialog open={isInstallOpen} onOpenChange={setIsInstallOpen}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle className="font-display text-lg">SOCLEX Agent Installation Guide</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <h4 className="font-display text-sm text-primary mb-2">⚠️ Prerequisites</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Root or sudo access on target server</li>
              <li>Network connectivity to SOCLEX server</li>
              <li>Port 9200 open for agent communication</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display text-sm mb-2">Step 1: Run Installation Command</h4>
            <p className="text-sm text-muted-foreground mb-2">Execute this on your target server (IP will be auto-detected):</p>
            <div className="flex gap-2"><code className="flex-1 p-3 bg-background rounded border text-xs overflow-x-auto break-all">{installCommand}</code><button onClick={handleCopy} className="p-2 rounded bg-secondary shrink-0">{copied ? <Check className="w-4 h-4 text-cyber-green" /> : <Copy className="w-4 h-4" />}</button></div>
          </div>
          
          <div>
            <h4 className="font-display text-sm mb-2">Step 2: Register in Dashboard</h4>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Go to <strong>Servers</strong> → Add the server first</li>
              <li>Go to <strong>Agents</strong> → Click "Add Agent"</li>
              <li>Enter hostname and IP from installation output</li>
              <li>Set status to "Pending"</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-display text-sm mb-2">Step 3: Verify & Activate</h4>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Check agent logs: <code className="bg-background px-1 rounded">journalctl -u soclex-agent -f</code></li>
              <li>Verify heartbeat is being sent</li>
              <li>Change agent status to "Connected"</li>
            </ol>
          </div>
          
          <div className="p-4 bg-cyber-green/10 border border-cyber-green/30 rounded-lg">
            <h4 className="font-display text-sm text-cyber-green mb-2">✓ Agent "Connected" Status Means:</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Heartbeats sent every 30 seconds</li>
              <li>System metrics (CPU, RAM, Disk) collected</li>
              <li>Security log monitoring active</li>
              <li>Failed login detection enabled</li>
            </ul>
          </div>
          
          <div className="p-4 bg-secondary/50 rounded-lg">
            <h4 className="font-display text-sm mb-2">Useful Commands</h4>
            <div className="text-xs font-mono space-y-1 text-muted-foreground">
              <div>Status: <code className="bg-background px-1 rounded">systemctl status soclex-agent</code></div>
              <div>Logs: <code className="bg-background px-1 rounded">journalctl -u soclex-agent -f</code></div>
              <div>Test: <code className="bg-background px-1 rounded">/opt/soclex-agent/soclex-agent --test-connection</code></div>
            </div>
          </div>
        </div>
        <DialogFooter><button onClick={() => setIsInstallOpen(false)} className="cyber-btn">Close</button></DialogFooter></DialogContent></Dialog>
    </Sidebar>
  );
};

export default Agents;
