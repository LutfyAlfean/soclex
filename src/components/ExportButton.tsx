import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { useThreats } from '@/hooks/useThreats';
import { useServers } from '@/hooks/useServers';
import { useAlerts } from '@/hooks/useAlerts';
import { exportSecurityReport } from '@/utils/exportPdf';
import { toast } from '@/hooks/use-toast';

const ExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { data: threats } = useThreats();
  const { data: servers } = useServers();
  const { data: alerts } = useAlerts();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      exportSecurityReport(
        threats || [],
        servers || [],
        alerts || []
      );
      
      toast({
        title: 'Report Generated',
        description: 'Security report has been downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF report.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="cyber-btn flex items-center gap-2"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      Export PDF
    </button>
  );
};

export default ExportButton;
