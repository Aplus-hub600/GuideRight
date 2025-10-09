import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useScreenshot } from "@/hooks/useScreenshot";
import { useToast } from "@/hooks/use-toast";

interface ScreenshotFABProps {
  elementId: string;
  viewName: string;
  className?: string;
}

export function ScreenshotFAB({ elementId, viewName, className }: ScreenshotFABProps) {
  const { captureScreenshot, copyToClipboard, isCapturing } = useScreenshot();
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      await captureScreenshot(elementId, viewName);
      toast({
        title: "Screenshot saved",
        description: `${viewName} screenshot downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Screenshot failed",
        description: "Unable to capture screenshot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(elementId);
      toast({
        title: "Copied to clipboard",
        description: `${viewName} screenshot copied successfully`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy screenshot. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className={`rounded-full shadow-lg ${className}`}
          disabled={isCapturing}
          data-testid={`button-screenshot-${viewName}`}
        >
          <Camera className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownload} data-testid={`menu-screenshot-download-${viewName}`}>
          Download PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy} data-testid={`menu-screenshot-copy-${viewName}`}>
          Copy to Clipboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
