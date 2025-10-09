import { useState } from 'react';
import html2canvas from 'html2canvas';

interface ScreenshotOptions {
  filename?: string;
  quality?: number;
}

export function useScreenshot() {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = async (
    elementId: string,
    viewName: string,
    options: ScreenshotOptions = {}
  ): Promise<void> => {
    try {
      setIsCapturing(true);

      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }

      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        logging: false,
      });

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error('Failed to create blob from canvas');
          }

          // Create download link
          const url = URL.createObjectURL(blob);
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
          const filename = options.filename || `guideright-${viewName}-${timestamp}.png`;

          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up
          URL.revokeObjectURL(url);
          setIsCapturing(false);
        },
        'image/png',
        options.quality || 0.95
      );
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      setIsCapturing(false);
      throw error;
    }
  };

  const copyToClipboard = async (elementId: string): Promise<void> => {
    try {
      setIsCapturing(true);

      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to create blob from canvas');
        }

        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setIsCapturing(false);
        } catch (clipboardError) {
          console.error('Failed to copy to clipboard:', clipboardError);
          setIsCapturing(false);
          throw clipboardError;
        }
      }, 'image/png');
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      setIsCapturing(false);
      throw error;
    }
  };

  return {
    captureScreenshot,
    copyToClipboard,
    isCapturing,
  };
}
