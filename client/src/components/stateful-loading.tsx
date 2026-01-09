import { cn } from "@/lib/utils";
import { Clock, RefreshCw } from "lucide-react";

interface StatefulLoadingProps {
  isLoading: boolean;
  message?: string;
  lastUpdated?: Date | null;
  className?: string;
  children: React.ReactNode;
}

export function StatefulLoading({ 
  isLoading, 
  message = "Updating...", 
  lastUpdated,
  className,
  children 
}: StatefulLoadingProps) {
  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "transition-opacity duration-150",
        isLoading && "opacity-50"
      )}>
        {children}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-md border shadow-sm">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>{message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  message: string;
  sourcesCount?: number;
  lastUpdated?: Date | null;
}

export function LoadingOverlay({ message, sourcesCount, lastUpdated }: LoadingOverlayProps) {
  return (
    <div className="bg-card/95 backdrop-blur border rounded-md px-4 py-3 space-y-1">
      <div className="flex items-center gap-2 text-sm font-medium">
        <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
        <span>{message}</span>
      </div>
      {sourcesCount !== undefined && (
        <p className="text-xs text-muted-foreground pl-6">
          Processing {sourcesCount} source{sourcesCount !== 1 ? 's' : ''}
        </p>
      )}
      {lastUpdated && (
        <p className="text-xs text-muted-foreground pl-6 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Last update: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

export function DataPlaceholder({ 
  title, 
  description 
}: { 
  title: string; 
  description?: string; 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
      )}
    </div>
  );
}
