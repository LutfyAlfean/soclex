import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { useTickets, useUpdateTicket, useDeleteTicket, Ticket } from '@/hooks/useTickets';
import { 
  Ticket as TicketIcon, 
  Plus, 
  RefreshCw, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const getStatusConfig = (status: Ticket['status']) => {
  switch (status) {
    case 'open':
      return { icon: AlertCircle, color: 'text-cyber-yellow', bg: 'bg-cyber-yellow/20', label: 'Open' };
    case 'in_progress':
      return { icon: Clock, color: 'text-cyber-blue', bg: 'bg-cyber-blue/20', label: 'In Progress' };
    case 'resolved':
      return { icon: CheckCircle, color: 'text-cyber-green', bg: 'bg-cyber-green/20', label: 'Resolved' };
    case 'closed':
      return { icon: XCircle, color: 'text-muted-foreground', bg: 'bg-secondary', label: 'Closed' };
  }
};

const getPriorityColor = (priority: Ticket['priority']) => {
  switch (priority) {
    case 'critical': return 'text-primary bg-primary/20';
    case 'high': return 'text-cyber-orange bg-cyber-orange/20';
    case 'medium': return 'text-cyber-yellow bg-cyber-yellow/20';
    case 'low': return 'text-cyber-green bg-cyber-green/20';
  }
};

const Tickets = () => {
  const { isAuthenticated } = useAuth();
  const { data: tickets, isLoading } = useTickets();
  const updateTicket = useUpdateTicket();
  const deleteTicket = useDeleteTicket();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Ticket['status'] | 'all'>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '' as Ticket['status'],
    assigned_to: '',
    resolution_notes: '',
  });

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const filteredTickets = tickets?.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditForm({
      status: ticket.status,
      assigned_to: ticket.assigned_to || '',
      resolution_notes: ticket.resolution_notes || '',
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedTicket) {
      updateTicket.mutate({
        id: selectedTicket.id,
        status: editForm.status,
        assigned_to: editForm.assigned_to || null,
        resolution_notes: editForm.resolution_notes || null,
      });
      setIsEditOpen(false);
    }
  };

  const handleDeleteTicket = (id: string) => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      deleteTicket.mutate(id);
    }
  };

  const stats = {
    open: tickets?.filter(t => t.status === 'open').length || 0,
    in_progress: tickets?.filter(t => t.status === 'in_progress').length || 0,
    resolved: tickets?.filter(t => t.status === 'resolved').length || 0,
    closed: tickets?.filter(t => t.status === 'closed').length || 0,
  };

  return (
    <Sidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl tracking-wider text-foreground">
              TICKET MANAGEMENT
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track security incident tickets
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="cyber-card p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-cyber-yellow" />
              <div>
                <div className="text-2xl font-display font-bold">{stats.open}</div>
                <div className="text-sm text-muted-foreground">Open</div>
              </div>
            </div>
          </div>
          <div className="cyber-card p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-cyber-blue" />
              <div>
                <div className="text-2xl font-display font-bold">{stats.in_progress}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
            </div>
          </div>
          <div className="cyber-card p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-cyber-green" />
              <div>
                <div className="text-2xl font-display font-bold">{stats.resolved}</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
            </div>
          </div>
          <div className="cyber-card p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-muted-foreground" />
              <div>
                <div className="text-2xl font-display font-bold">{stats.closed}</div>
                <div className="text-sm text-muted-foreground">Closed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="cyber-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              {(['all', 'open', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                    statusFilter === status
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {status.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ticket List */}
        <div className="cyber-card p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <TicketIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-display">No Tickets Found</h3>
              <p className="text-muted-foreground mt-1">
                Create tickets from the Threat Monitor page
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => {
                const statusConfig = getStatusConfig(ticket.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-lg border border-border bg-secondary/30 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                          <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-sm text-muted-foreground">
                              {ticket.ticket_number}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-mono ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority.toUpperCase()}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-mono ${statusConfig.bg} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <h4 className="font-display text-foreground">{ticket.title}</h4>
                          {ticket.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {ticket.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Created: {format(new Date(ticket.created_at), 'MMM d, yyyy HH:mm')}</span>
                            {ticket.assigned_to && (
                              <span>Assigned to: {ticket.assigned_to}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditTicket(ticket)}
                          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="p-2 rounded-lg bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Edit Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground uppercase tracking-wider">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Ticket['status'] })}
                className="w-full mt-1 px-4 py-3 bg-input border border-border rounded-md text-foreground"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground uppercase tracking-wider">Assigned To</label>
              <Input
                value={editForm.assigned_to}
                onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                placeholder="Enter assignee name"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground uppercase tracking-wider">Resolution Notes</label>
              <Textarea
                value={editForm.resolution_notes}
                onChange={(e) => setEditForm({ ...editForm, resolution_notes: e.target.value })}
                placeholder="Add notes about the resolution..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsEditOpen(false)} className="cyber-btn-secondary">
              Cancel
            </button>
            <button onClick={handleSaveEdit} className="cyber-btn">
              Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};

export default Tickets;
