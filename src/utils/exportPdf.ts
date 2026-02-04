import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface ThreatData {
  ip_address: string;
  threat_type: string;
  severity: string;
  country: string | null;
  description: string | null;
  detected_at: string;
  is_resolved: boolean;
}

interface ServerData {
  name: string;
  ip_address: string;
  server_type: string;
  status: string;
  cpu_usage: number | null;
  memory_usage: number | null;
  disk_usage: number | null;
  os: string | null;
}

interface AlertData {
  title: string;
  message: string;
  severity: string;
  source: string | null;
  created_at: string;
}

export const exportSecurityReport = (
  threats: ThreatData[],
  servers: ServerData[],
  alerts: AlertData[]
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('SOCLEX SECURITY REPORT', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, pageWidth / 2, 32, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Summary Stats
  let yPos = 55;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE SUMMARY', 14, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const criticalThreats = threats.filter(t => t.severity === 'critical').length;
  const highThreats = threats.filter(t => t.severity === 'high').length;
  const onlineServers = servers.filter(s => s.status === 'online').length;
  const criticalServers = servers.filter(s => s.status === 'critical').length;
  
  doc.text(`Total Threats Detected: ${threats.length}`, 14, yPos);
  doc.text(`Critical Threats: ${criticalThreats}`, 100, yPos);
  yPos += 7;
  doc.text(`High Severity Threats: ${highThreats}`, 14, yPos);
  doc.text(`Resolved Threats: ${threats.filter(t => t.is_resolved).length}`, 100, yPos);
  yPos += 7;
  doc.text(`Total Servers: ${servers.length}`, 14, yPos);
  doc.text(`Online: ${onlineServers} | Critical: ${criticalServers}`, 100, yPos);
  yPos += 7;
  doc.text(`Total Alerts: ${alerts.length}`, 14, yPos);
  
  // Threats Section
  yPos += 15;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('THREAT ANALYSIS', 14, yPos);
  
  if (threats.length > 0) {
    autoTable(doc, {
      head: [['IP Address', 'Type', 'Severity', 'Country', 'Status', 'Detected']],
      body: threats.slice(0, 20).map(t => [
        t.ip_address,
        t.threat_type,
        t.severity.toUpperCase(),
        t.country || 'Unknown',
        t.is_resolved ? 'Resolved' : 'Active',
        format(new Date(t.detected_at), 'MMM d, HH:mm'),
      ]),
      startY: yPos + 5,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
      styles: { fontSize: 9 },
    });
  } else {
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('No threats detected.', 14, yPos);
  }
  
  // New page for servers
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVER STATUS', 14, yPos);
  
  if (servers.length > 0) {
    autoTable(doc, {
      head: [['Server Name', 'IP Address', 'Type', 'Status', 'CPU %', 'Memory %', 'Disk %']],
      body: servers.map(s => [
        s.name,
        s.ip_address,
        s.server_type,
        s.status.toUpperCase(),
        `${s.cpu_usage ?? 0}%`,
        `${s.memory_usage ?? 0}%`,
        `${s.disk_usage ?? 0}%`,
      ]),
      startY: yPos + 5,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
      styles: { fontSize: 9 },
    });
  } else {
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('No servers registered.', 14, yPos);
  }
  
  // Alerts Section
  const lastTableY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
  yPos = lastTableY ? lastTableY + 15 : yPos + 15;
  
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RECENT ALERTS', 14, yPos);
  
  if (alerts.length > 0) {
    autoTable(doc, {
      head: [['Title', 'Message', 'Severity', 'Source', 'Time']],
      body: alerts.slice(0, 20).map(a => [
        a.title,
        a.message.substring(0, 50) + (a.message.length > 50 ? '...' : ''),
        a.severity.toUpperCase(),
        a.source || '-',
        format(new Date(a.created_at), 'MMM d, HH:mm'),
      ]),
      startY: yPos + 5,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38] },
      styles: { fontSize: 9 },
    });
  } else {
    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('No recent alerts.', 14, yPos);
  }
  
  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `SOCLEX Security Report - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  doc.save(`soclex-security-report-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`);
};
