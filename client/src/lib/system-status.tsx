import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type SystemMode = "live" | "updating" | "degraded" | "offline";

export interface SystemStatus {
  mode: SystemMode;
  message: string;
  lastSuccessfulUpdate: Date | null;
  confidenceDecay: number; // 0-1, how much confidence should be reduced
  cachedDataAge: number | null; // minutes since last fresh data
  errorCode?: string;
  retryCount?: number;
}

interface SystemStatusContextType {
  status: SystemStatus;
  setDegradedMode: (errorCode: string, message: string) => void;
  setUpdatingMode: (message?: string) => void;
  setLiveMode: () => void;
  setOfflineMode: () => void;
  recordSuccess: () => void;
}

const defaultStatus: SystemStatus = {
  mode: "live",
  message: "System operational",
  lastSuccessfulUpdate: null,
  confidenceDecay: 0,
  cachedDataAge: null,
};

const SystemStatusContext = createContext<SystemStatusContextType | null>(null);

export function SystemStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SystemStatus>(defaultStatus);

  const calculateConfidenceDecay = useCallback((lastSuccess: Date | null): number => {
    if (!lastSuccess) return 0.3; // No data yet, moderate decay
    
    const ageMinutes = (Date.now() - lastSuccess.getTime()) / (1000 * 60);
    
    if (ageMinutes < 5) return 0;
    if (ageMinutes < 15) return 0.1;
    if (ageMinutes < 30) return 0.2;
    if (ageMinutes < 60) return 0.3;
    return 0.5; // Very stale data
  }, []);

  const calculateCachedDataAge = useCallback((lastSuccess: Date | null): number | null => {
    if (!lastSuccess) return null;
    return Math.floor((Date.now() - lastSuccess.getTime()) / (1000 * 60));
  }, []);

  const setDegradedMode = useCallback((errorCode: string, message: string) => {
    setStatus(prev => ({
      ...prev,
      mode: "degraded",
      message,
      errorCode,
      confidenceDecay: calculateConfidenceDecay(prev.lastSuccessfulUpdate),
      cachedDataAge: calculateCachedDataAge(prev.lastSuccessfulUpdate),
      retryCount: (prev.retryCount || 0) + 1,
    }));
  }, [calculateConfidenceDecay, calculateCachedDataAge]);

  const setUpdatingMode = useCallback((message?: string) => {
    setStatus(prev => ({
      ...prev,
      mode: "updating",
      message: message || "Updating intelligence data...",
    }));
  }, []);

  const setLiveMode = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      mode: "live",
      message: "System operational",
      confidenceDecay: 0,
      errorCode: undefined,
      retryCount: 0,
    }));
  }, []);

  const setOfflineMode = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      mode: "offline",
      message: "Network connection unavailable",
      confidenceDecay: calculateConfidenceDecay(prev.lastSuccessfulUpdate),
      cachedDataAge: calculateCachedDataAge(prev.lastSuccessfulUpdate),
    }));
  }, [calculateConfidenceDecay, calculateCachedDataAge]);

  const recordSuccess = useCallback(() => {
    const now = new Date();
    setStatus(prev => ({
      ...prev,
      mode: "live",
      message: "System operational",
      lastSuccessfulUpdate: now,
      confidenceDecay: 0,
      cachedDataAge: 0,
      errorCode: undefined,
      retryCount: 0,
    }));
  }, []);

  // Update cached data age periodically when in degraded mode
  useEffect(() => {
    if (status.mode !== "degraded" && status.mode !== "offline") return;
    
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        cachedDataAge: calculateCachedDataAge(prev.lastSuccessfulUpdate),
        confidenceDecay: calculateConfidenceDecay(prev.lastSuccessfulUpdate),
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [status.mode, calculateCachedDataAge, calculateConfidenceDecay]);

  // Poll stress metrics to detect degraded mode from injected failures
  useEffect(() => {
    const checkStressMetrics = async () => {
      try {
        const response = await fetch('/api/stress/metrics');
        if (response.ok) {
          const data = await response.json();
          // Response format is { success: true, metrics: { quotaExceeded, rateLimit, serverError, malformedJson, latencyInjected } }
          const metrics = data.metrics || {};
          const totalFailures = (metrics.quotaExceeded || 0) + 
                               (metrics.rateLimit || 0) + 
                               (metrics.serverError || 0) + 
                               (metrics.malformedJson || 0);
          
          // If stress testing is active and failures are being injected
          if (totalFailures > 0 && status.mode === "live") {
            setDegradedMode("stress_test", "Stress testing active - degraded mode simulated");
          }
          // Reset to live when no recent failures
          if (totalFailures === 0 && status.mode === "degraded" && status.errorCode === "stress_test") {
            setLiveMode();
          }
        }
      } catch {
        // Ignore errors during metrics check
      }
    };
    
    const interval = setInterval(checkStressMetrics, 10000); // Check every 10 seconds
    checkStressMetrics(); // Initial check
    
    return () => clearInterval(interval);
  }, [status.mode, status.errorCode, setDegradedMode, setLiveMode]);

  return (
    <SystemStatusContext.Provider
      value={{
        status,
        setDegradedMode,
        setUpdatingMode,
        setLiveMode,
        setOfflineMode,
        recordSuccess,
      }}
    >
      {children}
    </SystemStatusContext.Provider>
  );
}

export function useSystemStatus(): SystemStatusContextType {
  const context = useContext(SystemStatusContext);
  if (!context) {
    throw new Error("useSystemStatus must be used within SystemStatusProvider");
  }
  return context;
}

// Hook to apply confidence decay to a confidence value
export function useAdjustedConfidence(rawConfidence: number): number {
  const { status } = useSystemStatus();
  return Math.max(0, rawConfidence * (1 - status.confidenceDecay));
}
