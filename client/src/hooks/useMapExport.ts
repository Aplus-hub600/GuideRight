import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ExportData {
  timestamp: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  aoi?: {
    name?: string;
    lat: number;
    lng: number;
    radiusKm?: number;
  };
  activePanels?: {
    top: string | null;
    bottom: string | null;
  };
  filters?: any;
  metadata?: any;
}

export function useMapExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportMapData = async (data: ExportData) => {
    try {
      setIsExporting(true);

      const exportPayload = {
        ...data,
        timestamp: new Date().toISOString(),
        version: '1.0',
      };

      const jsonString = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `guideright-export-${timestamp}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: `Map data exported as ${filename}`,
      });

      return { success: true, filename, size: blob.size };
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "Unable to export map data. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsExporting(false);
    }
  };

  const fetchTestExport = async () => {
    try {
      const response = await fetch('/api/export/test');
      if (!response.ok) throw new Error('Test export failed');
      
      const data = await response.json();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'guideright-test-export.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toast({
        title: "Test export successful",
        description: "Test export downloaded successfully",
      });

      return { success: true };
    } catch (error) {
      console.error('Test export failed:', error);
      toast({
        title: "Test export failed",
        description: "Unable to fetch test export. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  return {
    exportMapData,
    fetchTestExport,
    isExporting,
  };
}
