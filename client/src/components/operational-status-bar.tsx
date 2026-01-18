import { WifiOff, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OperationalStatusBarProps {
  className?: string;
}

export function OperationalStatusBar({ className }: OperationalStatusBarProps) {
  return (
    <div className={cn(
      "flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b text-[10px] text-muted-foreground",
      className
    )}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3" />
          <span>All queries logged for audit and OPSEC review</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          <span>Last sync: Just now</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 text-amber-600">
        <WifiOff className="h-3 w-3" />
        <span>Offline cache: Not available</span>
      </div>
    </div>
  );
}

export default OperationalStatusBar;
