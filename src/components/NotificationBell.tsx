import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAlerts, useUnreadAlertCount, useMarkAlertAsRead, useRealtimeAlerts } from '@/hooks/useAlerts';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'text-primary bg-primary/20';
    case 'high': return 'text-cyber-orange bg-cyber-orange/20';
    case 'medium': return 'text-cyber-yellow bg-cyber-yellow/20';
    case 'low': return 'text-cyber-blue bg-cyber-blue/20';
    default: return 'text-muted-foreground bg-secondary';
  }
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: alerts } = useAlerts();
  const { data: unreadCount } = useUnreadAlertCount();
  const markAsRead = useMarkAlertAsRead();
  
  // Subscribe to real-time alerts
  useRealtimeAlerts();

  const handleAlertClick = (alertId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate(alertId);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-xs font-bold flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b border-border">
          <h3 className="font-display tracking-wider">NOTIFICATIONS</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {alerts?.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            alerts?.slice(0, 20).map((alert) => (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert.id, alert.is_read)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors ${
                  !alert.is_read ? 'bg-secondary/30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      {!alert.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <h4 className="font-medium mt-1">{alert.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2 font-mono">
                  {format(new Date(alert.created_at), 'MMM d, HH:mm')}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
