import { useCallback } from "react";
import { useSystemStatus } from "@/lib/system-status";
import { apiRequest } from "@/lib/queryClient";

interface DegradedModeResponse {
  success: false;
  error: string;
  mode: "DEGRADED_MODE";
  errorCode: string;
  cachedResult?: any;
}

function isDegradedResponse(data: any): data is DegradedModeResponse {
  return data && data.mode === "DEGRADED_MODE";
}

export function useApiWithStatus() {
  const { setDegradedMode, setUpdatingMode, setLiveMode, recordSuccess } = useSystemStatus();

  const fetchWithStatus = useCallback(
    async <T>(url: string, options?: RequestInit): Promise<T> => {
      setUpdatingMode();
      
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (response.status === 503 && isDegradedResponse(data)) {
          setDegradedMode(data.errorCode, data.error);
          if (data.cachedResult) {
            return data.cachedResult as T;
          }
          throw new Error(data.error);
        }
        
        if (response.ok) {
          recordSuccess();
          return data as T;
        }
        
        throw new Error(data.error || `Request failed: ${response.status}`);
      } catch (error: any) {
        if (error.message?.includes("NetworkError") || error.message?.includes("Failed to fetch")) {
          setDegradedMode("network_error", "Network connection unavailable");
        }
        throw error;
      }
    },
    [setDegradedMode, setUpdatingMode, recordSuccess]
  );

  const postWithStatus = useCallback(
    async <T>(url: string, body: any): Promise<T> => {
      return fetchWithStatus<T>(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    [fetchWithStatus]
  );

  return { fetchWithStatus, postWithStatus, setLiveMode };
}

export function handleApiResponse<T>(
  response: Response,
  data: any,
  systemStatus: ReturnType<typeof useSystemStatus>
): T {
  const { setDegradedMode, recordSuccess } = systemStatus;
  
  if (response.status === 503 && isDegradedResponse(data)) {
    setDegradedMode(data.errorCode, data.error);
    if (data.cachedResult) {
      return data.cachedResult as T;
    }
    throw new Error(data.error);
  }
  
  if (response.ok && data.success !== false) {
    recordSuccess();
  }
  
  return data as T;
}
